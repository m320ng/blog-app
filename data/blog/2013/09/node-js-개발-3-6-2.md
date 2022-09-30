---
title: 'node.js 개발 (3-6)'
date: '2013-09-08'
categories:
  - 'code'
---

# 포커게임

```js
/**
 * poker_game.js
 * 포커게임
 */

// module
var util = require('util')

// include
var utils = require('../common/utils')

var POKER_RESULT = {
  POKER_NOPAIR: 1,
  POKER_ONEPAIR: 2,
  POKER_TWOPAIR: 3,
  POKER_TRIPLE: 4,
  POKER_STRAIGHT: 5,
  POKER_BACK_STRAIGHT: 6,
  POKER_MOUNTAIN: 7,
  POKER_FLUSH: 8,
  POKER_FULLHOUSE: 9,
  POKER_FOURCARD: 10,
  POKER_STRAIGHT_FLUSH: 13,
  POKER_BACK_STRAIGHT_FLUSH: 14,
  POKER_ROYAL_STRAIGHT_FLUSH: 15,
}
var POKER_NUMBER_LIST = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
]
var POKER_SHAPE_LIST = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
]

var Judgement = function () {
  this.result = null
  this.number = null
  this.shape = null
}

var Card = function () {
  this.index = 0
  this.number = 0
  this.shape = 0
}
Card.prototype = {
  text: function () {
    var str = ''
    if (this.number == 13) {
      str += 'A'
    } else if (this.number == 12) {
      str += 'K'
    } else if (this.number == 11) {
      str += 'Q'
    } else if (this.number == 10) {
      str += 'J'
    } else {
      str += this.number + 1
    }
    if (this.shape == 1) {
      str += '♠'
    } else if (this.shape == 2) {
      str += '◆'
    } else if (this.shape == 3) {
      str += '♥'
    } else if (this.shape == 4) {
      str += '♣'
    }
    return str
  },
}

var PokerGame = function () {
  this.cardList = []
}
PokerGame.prototype = {
  reset: function () {
    this.users = []
    this.cardList = []
    for (var i = 0; i < POKER_NUMBER_LIST.length; i++) {
      var card = new Card()
      card.index = i + 1
      card.number = POKER_NUMBER_LIST[i]
      card.shape = POKER_SHAPE_LIST[i]
      this.cardList.push(card)
    }
    utils.shuffle(this.cardList)
  },
  popCard: function () {
    return this.cardList.pop()
  },
  judgeCardset: function (cardset) {
    if (cardset.length != 5) {
      console.log('error: 5 card')
      return
    }
    var judge = {}

    // sort
    cardset.sort(function (a, b) {
      return a.number - b.number
    })

    // pair-check
    var pairNumber = {}
    var pairShape = {}
    var straight = []
    var last = null
    cardset.forEach(function (card, cardIdx) {
      if (!pairNumber[card.number]) pairNumber[card.number] = []
      pairNumber[card.number].push(card)

      if (!pairShape[card.shape]) pairShape[card.shape] = []
      pairShape[card.shape].push(card)

      if (!last) {
        straight = [card]
      } else if (last && last.number + 1 == card.number) {
        straight.push(card)
      } else if (straight.length == 4) {
        if (straight[0].number == 1 && card.number == 13) {
          //2 && A
          straight.push(card)
        }
      }
      last = card
    })

    // check judgement
    var pair = []
    var triple = null
    var fourcard = null
    var flush = null
    var fullhouse = null
    for (var key in pairNumber) {
      _cardset = pairNumber[key]
      var number = parseInt(key)
      if (_cardset.length == 2) {
        if (triple) {
          var t = triple.pop()
          fullhouse = { number: triple.number, pair: _cardset, triple: triple.cardset }
          triple = null
        } else {
          pair.push({ number: number, cardset: _cardset })
        }
      }
      if (_cardset.length == 3) {
        if (pair.length) {
          var t = pair.pop()
          fullhouse = { number: number, pair: t.cardset, triple: _cardset }
        } else {
          triple = { number: number, cardset: _cardset }
        }
      }
      if (_cardset.length == 4) {
        fourcard = { number: number, cardset: _cardset }
      }
    }
    for (var key in pairShape) {
      _cardset = pairShape[key]
      var shape = parseInt(key)
      if (_cardset.length == 5) {
        flush = { shape: shape, cardset: _cardset }
      }
    }

    // decide judgement
    var judge = new Judgement()
    judge.result = POKER_RESULT.POKER_NOPAIR
    judge.number = cardset[4].number

    if (pair.length == 1) {
      judge.result = POKER_RESULT.POKER_ONEPAIR
      judge.number = pair[0].number
    }
    if (pair.length == 2) {
      judge.result = POKER_RESULT.POKER_TWOPAIR
      judge.number = pair[0].number > pair[1].number ? pair[0].number : pair[1].number
    }
    if (triple) {
      judge.result = POKER_RESULT.POKER_TRIPLE
      judge.number = triple.number
    }
    if (straight.length == 5) {
      if (straight[4].number == 13) {
        //A
        if (straight[0].number == 1) {
          judge.result = POKER_RESULT.POKER_BACK_STRAIGHT
          judge.number = straight[4].number
        } else {
          judge.result = POKER_RESULT.POKER_MOUNTAIN
          judge.number = straight[4].number
        }
      } else {
        judge.result = POKER_RESULT.POKER_STRAIGHT
        judge.number = straight[4].number
      }
    }
    if (flush) {
      if (straight.length == 5) {
        // judge.result <= STRAIGHT
        judge.result = judge.result + POKER_RESULT.POKER_FLUSH
        judge.shape = flush.shape
      } else {
        judge.result = POKER_RESULT.POKER_FLUSH
        judge.shape = flush.shape
      }
    }
    if (fullhouse) {
      judge.result = POKER_RESULT.POKER_FULLHOUSE
      judge.number = fullhouse.number
    }
    if (fourcard) {
      judge.result = POKER_RESULT.POKER_FOURCARD
      judge.number = fourcard.number
    }

    // 승패 비교를 쉽게 수치화
    if (judge.result == POKER_RESULT.POKER_FLUSH) {
      judge.value = judge.result * 10000 + judge.shape * 100 + judge.number
    } else {
      judge.value = judge.result * 10000 + judge.number * 100 + judge.shape
    }

    return judge
  },
  free: function () {},
}
```
