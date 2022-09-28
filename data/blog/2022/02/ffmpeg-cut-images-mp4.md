---
title: "ffmpeg cut >images >mp4"
date: "2022-02-22"
categories: 
  - "memo"
---

```
ffmpeg -ss 00:01:00 -to 00:02:00  -i input.mp4 -c copy output.mp4

ffmpeg -ss 00:01:00 -t 00:00:10  -i input.mp4 -c copy output.mp4

ffmpeg -f image2 -r 60 -i path/filename%03d.jpg -vcodec libx264 -crf 18  -pix_fmt yuv420p test.mp4
f: force format
r: frame rate
i: input files assuming your files are filename001.jpg, filename002.jpg, ...
vcodec: video codec
crf: constant rate factor (0-51). 17-18 is (nearly) visually lossless. See Encode/H.264
pix_fmt: pixel format

ffmpeg.exe -r 24 -f image2 -i %05d.png -vcodec libx264 -crf 25  -pix_fmt yuv420p ..\test2.mp4

ffmpeg.exe  -i "input.mp4" -vf fps=2 output\%06d.png

```
