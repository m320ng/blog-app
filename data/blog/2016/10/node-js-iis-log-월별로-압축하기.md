---
title: "[node.js] IIS Log 월별로 압축하기"
date: "2016-10-06"
categories: 
  - "code"
tags: 
  - "node-js"
  - "iis-log"
  - "archiver"
---

IIS Log를 정리하는 스크립트이다.

```
C:\inetpub\logs\LogFiles\W3SVC4

u_ex151103.log
u_ex151104.log
.
.
```

5분 노가다하기 싫어 5시간 코딩하는 정신으로.. 만들어 보았다.

물론 이건 간단한 스크립트라 얼마 안걸렸지만..

리눅스는 logrotate를 쓰면 간단한데 윈도우는 모르겠다.

압축은 archiver라는 훌륭한 module이 있어 사용해보았다.

source

```
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var archiver = require('archiver');

var settingraw = fs.readFileSync(__dirname+'/setting.json', 'utf8');
var setting = JSON.parse(settingraw);

var src_dir = setting.src_dir;
var dst_dir = setting.dst_dir;

var now = new Date;
// YYYYMMDD today
var today = [now.getFullYear(), (now.getMonth() + 1), now.getDate()];
today = today.map(function(item) {
    return item < 10 ? '0'+item : ''+item;
}).join('');

function get_start_date(callback) {
    glob(path.join(src_dir, "*.log"), function (er, files) {
        var name = path.basename(files[0], '.log');
        callback(name.substring(name.length - 6), name.substring(0, name.length - 6));
    });
}

function start_app() {
    get_start_date(function(date, prefix) {
        console.log('today = '+ today);

        if (date.length != 6) {
            console.log('error');
            return;
        }
        if (!date.match(/[0-9]+/)) {
            console.log('error');
            return;
        }
        var month = date.substring(0, 4);

        if (month == today.substring(2, 6)) {
            console.log(month + ' = today');
            console.log('no more');
            return;
        }

        console.log('>>'+month);
        console.log('>>'+prefix);

        // zip 압축
        console.log('zipping..');

        var output = fs.createWriteStream(prefix+month+'.zip');
        var archive = archiver('zip');

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');

            // zip 파일 복사
            fs.rename(prefix+month+'.zip', path.join(dst_dir, prefix+month+'.zip'));

            // 로그삭제
            console.log('log delete..');

            glob(path.join(src_dir, prefix+month+"*.log"), function (er, files) {
                files.forEach(function(file, index) {
                    fs.unlink(file, function(err) {
                        console.log(file + ' deleted');
                    });
                });
            });

            // 재시작
            setTimeout(function() {
                console.log('3 second wait...');
                start_app();
            }, 3000);
        });

        archive.on('error', function(err){
            throw err;
        });

        archive.pipe(output);
        archive.bulk([
            { expand: true, cwd: src_dir, src: [prefix+month+'*.*']}
        ]);
        archive.finalize();

    });
}

start_app();
```

setting.json

```
{
    "src_dir" : "C:\\inetpub\\logs\\LogFiles\\W3SVC2",
    "dst_dir" : "D:\\IIS_LOG\\W3SVC2"
}
```
