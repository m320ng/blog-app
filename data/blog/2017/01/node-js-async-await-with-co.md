---
title: "[node.js] async await (with co)"
date: "2017-01-20"
categories: 
  - "code"
tags: 
  - "node-js"
  - "promise"
  - "async-await"
  - "co"
---

async await 연습

[IIS Log 월별로 압축하기](http://note.heyo.me/?p=881)

[Promise 버전](http://note.heyo.me/?p=1005)

이번엔 async await 기반으로 변경해보았다.

async await는 기존의 Promise에서 더 나아가 마치 동기화식의 return방식으로 코딩을 가능하도록 해준다.

아직 정식 버전에서 지원은 아니고 alpha버전에 추가되었다.

해서 async await를 쓰진 않고 정식버전에서 100% 흡사하게 코딩하도록 도와주는

[co 패키지](https://www.npmjs.com/package/co) 를 이용하도록 하겠다.

alpha 버전을 깔고 하는게 너무나 귀찮으므로

제네레이터 함수와 yield를 이용해서 Promise callback return을 동기화방식 return으로 값을 받을 수 있게 해준다.

제네레이터 함수인 function \*() 은 async function 로 yield 는 await 로 바꿔주면

async await 와 똑같다.

물론 해보지 않았다. 예제로 파악해본바..

어쨋든 이것도 Promise 기반으로 동작하는거니 Promise가 아직 잘이해가 안된다면 Promise부터 숙지하는게 좋을거 같다.

아래소스를 보면 Promise 객체 단위로 어쩔수없이 then으로 쪼개졌던 부분이 한 함수내에서 전부 구현 되어있다.

확실히 이렇게 구현하니 원하는 단위로 정리도 수월해 질수 있고 scope관리도 용이하고 가독성도 좋게 코딩 할 수 있겠다.

source

```
"use strict";

var co = require('co');
var fs = require('fs-promise');
var glob = require('glob-promise');
var path = require('path');
var archiver = require('archiver-promise');

var setting = {};
var today = '';

//global var
var load_setting = co.wrap(function *() {
    let raw = yield fs.readFile(__dirname+'/setting.json', 'utf8');

    setting = JSON.parse(raw);

    // YYYYMMDD today
    let now = new Date;
    let t = [now.getFullYear(), (now.getMonth() + 1), now.getDate()];
    today = t.map(function(item) {
        return item < 10 ? '0'+item : ''+item;
    }).join('');

    return setting;
});

function start_app() {
    co(function *() {
        let start_date = '';
        let prefix = '';

        var ret = yield load_setting();
        console.log('load_setting');

        if (!today) throw Error('today');
        if (!setting) throw Error('setting');
        if (!setting.dst_dir) throw Error('dst_dir');

        let files = yield glob(path.join(setting.src_dir, "*.log"));

        if (!files || files.length==0) return '';
        let name = path.basename(files[0], '.log');

        start_date = name.substring(name.length - 6);
        prefix = name.substring(0, name.length - 6);

        let date = start_date;
        console.log('today = '+ today);
        console.log('date = '+ date);

        if (!date) {
            throw new Error('no file');
        }
        if (date.length != 6) {
            throw new Error('error');
        }
        if (!date.match(/[0-9]+/)) {
            throw new Error('error');
        }
        let month = date.substring(0, 4);

        if (month == today.substring(2, 6)) {
            console.log(month + ' = today');
            console.log('no more');
            throw new Error('no more');
        }

        console.log('>>'+month);
        console.log('>>'+prefix);

        // zip 압축
        console.log('zipping..');

        let archive = archiver(prefix+month+'.zip', {
            store: true
        });

        console.log(path.join(setting.src_dir, prefix+month+'*.log'));

        // 대상로그파일추가
        archive.glob(prefix+month+'*.log', {
            cwd: setting.src_dir
        });

        yield archive.finalize();

        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        // zip 파일 복사
        yield fs.rename(prefix+month+'.zip', path.join(setting.dst_dir, prefix+month+'.zip'));

        // 로그삭제
        console.log('log delete..');

        files = yield glob(path.join(setting.src_dir, prefix+month+"*.log"))

        for (let file of files) {
            yield fs.unlink(file);
            console.log(file + ' deleted');
        }

        /*
        // 기존 forEach는 쓰면 안됨
        // 기본 forEach는 제네레이터함수가 아닌 일반함수만 받기때문

        // 1. 배열을 yield 시키거나
        yield files.map((file, index) => {
            return fs.unlink(file).then(() => {
                console.log(file + ' deleted');
            });
        });
        yield files.map((file, index) => {
            return co(function *() {
                yield fs.unlink(file);
                console.log(file + ' deleted');
            });
        });

        // 2. 제네레이터함수를 받는 co관련 패키지를 이용하거나 co-foreach등
        var foreach = require('co-foreach');
        yield foreach(files, function *(file, index) {
            yield fs.unlink(file);
            console.log(file + ' deleted');
        });
        */

        console.log('end..');

        // 재시작
        setTimeout(() => {
            console.log('3 second wait...');
            start_app();
        }, 3000);

    }).catch(function(err) {
        console.log(err);
    });
}

start_app();
```
