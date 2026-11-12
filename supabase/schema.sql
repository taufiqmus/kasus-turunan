-- Skema Kasus Turunan. Jalankan sekali di Supabase: SQL Editor > New query > tempel > Run.
-- Aman dijalankan ulang. Tidak memerlukan secret key.
--
-- Sebelum dipakai, di dashboard Supabase buka Authentication > Sign In / Providers
-- dan MATIKAN "Allow new users to sign up". Akun dosen dibuat manual lewat
-- Authentication > Users > Add user. Tanpa ini, orang asing bisa mendaftar dan membuat sesi.

create extension if not exists pgcrypto;

create table if not exists public.sesi (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token       text not null unique check (token = upper(token) and length(token) between 4 and 20),
  nama        text not null check (length(nama) between 1 and 80),
  semesta     text not null default 'jalan-raya',
  status      text not null default 'open' check (status in ('open','closed')),
  batasi_nim  boolean not null default false,
  dibuat      timestamptz not null default now()
);

create table if not exists public.daftar_nim (
  sesi_id uuid not null references public.sesi(id) on delete cascade,
  nim     text not null check (nim ~ '^[0-9]{6,20}$'),
  primary key (sesi_id, nim)
);

-- Satu NIM = satu akun. NIM berfungsi sebagai PIN dan hanya terlihat oleh dosen.
create table if not exists public.mahasiswa (
  nim      text primary key check (nim ~ '^[0-9]{6,20}$'),
  username text not null check (length(username) between 2 and 14),
  kunci    uuid not null unique default gen_random_uuid(),
  dibuat   timestamptz not null default now()
);
create unique index if not exists mahasiswa_username_uniq on public.mahasiswa (lower(username));

create table if not exists public.peserta (
  sesi_id    uuid not null references public.sesi(id) on delete cascade,
  nim        text not null references public.mahasiswa(nim) on delete cascade,
  masuk_pada timestamptz not null default now(),
  primary key (sesi_id, nim)
);

create table if not exists public.hasil (
  sesi_id uuid not null references public.sesi(id) on delete cascade,
  nim     text not null references public.mahasiswa(nim) on delete cascade,
  kasus   text not null check (length(kasus) between 1 and 40),
  skor    int  not null check (skor between 0 and 1000),
  detik   int  not null check (detik between 0 and 86400),
  rincian jsonb not null default '{}'::jsonb check (pg_column_size(rincian) < 4096),
  dibuat  timestamptz not null default now(),
  primary key (sesi_id, nim, kasus)
);

alter table public.sesi       enable row level security;
alter table public.daftar_nim enable row level security;
alter table public.mahasiswa  enable row level security;
alter table public.peserta    enable row level security;
alter table public.hasil      enable row level security;

-- Anon tidak boleh menyentuh tabel sama sekali. Semua akses mahasiswa lewat fungsi di bawah.
revoke all on public.sesi, public.daftar_nim, public.mahasiswa, public.peserta, public.hasil from anon;

drop policy if exists sesi_owner on public.sesi;
create policy sesi_owner on public.sesi for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists daftar_owner on public.daftar_nim;
create policy daftar_owner on public.daftar_nim for all to authenticated
  using (exists (select 1 from public.sesi s where s.id = sesi_id and s.owner = auth.uid()))
  with check (exists (select 1 from public.sesi s where s.id = sesi_id and s.owner = auth.uid()));

drop policy if exists peserta_owner on public.peserta;
create policy peserta_owner on public.peserta for select to authenticated
  using (exists (select 1 from public.sesi s where s.id = sesi_id and s.owner = auth.uid()));

drop policy if exists hasil_owner on public.hasil;
create policy hasil_owner on public.hasil for select to authenticated
  using (exists (select 1 from public.sesi s where s.id = sesi_id and s.owner = auth.uid()));

drop policy if exists mahasiswa_owner on public.mahasiswa;
create policy mahasiswa_owner on public.mahasiswa for select to authenticated
  using (exists (select 1 from public.peserta p join public.sesi s on s.id = p.sesi_id
                 where p.nim = mahasiswa.nim and s.owner = auth.uid()));

-- Hak untuk dosen (lewat RLS di atas). Mahasiswa tidak punya hak tabel.
revoke all on public.sesi, public.daftar_nim, public.mahasiswa, public.peserta, public.hasil from authenticated;
grant select, insert, update, delete on public.sesi, public.daftar_nim to authenticated;
grant select on public.mahasiswa, public.peserta, public.hasil to authenticated;

