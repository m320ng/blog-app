---
title: "[node.js] i18n 다국어 helper app"
date: "2018-10-04"
categories: 
  - "code"
tags: 
  - "i18n"
  - "i18n-한글"
---

# i18n 다국어

기본적으로 po파일을 관리하지 않고 소스에서만 입력하여 빠르게 개발하기위해 만들었다.

msg\_id는 한글로 하며 앞에 @를 붙인다.

```php
  <th>
  <?__('@이름')?>
  </th>
```

어느정도 완료 시점을 잡아서 이 스크립트를 실행하면 소스와 DB를 파싱하고 기존에 po파일과 비교하여 없는 단어일경우 po파일을 생성해준다. 이 작업을 반복한다. 이 시점 관리만하면 번역시에 추가된 단어를 적절하게 관리할 수 있다.

엑셀파일로 정리할 것을 고려하여 파일명과 line을 기록해두었다.

```
"use strict";

var fs = require('fs-promise');
var glob = require('glob-promise');
var async = require('async');
var path = require('path');
var util = require('util');
var sql = require('mssql');

var base_dir = 'd:/eclipse-php/ycpqc/app';

// 소스
var source_dirs = [];
source_dirs.push(base_dir+'/controllers/**/*.php');
source_dirs.push(base_dir+'/views/**/*.ctp');
source_dirs.push(base_dir+'/webroot/sitemap.php');

// 기존의 po파일
var po_file = base_dir+'/locale/ko-KR/LC_MESSAGES/default.po';

var source_found = 0;
var model_found = 0;
var dictionary = {};
var wrong_dictionary = {};

var mo_dictionary = {};
var wrong_mo_dictionary = {};

// 비교용 기존 po파일 파싱
function parse_po_file(file) {
    return new Promise((resolve)=> {
        let lineReader = require('readline').createInterface({
            input: fs.createReadStream(file)
        });
        let linenum = 0;
        lineReader.on('close', function() {
            resolve();
        });
        let type = null;
        lineReader.on('line', function (line) {
            linenum++;
            line = line.trim();

            let match = null;
            let match_text = null;
            match = line.match(/msgid "(.+)"/i);
            if (match) {
                if (type) {
                    wrong_mo_dictionary[type] = '값누락';
                }
                match_text = match[1];
                if (match_text[0]!='@') {
                    wrong_mo_dictionary[match_text] = '@누락';
                }
                type = match_text;
                mo_dictionary[type] = null;
            } else {
                match = line.match(/msgstr "(.+)"/i);
                if (match) {
                    match_text = match[1];
                    mo_dictionary[type] = match_text;
                    type = null;
                }
            }
        });
    });
}

function parse_source_file(file) {
    return new Promise((resolve)=> {
        let lineReader = require('readline').createInterface({
            input: fs.createReadStream(file)
        });
        let linenum = 0;
        lineReader.on('close', function() {
            resolve();
        });
        lineReader.on('line', function (line) {
            linenum++;
            line = line.trim();

            var match = null;
            var match_text = null;
            match = line.match(/__\("([^"]+)"(|,[ ]?true)\)/i);
            if (match) {
                match_text = match[1];
            } else {
                match = line.match(/__\('([^']+)'(|,[ ]?true)\)/i);
                if (match) {
                    match_text = match[1];
                }
            }

            if (match_text) {
                source_found++;
                if (match_text[0]!='@') {
                    wrong_dictionary[match_text] = {
                        'file':file,
                        'line':linenum,
                        'text':match_text,
                    };
                } else {
                    if (dictionary[match_text]) {
                        var _file = dictionary[match_text]['file']+'\n'+file;
                        var _linenum = dictionary[match_text]['line']+'\n'+linenum;
                        var _count = dictionary[match_text]['count'] + 1;
                        dictionary[match_text] = {
                            'file':_file,
                            'line':_linenum,
                            'count':_count,
                            'text':match_text.substring(1)
                        };
                    } else {
                        dictionary[match_text] = {
                            'file':file,
                            'line':linenum,
                            'count':0,
                            'text':match_text.substring(1)
                        };
                    }
                }
            }
        });
    });
}

// 소스파일 파싱
async function parse_source_files() {
    await asyncForEach(source_dirs, async function(dir, index) {
        console.log('['+dir+']');
        let tasks = [];
        let files = await glob(dir);
        await asyncForEach(files, async function(file, index) {
            await parse_source_file(file);
        });
    });
}

// db 파싱
async function parse_database() {
    var db_user = 'user';
    var db_password = '1234';
    var db_host = 'xxx.xxx.xx8.164';
    var db_database = 'test';

    var connstr = 'mssql://'+db_user+':'+db_password+'@'+db_host+'/'+db_database;
    connstr = 'Server='+db_host+';Uid='+db_user+';Pwd='+db_password+';Database='+db_database;
    console.log(connstr);
    var pool = await sql.connect(connstr);
    var result = await sql.query`select * from test_codes`;
    result.recordset.forEach(function(row, index) {
        if (row.name) {
            dictionary['@'+row.name] = {
                'file':'db',
                'line':row.model+'.'+row.field,
                'count':0,
                'text':row.name
            };
        }
    });
    await sql.close();
}

// 프로그램 시작
async function start_app() {
    await parse_po_file(po_file);
    await parse_source_files();
    await parse_database();

    //console.log(mo_dictionary);
    //console.log(dictionary);
    //var diff = arr_diff(mo_dictionary, dictionary);
    //console.log(diff);

    console.log(wrong_dictionary);

    var diff = arr_diff(dictionary, mo_dictionary);

    var writer = fs.createWriteStream('add_default.po', {flag:'w'});
    var count = 0;

    writer.write('// 자동생성 '+(new Date()).toString()+'----------------------------\r\n');
    writer.write('\r\n');
    for (var key in diff) {
        var val = diff[key];
        writer.write('msgid "'+key+'"\r\n');
        writer.write('msgstr "'+val.text+'"\r\n');
        writer.write('\r\n');
        count++;
    }

    console.log(count + '개 단어 생성.');
}
start_app();


// 기타 함수

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

function arr_diff (a1, a2) {
    var diff = util._extend(a1);
    for (var k in diff) {
        if (a2[k]) {
            delete diff[k];
        }
    }
    return diff;
}
```
