#!/bin/sh
# Susun video akhir. Setiap adegan satu berkas, semua 1280x720 24 fps, lalu concat -c copy, lalu suara.
set -e
cd /tmp/vid
ENC="-c:v libx264 -crf 18 -preset veryfast -pix_fmt yuv420p -r 24"
GRADE="crop=1280:536:0:92,eq=contrast=1.07:saturation=1.15:gamma=0.97,colorbalance=rs=.03:bs=-.03:rh=.04:bh=-.02,vignette=PI/4.5,noise=alls=6:allf=t+u,pad=1280:720:0:92:black"
for s in a b c d e f; do
  [ -f f_$s/0000.jpg ] || { echo "adegan $s belum ada"; exit 1; }
  N=$(ls f_$s/*.jpg | wc -l); D=$(python3 -c "print($N/24)"); FO=$(python3 -c "print($N/24-0.35)")
  ffmpeg -hide_banner -loglevel error -y -framerate 24 -i f_$s/%04d.jpg -loop 1 -framerate 24 -i ov_$s.png \
   -filter_complex "[0:v]$GRADE[g];[1:v]format=rgba,fade=in:st=0.4:d=0.5:alpha=1[o];[g][o]overlay=0:0:shortest=1,fade=t=in:st=0:d=0.3,fade=t=out:st=$FO:d=0.35,format=yuv420p[v]" \
   -map "[v]" $ENC -t $D tmp_$s.mp4 && mv tmp_$s.mp4 sc_$s.mp4
done
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i f_m/%04d.png $ENC tmp_m.mp4 && mv tmp_m.mp4 sc_m.mp4
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i outro.png -vf "loop=-1:1,trim=duration=4,fade=t=in:st=0:d=0.5,fade=t=out:st=3.4:d=0.6,format=yuv420p" $ENC tmp_o.mp4 && mv tmp_o.mp4 sc_o.mp4
printf "file 'sc_a.mp4'\nfile 'sc_m.mp4'\nfile 'sc_b.mp4'\nfile 'sc_c.mp4'\nfile 'sc_d.mp4'\nfile 'sc_e.mp4'\nfile 'sc_f.mp4'\nfile 'sc_o.mp4'\n" > daftar.txt
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i daftar.txt -c copy tmp_v.mp4
ffmpeg -hide_banner -loglevel error -y -i tmp_v.mp4 -i musik.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest tmp_final.mp4 && mv tmp_final.mp4 Pos1_Tambal_Waduk.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 Pos1_Tambal_Waduk.mp4
