---
title: 'zoom video sdk 녹화 (canvas+audio dom+webcam)'
date: '2021-10-22'
categories:
  - 'code'
tags:
  - 'zoom-video-sdk'
  - 'recording'
  - '녹화'
---

# zoom 녹화 기능 구현

@zoom/videosdk 1.1.4 기준

zoom video sdk 에서 녹화가 없어서 직접 구현한다.

현재기준 sdk에 stream 관련 api는 없으므로 웹페이지에서 영상을 저장하고

vanila javascript로 접근한다.

canvas, audio, webcam 를 합쳐서 영상을 만든다.

화면 {'->'} canvas

음성 {'->'} audio dom (본인목소리 제외한음성) + webcam audio (본인목소리)

## 화면 캡쳐 (zoom 이 렌더링중인 canvas)

```js
const canvasStream = canvas.captureStream()
```

## 음성 캡쳐1 (zoom client audio dom)

zoom 객체 내부에서 audio dom 을 찾는다.

```js
const findSymbol = function (object, symbolName) {
  const prop = Object.getOwnPropertySymbols(object)
    .filter((x) => x.toString() == symbolName)
    .pop()
  if (!prop) return null
  return object[prop]
}

const streamSymbol = findSymbol(client.stream, 'Symbol(stream)')
const mediaCtx = findSymbol(streamSymbol, 'Symbol(mediaContext)')
const audioDomNode = mediaCtx.mediaAgent.instance.audioDomNode
if (audioDomNode) {
  const audioStream = audioDomNode.captureStream()
}
```

## 음성 캡쳐2 (webcam audio)

```js
const camAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
```

## 음성1,2 믹스

```js
const audioCtx = new AudioContext()
const mixedDest = audioCtx.createMediaStreamDestination()
const source1 = audioCtx.createMediaStreamSource(audioStream)
source1.connect(mixedDest)
const source2 = audioCtx.createMediaStreamSource(camAudioStream)
source2.connect(mixedDest)
//mixedDest.stream //mixed audio stream
```

## 화면 + 음성

```js
let outputTracks = []
outputTracks = outputTracks.concat(canvasStream.getTracks())
outputTracks = outputTracks.concat(mixedDest.stream.getAudioTracks())

let stream = new MediaStream(outputTracks)
```

## 영상 녹화

MediaRecorder를 이용해 stream을 인코딩 진행하면된다. 이후 저장은 websocket, ajax등을 이용하면 되겠다.
