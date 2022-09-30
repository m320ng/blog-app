---
title: '[node.js] Promise'
date: '2017-01-19'
categories:
  - 'code'
tags:
  - 'node-js'
  - 'promise'
---

Promise 연습

간단한 소스인 [IIS Log 월별로 압축하기](http://note.heyo.me/?p=881) 를 Promise 기반으로 변경해보았다.

확실히 간단한 소스인 만큼 Promise를 쓴 큰효과(?)를 볼 순 없었지만..

간단한 소스는 그냥 callback과 async 만으로도 충분한거 같긴하다.

확실히 명확해진만큼 stack과 catch사용은 전체적으로 소스관리가 수월해진다.

가장 깔끔하다고 보여지는 동기화식의 return 방식만큼은 아니지만 거기에 준할만큼 관리된다.

기존엔 stack는 고사하고 callback피라미드를 쌓다가 특정함수를 호출해서 goto구문같이 프로세스 흐름을 관리되었던거게 비하면야 훨씬 나은 방법같다.

source

```js
'use strict'

var fs = require('fs-promise')
var glob = require('glob-promise')
var path = require('path')
var archiver = require('archiver-promise')

var setting = {}
var today = ''

//global var
function load_setting() {
  return fs.readFile(__dirname + '/setting.json', 'utf8').then((raw) => {
    setting = JSON.parse(raw)

    // YYYYMMDD today
    let now = new Date()
    let t = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    today = t
      .map(function (item) {
        return item < 10 ? '0' + item : '' + item
      })
      .join('')

    return setting
  })
}

function start_app() {
  let start_date = ''
  let prefix = ''

  Promise.resolve()
    .then(load_setting)
    .then(() => {
      if (!today) throw Error('today')
      if (!setting) throw Error('setting')
      if (!setting.dst_dir) throw Error('dst_dir')
      return true
    })
    .then(() => {
      //get_start_date
      return glob(path.join(setting.src_dir, '*.log')).then((files) => {
        if (!files || files.length == 0) return ''
        let name = path.basename(files[0], '.log')

        start_date = name.substring(name.length - 6)
        prefix = name.substring(0, name.length - 6)
        return start_date
      })
    })
    .then((date) => {
      //check_enable_pack
      console.log('today = ' + today)
      console.log('date = ' + date)

      if (!date) {
        throw new Error('no file')
      }
      if (date.length != 6) {
        throw new Error('error')
      }
      if (!date.match(/[0-9]+/)) {
        throw new Error('error')
      }
      let month = date.substring(0, 4)

      if (month == today.substring(2, 6)) {
        console.log(month + ' = today')
        console.log('no more')
        throw new Error('no more')
      }

      return month
    })
    .then((month) => {
      console.log('>>' + month)
      console.log('>>' + prefix)

      // zip 압축
      console.log('zipping..')

      let archive = archiver(prefix + month + '.zip', {
        store: true,
      })

      console.log(path.join(setting.src_dir, prefix + month + '*.log'))

      // 대상로그파일추가
      archive.glob(prefix + month + '*.log', {
        cwd: setting.src_dir,
      })

      return archive
        .finalize()
        .then(() => {
          console.log(archive.pointer() + ' total bytes')
          console.log('archiver has been finalized and the output file descriptor has closed.')

          // zip 파일 복사
          return fs.rename(
            prefix + month + '.zip',
            path.join(setting.dst_dir, prefix + month + '.zip')
          )
        })
        .then(() => {
          // 로그삭제
          console.log('log delete..')

          return glob(path.join(setting.src_dir, prefix + month + '*.log')).then((files) => {
            return Promise.all(
              files.map((file, index) => {
                return fs.unlink(file).then(() => {
                  console.log(file + ' deleted')
                })
              })
            )
          })
        })
    })
    .then(() => {
      console.log('end..')

      // 재시작
      setTimeout(() => {
        console.log('3 second wait...')
        start_app()
      }, 3000)
    })
    .catch((err) => {
      console.log(err)
    })
}

start_app()
```

setting.json

```
{
    "src_dir" : "D:\\nodejs\\iis_log_packer\\test",
    "dst_dir" : "D:\\nodejs\\iis_log_packer"
}
```
