---
title: '[node.js] DNS Proxy Server'
date: '2016-10-05'
categories:
  - 'code'
tags:
  - 'node-js'
  - 'dns'
  - 'dns-proxy-server'
---

dns server 기능을 하되 특정도메인의 요청의 경우 원하는 아이피를 돌려주는 proxy server를 만들어보도록 한다.

개발 테스트시에 유용할때가 있어 구현해보았다.

node.js로 만들며 native-dns 라는 훌륭한 module이 있어 별어려움없이 구현이 가능하다.

native-dns [https://github.com/tjfontaine/node-dns](https://github.com/tjfontaine/node-dns)

크게 두가지 기능이면 구현이 가능한데 둘다 이 모듈을 이용하면된다.

1. 먼저 클라이언트에서 domain 질의를 요청하면 응답하는 기능.
2. 다른 dns server에 질의를 요청해서 IP정보를 받아오는 기능.

응답 소스

```js
var server = dns.createServer()

server.on('request', function (request, response) {
  var ip = request.address.address
  var domain = request.question[0].name

  response.answer.push(
    dns.A({
      name: domain,
      address: '172.17.50.6', // 원하는 IP
      ttl: 600,
    })
  )
  response.send()
})
```

질의 소스

```js
var question = dns.Question({
  name: domain,
  type: 'A',
})

var start = Date.now()

var req = dns.Request({
  question: question,
  server: { address: '8.8.8.8', port: 53, type: 'udp' },
  timeout: 1000,
})

req.on('timeout', function () {
  console.log('Timeout in making request')
  callback(true, 'Timeout in making request')
})

req.on('message', function (err, answer) {
  addrs = []
  answer.answer.forEach(function (a) {
    if (a.type == 1) {
      addrs.push(a.address)
    }
  })
  callback(false, addrs)
})

req.on('end', function () {
  //var delta = (Date.now()) - start;
  //console.log('Finished processing request: ' + delta.toString() + 'ms');
})

req.send()
```

아래와 같은 호스트 파일을 구성한다. 기존에 OS에서 사용하는 호스트파일과 똑같다.

www.naver.com 을 요청했을때 실제 아이피인 183.111.23.42 대신에 15.60.68.210를 응답하도록한다.

호스트 정보파일

```
15.60.68.210    www.naver.com
15.60.68.211    www.daum.net
15.60.68.175    guoo.net
15.60.68.211    memo.heyo.me
```

여기에 watcher를 추가하여 호스트파일 추가/삭제/변경시 새롭게 읽는 기능만 추가한다.

watcher는 chokidar module을 이용한다.

chokidar [https://github.com/paulmillr/chokidar](https://github.com/paulmillr/chokidar)

전체 소스

```js
var chokidar = require('chokidar')
var fs = require('fs')
var path = require('path')

var watcher = chokidar.watch('file, dir, or glob', {
  ignored: /[\/\\]\./,
  persistent: true,
})

var static_domains = {}

function parseHostFile(target, file) {
  if (!static_domains[target]) {
    static_domains[target] = []
  }
  console.log(file)
  var hostsraw = fs.readFileSync(file, 'utf8')
  var hosts = hostsraw.split('\n')
  hosts.forEach(function (host) {
    if (host && host.substring(0, 1) == '#') {
      return
    }
    host.replace(/([^\s]+)\s+([^\s]+)/g, function (m, ip, domain, port) {
      if (static_domains[target] === null) {
        static_domains[target] = {}
      }
      // static
      static_domains[target][domain] = ip
    })
  })
}

function unloadHostFile(target) {
  delete static_domains[target]
}

watcher
  .on('add', function (file) {
    console.log('File ' + file + ' has been added')
    console.log(path.basename(file))
    var target = path.basename(file)
    unloadHostFile(target)
    parseHostFile(target, file)
  })
  .on('change', function (file) {
    console.log('File ' + file + ' has been changed')
    var target = path.basename(file)
    unloadHostFile(target)
    parseHostFile(target, file)
  })
  .on('unlink', function (file) {
    console.log('File ' + file + ' has been removed')
    var target = path.basename(file)
    unloadHostFile(target)
  })

watcher.add('hosts/*')

/*
setInterval(function() {
    console.log('-domains------------------');
    console.log(static_domains);
}, 5000);
*/

var dns = require('native-dns'),
  util = require('util')

function do_question(domain, callback) {
  var question = dns.Question({
    name: domain,
    type: 'A',
  })

  var start = Date.now()

  var req = dns.Request({
    question: question,
    server: { address: '8.8.8.8', port: 53, type: 'udp' },
    timeout: 1000,
  })

  req.on('timeout', function () {
    console.log('Timeout in making request')
    callback(true, 'Timeout in making request')
  })

  req.on('message', function (err, answer) {
    addrs = []
    answer.answer.forEach(function (a) {
      if (a.type == 1) {
        addrs.push(a.address)
      }
    })
    callback(false, addrs)
  })

  req.on('end', function () {
    //var delta = (Date.now()) - start;
    //console.log('Finished processing request: ' + delta.toString() + 'ms');
  })

  req.send()
}

var server = dns.createServer()

server.on('request', function (request, response) {
  if (request.question[0].type != 1) {
    response.send()
    return
  }

  var ip = request.address.address
  var domain = request.question[0].name

  console.log(ip)

  if (static_domains[ip] && static_domains[ip][domain]) {
    // static
    console.log('static')
    response.answer.push(
      dns.A({
        name: domain,
        address: static_domains[ip][domain],
        ttl: 600,
      })
    )
    response.send()
  } else {
    // real name server
    console.log('default')
    console.log(domain)
    do_question(domain, function (err, address) {
      if (!err) {
        console.log(address)
        address.forEach(function (item) {
          response.answer.push(
            dns.A({
              name: domain,
              address: item,
              ttl: 600,
            })
          )
        })
        response.send()
      } else {
        response.send()
      }
    })
  }
})

server.on('error', function (err, buff, req, res) {
  console.log(err.stack)
})

server.serve(53)
```