-- ===== Fungsi untuk mahasiswa (dipanggil dengan publishable key) =====

create or replace function public.status_token(p_token text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('ada', true, 'status', s.status, 'nama', s.nama)
       from public.sesi s where s.token = upper(trim(p_token))),
    jsonb_build_object('ada', false));
$$;

create or replace function public.masuk(p_token text, p_username text, p_nim text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sesi public.sesi%rowtype;
  v_mhs  public.mahasiswa%rowtype;
  v_user text := trim(p_username);
  v_nim  text := trim(p_nim);
begin
  select * into v_sesi from public.sesi where token = upper(trim(p_token));
  if not found then raise exception 'Token tidak dikenal.'; end if;
  if v_sesi.status <> 'open' then raise exception 'Sesi ini sudah ditutup dosen.'; end if;
  if v_nim !~ '^[0-9]{6,20}$' then raise exception 'NIM harus berupa angka lengkap.'; end if;
  if length(v_user) < 2 or length(v_user) > 14 then raise exception 'Username 2 sampai 14 karakter.'; end if;
  if v_sesi.batasi_nim and not exists (select 1 from public.daftar_nim d where d.sesi_id = v_sesi.id and d.nim = v_nim) then
    raise exception 'NIM tidak terdaftar di sesi ini.';
  end if;

  select * into v_mhs from public.mahasiswa where nim = v_nim;
  if found then
    if lower(v_mhs.username) <> lower(v_user) then
      raise exception 'NIM ini sudah terdaftar dengan username lain.';
    end if;
  else
    if exists (select 1 from public.mahasiswa where lower(username) = lower(v_user)) then
      raise exception 'Username sudah dipakai, pilih yang lain.';
    end if;
    insert into public.mahasiswa (nim, username) values (v_nim, v_user) returning * into v_mhs;
  end if;

  insert into public.peserta (sesi_id, nim) values (v_sesi.id, v_nim) on conflict do nothing;
  return jsonb_build_object('kunci', v_mhs.kunci, 'username', v_mhs.username, 'sesi', v_sesi.nama);
end $$;

create or replace function public.simpan_hasil(p_kunci uuid, p_token text, p_kasus text, p_skor int, p_detik int, p_rincian jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_sesi public.sesi%rowtype;
  v_nim  text;
begin
  select nim into v_nim from public.mahasiswa where kunci = p_kunci;
  if v_nim is null then raise exception 'Akun tidak dikenal.'; end if;
  select * into v_sesi from public.sesi where token = upper(trim(p_token));
  if not found then raise exception 'Token tidak dikenal.'; end if;
  if v_sesi.status <> 'open' then raise exception 'Sesi ditutup, skor tidak disimpan.'; end if;
  if not exists (select 1 from public.peserta where sesi_id = v_sesi.id and nim = v_nim) then
    raise exception 'Kamu belum masuk ke sesi ini.';
  end if;
  insert into public.hasil (sesi_id, nim, kasus, skor, detik, rincian)
  values (v_sesi.id, v_nim, p_kasus, greatest(0, least(1000, p_skor)), greatest(0, least(86400, p_detik)), coalesce(p_rincian, '{}'::jsonb))
  on conflict (sesi_id, nim, kasus) do update
    set skor = excluded.skor, detik = excluded.detik, rincian = excluded.rincian, dibuat = now()
    where excluded.skor > public.hasil.skor
       or (excluded.skor = public.hasil.skor and excluded.detik < public.hasil.detik);
end $$;

create or replace function public.ranking(p_token text)
returns table (username text, skor int, detik int, urutan int)
language sql security definer set search_path = public as $$
  with t as (
    select m.username, sum(h.skor)::int as skor, sum(h.detik)::int as detik
      from public.hasil h
      join public.sesi s on s.id = h.sesi_id
      join public.mahasiswa m on m.nim = h.nim
     where s.token = upper(trim(p_token))
     group by m.username)
  select username, skor, detik, (row_number() over (order by skor desc, detik asc))::int
    from t order by skor desc, detik asc limit 50;
$$;

revoke all on function public.status_token(text), public.masuk(text,text,text),
  public.simpan_hasil(uuid,text,text,int,int,jsonb), public.ranking(text) from public;
grant execute on function public.status_token(text), public.masuk(text,text,text),
  public.simpan_hasil(uuid,text,text,int,int,jsonb), public.ranking(text) to anon, authenticated;
