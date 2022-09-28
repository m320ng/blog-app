---
title: "공휴일 선택안되는 jQuery Datepicker 구현 (delayed render datepicker)"
date: "2022-01-28"
categories: 
  - "code"
tags: 
  - "ajax-datepicker"
  - "공휴일-datepicker"
---

## 공휴일은 공공데이터포탈 이용

공공데이터포탈 한국천문연구원\_특일 정보 이용 [https://www.data.go.kr/data/15012690/openapi.do](https://www.data.go.kr/data/15012690/openapi.do) 에서 서비스키 발급

공휴일 조회 API

```
http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=[서비스키]&solYear=2022&solMonth=01&_type=json
```

JSON형태로 받는다

```
{"response":{"header":{"resultCode":"00","resultMsg":"NORMAL SERVICE."},"body":{"items":{"item":[{"dateKind":"01","dateName":"설날","isHoliday":"Y","locdate":20220201,"seq":1},{"dateKind":"01","dateName":"설날","isHoliday":"Y","locdate":20220202,"seq":1}]},"numOfRows":10,"pageNo":1,"totalCount":2}}}
```

## jQuery Datepicker 구현

cors 설정이 안되어있으므로 jsonproxy를 이용한다. (for cors/jsonp) beforeShowDay, refresh 를 이용해서 ajax로 데이터를 가져온후에 다시 날짜를 표현한다.

```
function applyHolidayPicker(ins) {
  var patchHolidays = (year, month, callback)=>{
    if ((''+month).length==1) month = '0'+month;
    // 한국천문연구원_특일 정보
    // https://www.data.go.kr/data/15012690/openapi.do
    $.get('https://jsonp.afeld.me/?url='+encodeURIComponent('http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=[서비스키]&solYear='+year+'&solMonth='+month+'&_type=json'), (ret)=>{
      //console.log('ret',ret.response.body);
      var holidays = [];
      try {
        if (ret.response.body.items) {
          if (ret.response.body.totalCount==1) {
            ret.response.body.items.item = [ret.response.body.items.item];
          }
          ret.response.body.items.item.forEach((item)=>{
            holidays.push(item.locdate);
          });
        }
        if (callback) callback(true, holidays);
      } catch(e) {
        console.log(e.message);
        if (callback) callback(false);
      }
    });
  }

  ins.datepicker({
    changeMonth: true,
    changeYear: true,
    beforeShowDay: (day)=>{
      if (ins.data('loading')) return [false];
      var holidays = ins.data('holidays');

      if (holidays) {
        var cur = day.getDate();
        var exists = holidays.filter((item)=>parseInt((''+item).substring(6))==cur);
        if (exists.length) {
          return [false, 'date-holiday'];
        }
      }
      var result = [];
      switch (day.getDay()) {
        case 0:
          result = [false, "date-sunday"];
          break;
        case 6:
          result = [false, "date-saturday"];
          break;
        default:
          result = [true];
          break;
      }
      return result;
    },
    onChangeMonthYear: (year,month,picker)=>{
      //console.log('year',year);
      //console.log('month',month);
      ins.data('loading', true);
      $(picker.dpDiv).css({opacity:0.5});
      patchHolidays(year, month, (success, holidays)=>{
        ins.data('loading', false);
        ins.data('holidays', holidays);
        $(picker.dpDiv).css({opacity:1});
        //console.log('refresh');
        ins.datepicker('refresh');
      });

    },
    beforeShow:(input, picker)=>{
      console.log('beforeShow');
      ins.data('loading', true);
      var curdate = new Date;
      patchHolidays(curdate.getFullYear(), curdate.getMonth()+1, (success, holidays)=>{
        ins.data('loading', false);
        ins.data('holidays', holidays);
        //console.log('refresh');
        ins.datepicker('refresh');
      });
    },
    onClose:()=>{
    }
  });
}

applyHolidayPicker($('#date1'));
```
