---
title: "[phantomjs/casperjs] 식단표 자동다운로드 (headless browser)"
date: "2017-03-03"
categories: 
  - "code"
tags: 
  - "headless-browser"
  - "phantomjs"
  - "casperjs"
---

headless browser 를 사용해 보았다.

headless browser 는 그래픽인터페이스 없는 웹브라우져인데 스크립트 제어, 네트워크 모니터링, 페이지 로딩제어등 여러가지 자동화를 지원해준다.

주로 자동화된 테스팅 도구로써 많이 사용된다.

내부적으로 ajax가 동작된다든지하는 클라이언트쪽 js스크립트와 연동하여 테스트할 경우 유용할 것 같다.

많은 headless browser가 있는데 몇가지 테스트해보고 최종적으로 phantomjs 를 이용하기로 결정하였다.

phantomjs 는 기본적인 웹브라우져가 필요없이 단독으로 동작한다. (내부적으로 크롬이나 파이어폭스 IE 등을 이용하는 headless browser들도 있다)

오픈소스이며 javascript 스크립트로 동작한다. (이름부터가 일단..)

다만 node.js 가 아닌 단독으로 동작하는데 이 부분이 좀 불편하다. node.js 에서 사용할 수 있도록 phantomjs를 감싼 여러가지 모듈이 있지만 전부 process 이벤트를 이용한 연동으로 완벽하지 않다.

조금만 복잡해져도 쓰기가 힘들어지는 경우가 많았다.

대신 phantomjs를 좀더 편하게 쓸수 있는 casperjs 를 사용했다.

casperjs는 phantomjs를 보다 사용하기 쉽게 wrapping한 headless browser 이다. (phantomjs가 있어야동작)

[http://phantomjs.org/](http://phantomjs.org/) [http://casperjs.org/](http://casperjs.org/)

테스트겸사겸사 주간 식단표 자동다운로드를 만들어보았다.

보통 이런경우 node.js로 request, cheerio, jsdom 등의 모듈을 이용해서 간단하게 로그인 인증처리하고 파싱해서 원하는 파일만 다운받게하면 깔끔하다.

하지만 식단표가 올라간 곳이 그룹웨어인데 asp.net 프레임워크 2.0 기준의 웹폼기반 홈페이지이다.

웹폼기반 홈페이지가 늘그렇듯.. 포스트백등 여러가지로 더렵다. 거기다 상용컨트롤까지 사용되면 대부분이 ajax 기반하에 동작하게 되는데 더더욱 더러워진다.

이런걸 분석해서 깔끔하게 만들수도 있지만 이럴경우 배보다 배꼽이 더 클수 있다. (3시간 분석해서 3줄코딩)

headless browser 를 이용하면 웹페이지 이용하듯이 스크립트를 구성하면 되므로 간단하게 구현이 가능하다.

소스를 보면 전반적으로 깔끔하게 구성된다. 팝업도 깔끔하게 처리되서 놀랐다.

다만 파일다운로드 부분만 조금 복잡한데 phanomjs 의 버그인건지 이상하게도 onResourceReceived 에 res.body에 값이 empty string 넘어오는데 정확한 이유는 모르겠다.

검색해보아도 phanomjs의 소스를 직접수정해서 빌드하는식의 방법밖에 없어서 url, post, headers 값들을 돌려서 casperjs의 download 를 이용하는방법으로 해결했다.

```
"use strict"
var util = require('util'); 

var casper = require('casper').create({
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36'
});

var __dirname = 'd:\\nodejs\\_lunch';

var xlsfile = __dirname+'/lunch.xlsx';
var account = 'cook';
var password = 'cook';

casper.start('https://그룹웨어/Logon/Login.aspx')
// 첫페이지
.then(function() {
    this.echo('Page: ' + this.getTitle());
    //this.capture('login.png');
})
// 로그인
.then(function() {
    // script 값 전달
    this.evaluate(function(account, password) {
        var form = document.forms[0];
        form.txtLoginID.value = account;
        form.txtPassword.value = password;
    }, account, password);

    this.evaluate(function() {
        document.getElementById('btnLogin').click();
    });
    this.echo('login');
    //this.capture('login2.png');
})
// 게시판 이동
.waitForSelector('a[title=게시판]')
.then(function() {
    this.echo('go board');
    //this.capture('board.png');
})
.then(function() {
    this.evaluate(function() {
        //$('a[title=게시판]').click();
        location.href = '/eNovator/GW/TotalBoard/TotalBoard_Main.aspx?menu_code=';
    });
})
// 자유게시판 클릭
.waitForSelector('span.TreeControl_TreeLabel')
.then(function() {
    //this.capture('board2.png');
    this.evaluate(function() {
        $('span:contains(자유게시판)').click();
    });
})
// 식단표 클릭
.waitForSelector('#ListView')
.then(function() {
    this.evaluate(function() {
        $('#ListView table td span.cssLinkItem:contains(주간식단표)')[0].click();
    });
    this.echo('click');
})
// 팝업
.then(function() {
    this.echo('wait popup');
    this.waitForPopup(/\.aspx$/, function() {
        this.echo("popup opened");
    })
    .withPopup(/\.aspx$/, function() {
        this.echo("with popup");

        //this.viewport(1400,800);
        this.waitForSelector("#divDownLoadArea").then(function() {
            /*
            var len = this.evaluate(function() {
                return $('#divDownLoadArea span:contains(전체다운로드)').length;
            });
            this.echo('len:'+len);
            */
            var checkDownload = false;

            // 파일다운로드
            var self = this;
            this.page.onResourceReceived = function (res) {
                //if(res.stage!="end") return;
                //console.log('received: ' + JSON.stringify(res, undefined, 4));
            };
            this.page.onResourceRequested = function (req) {
                if (req.url.match(/fileDownload\.ashx/g)) {
                    self.page.onResourceRequested = null;
                    //console.log(req.url);
                    var headers = {};
                    req.headers.forEach(function(item) {
                        headers[item.name] = item.value;
                    });
                    //console.log(util.inspect(headers));
                    try {
                        self.download(req.url, xlsfile, 'POST', req.postData);
                        console.log('download complete');
                    } catch(e) {
                        console.log('download error');
                        console.log(e);
                    }
                    checkDownload = true;
                    //console.log('requested: ' + JSON.stringify(req, undefined, 4));
                }
            };

            // 다운로드 클릭
            this.evaluate(function() {
                $('.FileTransferControl_FileList span').trigger('mouseover');
                $('#PreviewDownloadBtn span:contains(다운로드)').click();
            });
            this.waitFor(function check() {
                return checkDownload;
            }, function then() {
                return this;
            }, function timeout() {
                console.log('timeout');
                return this;
            }, 10000);

            return this;
        });
    });
    return this;
})
.then(function() {
    this.echo('complete');
});

casper.on('page.error', function(msg, trace) {
    casper.echo(msg);
    casper.echo(utils.dump(trace));
});

casper.run();
```
