(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{101:function(e,t,a){"use strict";a.r(t),a.d(t,"setProfile",function(){return l}),a.d(t,"showDrawer",function(){return p}),a.d(t,"getElsom",function(){return f});var n=a(7),r=a.n(n),o=a(11),i=a(47),c=a(29),s=a.n(c),u=a(38),d=a.n(u);function l(e){return{type:i.a,payload:e}}function p(e){return{type:i.b,payload:e}}var f=function(){var e=Object(o.a)(r.a.mark(function e(t){var a,n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,(a=new d.a).append("wallet",t.wallet),e.next=5,s.a.post("http://88.212.253.143:1000/payment/elsom/check",a);case 5:return n=e.sent,e.abrupt("return",n.data);case 9:e.prev=9,e.t0=e.catch(0),console.error(e.t0);case 12:case"end":return e.stop()}},e,this,[[0,9]])}));return function(t){return e.apply(this,arguments)}}()},12:function(e,t,a){"use strict";a.d(t,"a",function(){return u}),a.d(t,"b",function(){return d});var n=a(7),r=a.n(n),o=a(11),i=a(149),c=a(37),s=a(25),u=void 0,d=function(){var e=Object(o.a)(r.a.mark(function e(){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Object(i.a)("Shoro",6,{upgrade:function(e){Object(c.b)(e),Object(s.b)(e)}});case 2:u=e.sent;case 3:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},13:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),o=a(22),i=a.n(o),c=(a(171),a(93)),s=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function u(e,t){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var a=e.installing;null!=a&&(a.onstatechange=function(){"installed"===a.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See http://bit.ly/CRA-PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}}).catch(function(e){console.error("Error during service worker registration:",e)})}var d=a(55),l=a(32),p=a(17),f=a(24),h={authenticated:!1,error:!1,status:{},reiting:{}};var b=a(53),g={title:"",child:null,show:!1};var v=a(47),m={drawer:!1,profile:{}};var y=a(14),S={count:0,page:0,data:[],data1:[],row:[],search:"",name:"",sort:"",selected:-1,ids:{},point1:{},deletedId:"",oldFile:"",region:"region",point:"point",typeStatistic:{what:"\u0412\u044b\u0431\u0440\u0430\u0442\u044c"}};var O=a(48),w={title:"",show:!1};var x=Object(l.c)({mini_dialog:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:g,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case b.b:return Object(p.a)({},e,{show:t.payload});case b.a:return Object(p.a)({},e,{title:t.payload.title,child:t.payload.child});default:return e}},user:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:h,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case f.a:return Object(p.a)({},e,{authenticated:!0,error:!1});case f.e:return Object(p.a)({},e,{authenticated:!1,error:!1});case f.b:return Object(p.a)({},e,{error:t.payload});case f.d:return Object(p.a)({},e,{status:t.payload});case f.c:return Object(p.a)({},e,{reiting:t.payload});default:return e}},table:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:S,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case y.b:return Object(p.a)({},e,{ids:t.payload});case y.f:return Object(p.a)({},e,{selected:t.payload});case y.a:var a=Object(p.a)({},e,{count:t.payload.count,page:t.payload.page,data:t.payload.data,data1:t.payload.data1,row:t.payload.row,search:t.payload.search,name:t.payload.name,sort:t.payload.sort});return void 0!==t.payload.region&&(a.region=t.payload.region),void 0!==t.payload.point&&(a.point=t.payload.point),a;case y.e:return Object(p.a)({},e,{point1:t.payload});case y.d:return Object(p.a)({},e,{oldFile:t.payload});case y.c:return Object(p.a)({},e,{deletedId:t.payload});case y.i:return Object(p.a)({},e,{typeStatistic:t.payload});case y.g:return Object(p.a)({},e,{point:t.payload});case y.h:return Object(p.a)({},e,{region:t.payload});default:return e}},snackbar:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case O.a:return Object(p.a)({},e,{show:!1});case O.b:return Object(p.a)({},e,{title:t.payload.title,show:!0});default:return e}},app:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:m,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case v.b:return Object(p.a)({},e,{drawer:t.payload});case v.a:return Object(p.a)({},e,{profile:t.payload});default:return e}}}),j=a(143);var k=a(586),E=a(95),A=a(6),T=a(148),N=a(147),L=a.n(N),P=a(12);a.d(t,"store",function(){return _}),Object(P.b)();var R,I=Object(A.createMuiTheme)({overrides:{MuiPickersToolbar:{toolbar:{backgroundColor:"#202124"}},MuiPickersCalendarHeader:{switchHeader:{}},MuiPickersDay:{day:{color:"#202124"},isSelected:{backgroundColor:"#202124"},current:{color:"#202124"}},MuiPickersModal:{dialogAction:{color:"#202124"}}}}),_=Object(l.d)(x,R,Object(l.a)(j.a));i.a.hydrate(r.a.createElement(A.MuiThemeProvider,{theme:I},r.a.createElement(E.b,{utils:T.a,locale:L.a},r.a.createElement(k.a,null,r.a.createElement(d.a,{store:_},r.a.createElement(c.a,null))))),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",function(){var t="".concat("","/service-worker.js");s?(function(e,t){fetch(e).then(function(a){var n=a.headers.get("content-type");404===a.status||null!=n&&-1===n.indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):u(e,t)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(t,e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit http://bit.ly/CRA-PWA")})):u(t,e)})}else console.log("service worker dont work")}()},14:function(e,t,a){"use strict";a.d(t,"a",function(){return n}),a.d(t,"b",function(){return r}),a.d(t,"f",function(){return o}),a.d(t,"g",function(){return i}),a.d(t,"h",function(){return c}),a.d(t,"i",function(){return s}),a.d(t,"d",function(){return u}),a.d(t,"c",function(){return d}),a.d(t,"e",function(){return l});var n="GET_DATA",r="GET_IDS",o="SET_SELECTED",i="SET_SELECTED_POINT",c="SET_SELECTED_REGION",s="SET_TYPE_STATISTIC",u="SET_OLD_FILE",d="SET_DELETED_ID",l="SET_POINT"},166:function(e,t,a){e.exports=a(13)},171:function(e,t,a){},175:function(e,t,a){},24:function(e,t,a){"use strict";a.d(t,"a",function(){return n}),a.d(t,"e",function(){return r}),a.d(t,"b",function(){return o}),a.d(t,"d",function(){return i}),a.d(t,"c",function(){return c});var n="AUTHENTICATED",r="UNAUTHENTICATED",o="ERROR_AUTHENTICATED",i="SET_STATUS",c="SET_REITING"},25:function(e,t,a){"use strict";a.d(t,"b",function(){return c}),a.d(t,"a",function(){return s}),a.d(t,"c",function(){return u});var n=a(7),r=a.n(n),o=a(11),i=a(12),c=function(e){try{e.deleteObjectStore("getSimple")}catch(t){console.log(t)}e.createObjectStore("getSimple",{keyPath:"id",autoIncrement:!0}).createIndex("name","name",{unique:!0})},s=function(){var e=Object(o.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===i.a){e.next=4;break}return e.next=3,i.a.getFromIndex("getSimple","name",t);case 3:return e.abrupt("return",e.sent);case 4:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}(),u=function(){var e=Object(o.a)(r.a.mark(function e(t,a){var n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===i.a){e.next=12;break}return e.next=3,i.a.getFromIndex("getSimple","name",t);case 3:if(void 0!==(n=e.sent)){e.next=9;break}return e.next=7,i.a.add("getSimple",{name:t,data:a});case 7:e.next=12;break;case 9:return n.data=a,e.next=12,i.a.put("getSimple",n);case 12:case"end":return e.stop()}},e,this)}));return function(t,a){return e.apply(this,arguments)}}()},31:function(e,t,a){"use strict";a.d(t,"c",function(){return n}),a.d(t,"d",function(){return i}),a.d(t,"b",function(){return c}),a.d(t,"a",function(){return s});var n=["\u044f\u043d\u0432\u0430\u0440\u044c","\u0444\u0435\u0432\u0440\u0430\u043b\u044c","\u043c\u0430\u0440\u0442","\u0430\u043f\u0440\u0435\u043b\u044c","\u043c\u0430\u0439","\u0438\u044e\u043d\u044c","\u0438\u044e\u043b\u044c","\u0430\u0432\u0433\u0443\u0441\u0442","\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c","\u043e\u043a\u0442\u044f\u0431\u0440\u044c","\u043d\u043e\u044f\u0431\u0440\u044c","\u0434\u0435\u043a\u0430\u0431\u0440\u044c"],r={"\u044f\u043d\u0432\u0430\u0440\u044c":31,"\u0444\u0435\u0432\u0440\u0430\u043b\u044c":28,"\u043c\u0430\u0440\u0442":31,"\u0430\u043f\u0440\u0435\u043b\u044c":30,"\u043c\u0430\u0439":31,"\u0438\u044e\u043d\u044c":30,"\u0438\u044e\u043b\u044c":31,"\u0430\u0432\u0433\u0443\u0441\u0442":31,"\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c":30,"\u043e\u043a\u0442\u044f\u0431\u0440\u044c":31,"\u043d\u043e\u044f\u0431\u0440\u044c":30,"\u0434\u0435\u043a\u0430\u0431\u0440\u044c":31},o={"\u044f\u043d\u0432\u0430\u0440\u044c":"\u0434\u0435\u043a\u0430\u0431\u0440\u044c","\u0444\u0435\u0432\u0440\u0430\u043b\u044c":"\u044f\u043d\u0432\u0430\u0440\u044c","\u043c\u0430\u0440\u0442":"\u0444\u0435\u0432\u0440\u0430\u043b\u044c","\u0430\u043f\u0440\u0435\u043b\u044c":"\u043c\u0430\u0440\u0442","\u043c\u0430\u0439":"\u0430\u043f\u0440\u0435\u043b\u044c","\u0438\u044e\u043d\u044c":"\u043c\u0430\u0439","\u0438\u044e\u043b\u044c":"\u0438\u044e\u043d\u044c","\u0430\u0432\u0433\u0443\u0441\u0442":"\u0438\u044e\u043b\u044c","\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c":"\u0430\u0432\u0433\u0443\u0441\u0442","\u043e\u043a\u0442\u044f\u0431\u0440\u044c":"\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c","\u043d\u043e\u044f\u0431\u0440\u044c":"\u043e\u043a\u0442\u044f\u0431\u0440\u044c","\u0434\u0435\u043a\u0430\u0431\u0440\u044c":"\u043d\u043e\u044f\u0431\u0440\u044c"},i=10,c=function(e){return(e=e.split(" "))[0]-=1,0===e[0]&&(e[0]=r[e[1]],e[1]=o[e[1]],"\u0434\u0435\u043a\u0430\u0431\u0440\u044c"===e[1]&&(e[2]-=1)),e[0]+" "+e[1]+" "+e[2]},s=function(e){return isNaN(parseInt(e))?0:parseInt(e)}},37:function(e,t,a){"use strict";a.d(t,"b",function(){return c}),a.d(t,"a",function(){return s}),a.d(t,"c",function(){return u});var n=a(7),r=a.n(n),o=a(11),i=a(12),c=function(e){try{e.deleteObjectStore("status")}catch(t){console.log(t)}e.createObjectStore("status",{keyPath:"id",autoIncrement:!0})},s=function(){var e=Object(o.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===i.a){e.next=4;break}return e.next=3,i.a.get("status",t);case 3:return e.abrupt("return",e.sent);case 4:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}(),u=function(){var e=Object(o.a)(r.a.mark(function e(t,a){var n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===i.a){e.next=12;break}return e.next=3,i.a.get("status",t);case 3:if(void 0!==(n=e.sent)){e.next=9;break}return e.next=7,i.a.add("status",{data:a});case 7:e.next=12;break;case 9:return n.data=a,e.next=12,i.a.put("status",n);case 12:case"end":return e.stop()}},e,this)}));return function(t,a){return e.apply(this,arguments)}}()},47:function(e,t,a){"use strict";a.d(t,"b",function(){return n}),a.d(t,"a",function(){return r});var n="SHOW_DRAWER",r="SET_PROFILE"},48:function(e,t,a){"use strict";a.d(t,"a",function(){return n}),a.d(t,"b",function(){return r});var n="CLOSE_SNACKBAR",r="SHOW_SNACKBAR"},53:function(e,t,a){"use strict";a.d(t,"a",function(){return n}),a.d(t,"b",function(){return r});var n="SET_MINI_DIALOG",r="SHOW_MINI_DIALOG"},54:function(e,t,a){"use strict";a.r(t),a.d(t,"showSnackBar",function(){return r}),a.d(t,"closeSnackBar",function(){return o});var n=a(48);function r(e){return{type:n.b,payload:{title:e}}}function o(){return{type:n.a}}},72:function(e,t,a){"use strict";a.r(t),a.d(t,"setData",function(){return b}),a.d(t,"addData",function(){return g}),a.d(t,"setSelected",function(){return v}),a.d(t,"setTypeStatistic",function(){return m}),a.d(t,"setPoint",function(){return y}),a.d(t,"setSelectedPoint",function(){return S}),a.d(t,"setSelectedRegion",function(){return O}),a.d(t,"setDeletedId",function(){return w}),a.d(t,"setOldFile",function(){return x}),a.d(t,"getData",function(){return j}),a.d(t,"getDataSimple",function(){return k}),a.d(t,"deleteData",function(){return E});var n=a(7),r=a.n(n),o=a(11),i=a(14),c=a(54),s=a(31),u=a(29),d=a.n(u),l=a(38),p=a.n(l),f=a(13),h=a(25);function b(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,u,l,h,b,g,v,m,y,S,O;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(t.prev=0,(n=new p.a).append("id",e.id),n.append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(e.page*s.d)),n.append("name",e.name),n.append("new",JSON.stringify(e.data)),void 0!==f.store.getState().table.region&&n.append("region",f.store.getState().table.region),void 0!==f.store.getState().table.point&&n.append("point",f.store.getState().table.point),void 0!=e.oldFile&&n.append("oldFile",e.oldFile),void 0!=e.oldFileWhatermark&&n.append("oldFileWhatermark",e.oldFileWhatermark),void 0!=e.file){for(n.append("fileLength",e.file.length),c=0;c<e.file.length;c++)n.append("file"+c,e.file[c]),n.append("fileName"+c,e.file[c].name);o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","Content-Type":"multipart/form-data; boundary=".concat(n._boundary),"X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}}else o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin};return t.next=15,d.a.post("/data/add",n,{headers:o});case 15:for(u=t.sent,l=[],h=0;h<u.data.row.length;h++)l.push({name:u.data.row[h],options:{filter:!0,sort:!0}});if(b=[],"\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(g=0;g<u.data.data.length;g++)b[g]=[u.data.data[g][0],u.data.data[g][1],u.data.data[g][2]];else if("\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(v=0;v<u.data.data.length;v++)b[v]=[u.data.data[v][0],u.data.data[v][1]];else if("\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434\u0430"==e.name)for(m=0;m<u.data.data.length;m++)b[m]=[u.data.data[m][0]];else if("\u0411\u043b\u043e\u0433"==e.name)for(y=0;y<u.data.data.length;y++)S=u.data.data[y][2].substring(0,200)+"...",b[y]=[u.data.data[y][0],u.data.data[y][1],S,u.data.data[y][3]];else b=JSON.parse(JSON.stringify(u.data.data));for(l.unshift("\u2116"),O=0;O<u.data.data.length;O++)b[O].unshift((e.page*s.d+O+1).toString());e={count:u.data.count,page:e.page,data:u.data.data,data1:b,row:l,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=29;break;case 26:t.prev=26,t.t0=t.catch(0),console.error(t.t0);case 29:case"end":return t.stop()}},t,this,[[0,26]])}));return function(e){return t.apply(this,arguments)}}()}function g(e){if(navigator.onLine)return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,u,l,h,b,g,v,m,y,S,O;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(t.prev=0,(n=new p.a).append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(e.page*s.d)),n.append("name",e.name),n.append("new",JSON.stringify(e.data)),void 0!==f.store.getState().table.region&&n.append("region",f.store.getState().table.region),void 0!==f.store.getState().table.point&&n.append("point",f.store.getState().table.point),void 0!=e.file){for(n.append("fileLength",e.file.length),c=0;c<e.file.length;c++)n.append("file"+c,e.file[c]),n.append("fileName"+c,e.file[c].name);o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","Content-Type":"multipart/form-data; boundary=".concat(n._boundary),"X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}}else o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin};return t.next=12,d.a.post("/data/add",n,{headers:o});case 12:for(u=t.sent,l=[],h=0;h<u.data.row.length;h++)l.push({name:u.data.row[h],options:{filter:!0,sort:!0}});if(b=[],"\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(g=0;g<u.data.data.length;g++)b[g]=[u.data.data[g][0],u.data.data[g][1],u.data.data[g][2]];else if("\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(v=0;v<u.data.data.length;v++)b[v]=[u.data.data[v][0],u.data.data[v][1]];else if("\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434\u0430"==e.name)for(m=0;m<u.data.data.length;m++)b[m]=[u.data.data[m][0]];else if("\u0411\u043b\u043e\u0433"==e.name)for(y=0;y<u.data.data.length;y++)S=u.data.data[y][2].substring(0,200)+"...",b[y]=[u.data.data[y][0],u.data.data[y][1],S,u.data.data[y][3]];else b=JSON.parse(JSON.stringify(u.data.data));for(l.unshift("\u2116"),O=0;O<u.data.data.length;O++)b[O].unshift((e.page*s.d+O+1).toString());e={count:u.data.count,page:e.page,data:u.data.data,data1:b,row:l,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=26;break;case 23:t.prev=23,t.t0=t.catch(0),console.error(t.t0);case 26:case"end":return t.stop()}},t,this,[[0,23]])}));return function(e){return t.apply(this,arguments)}}()}function v(e){return{type:i.f,payload:e}}function m(e){return{type:i.i,payload:e}}function y(e){return{type:i.e,payload:e}}function S(e){return{type:i.g,payload:e}}function O(e){return{type:i.h,payload:e}}function w(e){return{type:i.c,payload:e}}function x(e){return{type:i.d,payload:e}}function j(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,u,l,b,g,v,m,y,S,O,w,x;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(n=e.name+e.search+e.sort+JSON.stringify(e.page*s.d),(o=new p.a).append("search",e.search),o.append("sort",e.sort),o.append("skip",JSON.stringify(e.page*s.d)),o.append("name",e.name),void 0!==e.region?(o.append("region",e.region),n+=e.region):void 0!==f.store.getState().table.region&&(o.append("region",f.store.getState().table.region),n+=f.store.getState().table.region),void 0!==e.point?(o.append("point",e.point),n+=e.point):void 0!==f.store.getState().table.point&&(o.append("point",f.store.getState().table.point),n+=f.store.getState().table.point),t.prev=8,""!==e.name){t.next=14;break}e={count:0,page:0,data:[],data1:[],row:[],search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=45;break;case 14:if(!navigator.onLine){t.next=40;break}return t.next=17,d.a.post("/data/get",o,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 17:if(void 0===(c=t.sent)||void 0===c.data){t.next=29;break}for(u=[],l=0;l<c.data.row.length;l++)u.push({name:c.data.row[l],options:{filter:!0,sort:!0}});if(b=[],"\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(g=0;g<c.data.data.length;g++)b[g]=[c.data.data[g][0],c.data.data[g][1],c.data.data[g][2]];else if("\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(v=0;v<c.data.data.length;v++)b[v]=[c.data.data[v][0],c.data.data[v][1]];else if("\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434\u0430"==e.name)for(m=0;m<c.data.data.length;m++)b[m]=[c.data.data[m][0]];else if("\u0411\u043b\u043e\u0433"==e.name)for(y=0;y<c.data.data.length;y++)S=c.data.data[y][2].substring(0,200)+"...",b[y]=[c.data.data[y][0],c.data.data[y][1],S,c.data.data[y][3]];else b=JSON.parse(JSON.stringify(c.data.data));for(u.unshift("\u2116"),O=0;O<c.data.data.length;O++)b[O].unshift((e.page*s.d+O+1).toString());e={count:c.data.count,page:e.page,data:c.data.data,data1:b,row:u,search:e.search,name:e.name,region:e.region,point:e.point,sort:e.sort},Object(h.c)(n,e),t.next=38;break;case 29:return t.next=31,Object(h.a)(n);case 31:if(t.t0=t.sent,t.t1=void 0,t.t0===t.t1){t.next=38;break}return t.next=36,Object(h.a)(n);case 36:void 0!==(w=t.sent)&&(e=w.data);case 38:t.next=44;break;case 40:return t.next=42,Object(h.a)(n);case 42:void 0!==(x=t.sent)&&(e=x.data);case 44:void 0!==e&&a({type:i.a,payload:e});case 45:t.next=54;break;case 47:return t.prev=47,t.t2=t.catch(8),console.error(t.t2),t.next=52,Object(h.a)(n);case 52:void 0!==t.sent&&a({type:i.a,payload:e.data});case 54:case"end":return t.stop()}},t,this,[[8,47]])}));return function(e){return t.apply(this,arguments)}}()}d.a.interceptors.response.use(function(e){return e},function(e){return e.response.data.includes("to be unique")?f.store.dispatch(Object(c.showSnackBar)("\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u0442\u044c\u0441\u044f")):e.response.data.includes("Could not proxy request")?f.store.dispatch(Object(c.showSnackBar)("\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u0441 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u043e\u043c")):e.response.data.includes("No such user")?f.store.dispatch(Object(c.showSnackBar)("\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u0441 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u043e\u043c")):(console.log(e.response.data),f.store.dispatch(Object(c.showSnackBar)(e.response.data))),e});var k=function(){var e=Object(o.a)(r.a.mark(function e(t){var a,n,o,i;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(a={data:void 0},n=t.name,(o=new p.a).append("name",t.name),void 0!==t.data&&(o.append("data",JSON.stringify(t.data)),n+=JSON.stringify(t.data)),e.prev=5,!navigator.onLine){e.next=24;break}return e.next=9,d.a.post("/data/get",o,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 9:if(a=e.sent,e.t0=void 0===a||void 0===a.data,!e.t0){e.next=17;break}return e.next=14,Object(h.a)(n);case 14:e.t1=e.sent,e.t2=void 0,e.t0=e.t1!==e.t2;case 17:if(!e.t0){e.next=21;break}return e.next=20,Object(h.a)(n);case 20:a=e.sent;case 21:Object(h.c)(n,a.data),e.next=27;break;case 24:return e.next=26,Object(h.a)(n);case 26:a=e.sent;case 27:if(void 0===a){e.next=29;break}return e.abrupt("return",a.data);case 29:e.next=38;break;case 31:return e.prev=31,e.t3=e.catch(5),e.next=35,Object(h.a)(n);case 35:if(void 0===(i=e.sent)){e.next=38;break}return e.abrupt("return",i.data);case 38:case"end":return e.stop()}},e,this,[[5,31]])}));return function(t){return e.apply(this,arguments)}}();function E(e){var t=e.name+e.search+e.sort+JSON.stringify(e.page*s.d);return void 0!==e.region?t+=e.region:void 0!==f.store.getState().table.region&&(t+=f.store.getState().table.region),void 0!==e.point?t+=e.point:void 0!==f.store.getState().table.point&&(t+=f.store.getState().table.point),navigator.onLine?function(){var a=Object(o.a)(r.a.mark(function a(n){var o,c,u,l,b,g,v,m,y,S,O,w;return r.a.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,(o=new p.a).append("search",e.search),o.append("sort",e.sort),o.append("skip",JSON.stringify(e.page*s.d)),o.append("name",e.name),o.append("deleted",e.deleted),void 0!==f.store.getState().table.region&&o.append("region",f.store.getState().table.region),void 0!==f.store.getState().table.point&&o.append("point",f.store.getState().table.point),void 0!=e.oldFile&&e.oldFile.length>0&&o.append("oldFile",e.oldFile),a.next=12,d.a.post("/data/delete",o,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 12:if(void 0===(c=a.sent)||void 0===c.data){a.next=23;break}for(u=[],l=0;l<c.data.row.length;l++)u.push({name:c.data.row[l],options:{filter:!0,sort:!0}});if(b=[],"\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(g=0;g<c.data.data.length;g++)b[g]=[c.data.data[g][0],c.data.data[g][1],c.data.data[g][2]];else if("\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==e.name)for(v=0;v<c.data.data.length;v++)b[v]=[c.data.data[v][0],c.data.data[v][1]];else if("\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434\u0430"==e.name)for(m=0;m<c.data.data.length;m++)b[m]=[c.data.data[m][0]];else if("\u0411\u043b\u043e\u0433"==e.name)for(y=0;y<c.data.data.length;y++)S=c.data.data[y][2].substring(0,200)+"...",b[y]=[c.data.data[y][0],c.data.data[y][1],S,c.data.data[y][3]];else b=JSON.parse(JSON.stringify(c.data.data));for(u.unshift("\u2116"),O=0;O<c.data.data.length;O++)b[O].unshift((e.page*s.d+O+1).toString());e={count:c.data.count,page:e.page,data:c.data.data,data1:b,row:u,search:e.search,name:e.name,sort:e.sort},a.next=27;break;case 23:return a.next=25,Object(h.a)(t);case 25:void 0!==(w=a.sent)&&(e=w.data);case 27:void 0!==e&&n({type:i.a,payload:e}),a.next=37;break;case 30:return a.prev=30,a.t0=a.catch(0),console.error(a.t0),a.next=35,Object(h.a)(t);case 35:void 0!==a.sent&&n({type:i.a,payload:e});case 37:case"end":return a.stop()}},a,this,[[0,30]])}));return function(e){return a.apply(this,arguments)}}():function(){var e=Object(o.a)(r.a.mark(function e(a){var n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Object(h.a)(t);case 2:void 0!==(n=e.sent)&&a({type:i.a,payload:n.data});case 4:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}},93:function(e,t,a){"use strict";a.d(t,"b",function(){return _});var n=a(7),r=a.n(n),o=a(11),i=a(0),c=a.n(i),s=(a(175),a(55)),u=a(32),d=a(98),l=a(101),p=a(369),f=a(27),h=a(370),b=a(72),g=Object(i.lazy)(function(){return Promise.all([a.e(2),a.e(0),a.e(4)]).then(a.bind(null,371))}),v=Object(i.lazy)(function(){return a.e(5).then(a.bind(null,372))}),m=Object(i.lazy)(function(){return Promise.all([a.e(0),a.e(6)]).then(a.bind(null,388))}),y=Object(i.lazy)(function(){return Promise.all([a.e(25),a.e(7)]).then(a.bind(null,373))}),S=Object(i.lazy)(function(){return Promise.all([a.e(0),a.e(8)]).then(a.bind(null,374))}),O=Object(i.lazy)(function(){return Promise.all([a.e(27),a.e(9)]).then(a.bind(null,375))}),w=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(10)]).then(a.bind(null,376))}),x=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(11)]).then(a.bind(null,377))}),j=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(12)]).then(a.bind(null,378))}),k=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(13)]).then(a.bind(null,379))}),E=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(14)]).then(a.bind(null,380))}),A=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(15)]).then(a.bind(null,381))}),T=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(26),a.e(16)]).then(a.bind(null,382))}),N=Object(i.lazy)(function(){return Promise.all([a.e(0),a.e(17)]).then(a.bind(null,383))}),L=Object(i.lazy)(function(){return Promise.all([a.e(0),a.e(18)]).then(a.bind(null,384))}),P=Object(i.lazy)(function(){return Promise.all([a.e(0),a.e(19)]).then(a.bind(null,385))}),R=Object(i.lazy)(function(){return Promise.all([a.e(2),a.e(0),a.e(20)]).then(a.bind(null,386))}),I=Object(i.lazy)(function(){return Promise.all([a.e(1),a.e(0),a.e(21)]).then(a.bind(null,387))}),_=c.a.createRef();function q(e,t,a){return function(n){return c.a.createElement(i.Suspense,{fallback:c.a.createElement("div",null,"Loading...")},c.a.createElement(e,Object.assign({},n,{history:t,location:a})))}}t.a=Object(h.a)(Object(s.b)(function(e){return{user:e.user}},function(e){return{userActions:Object(u.b)(d,e),appActions:Object(u.b)(l,e)}})(function(e){var t=e.userActions,a=t.checkAuthenticated,n=t.setStatus,s=t.setReiting,u=e.appActions.setProfile;return Object(i.useEffect)(Object(o.a)(r.a.mark(function e(){var t;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a();case 2:return e.next=4,n();case 4:return e.next=6,Object(b.getDataSimple)({name:"\u041f\u0440\u043e\u0444\u0438\u043b\u044c"});case 6:return void 0!==(t=e.sent)&&u(t),e.next=10,Object(b.getDataSimple)({name:"\u0420\u0435\u0439\u0442\u0438\u043d\u0433 \u0441\u0432\u043e\u0439"});case 10:void 0!==(t=e.sent)&&s(t);case 12:case"end":return e.stop()}},e,this)})),[]),c.a.createElement("div",{ref:_,className:"App"},c.a.createElement(i.Suspense,{fallback:null},c.a.createElement(m,{history:e.history,location:e.location})),c.a.createElement(i.Suspense,{fallback:null},c.a.createElement(y,{history:e.history})),c.a.createElement("div",{className:"App-body"},c.a.createElement(p.a,null,c.a.createElement(f.a,{path:"/",exact:!0,component:q(v,e.history,e.location)}),c.a.createElement(f.a,{path:"/plan",exact:!0,component:q(w,e.history,e.location)}),c.a.createElement(f.a,{path:"/nnpt",exact:!0,component:q(x,e.history,e.location)}),c.a.createElement(f.a,{path:"/ns1",exact:!0,component:q(j,e.history,e.location)}),c.a.createElement(f.a,{path:"/ns2",exact:!0,component:q(k,e.history,e.location)}),c.a.createElement(f.a,{path:"/nnvv",exact:!0,component:q(E,e.history,e.location)}),c.a.createElement(f.a,{path:"/oo",exact:!0,component:q(T,e.history,e.location)}),c.a.createElement(f.a,{path:"/or",exact:!0,component:q(A,e.history,e.location)}),c.a.createElement(f.a,{path:"/rr",exact:!0,component:q(N,e.history,e.location)}),c.a.createElement(f.a,{path:"/ro",exact:!0,component:q(L,e.history,e.location)}),c.a.createElement(f.a,{path:"/blog",exact:!0,component:q(R,e.history,e.location)}),c.a.createElement(f.a,{path:"/FAQ",exact:!0,component:q(g,e.history,e.location)}),c.a.createElement(f.a,{path:"/profile",exact:!0,component:q(P,e.history,e.location)}),c.a.createElement(f.a,{path:"/statistic",exact:!0,component:q(I,e.history,e.location)}))),c.a.createElement(i.Suspense,{fallback:null},c.a.createElement(S,null)),c.a.createElement(i.Suspense,{fallback:null},c.a.createElement(O,null)))}))},98:function(e,t,a){"use strict";a.r(t),a.d(t,"signin",function(){return l}),a.d(t,"checkAuthenticated",function(){return p}),a.d(t,"setReiting",function(){return f}),a.d(t,"logout",function(){return h}),a.d(t,"setStatus",function(){return b});var n=a(7),r=a.n(n),o=a(11),i=a(24),c=a(53),s=a(29),u=a.n(s),d=a(37);function l(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,u.a.post("/users/signin?email="+e.email+"&password="+e.password);case 3:return n=t.sent,localStorage.userShoroAdmin=n.data,t.next=7,a({type:i.a});case 7:return t.next=9,a({type:c.b,payload:!1});case 9:window.location.reload(),t.next=16;break;case 12:return t.prev=12,t.t0=t.catch(0),t.next=16,a({type:i.b,payload:!0});case 16:case"end":return t.stop()}},t,this,[[0,12]])}));return function(e){return t.apply(this,arguments)}}()}function p(){return function(){var e=Object(o.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:try{localStorage.userShoroAdmin?t({type:i.a}):t({type:i.e})}catch(a){t({type:i.e})}case 1:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}function f(e){return{type:i.c,payload:e}}function h(){return function(){var e=Object(o.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:localStorage.removeItem("userShoroAdmin"),t({type:i.e}),window.location.reload();case 3:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}function b(){return function(){var e=Object(o.a)(r.a.mark(function e(t){var a,n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,a={data:void 0},!navigator.onLine){e.next=21;break}return e.next=5,u.a.post("/users/status",{},{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 5:if(a=e.sent,e.t0=void 0===a||void 0===a.data,!e.t0){e.next=13;break}return e.next=10,Object(d.a)(1);case 10:e.t1=e.sent,e.t2=void 0,e.t0=e.t1!==e.t2;case 13:if(!e.t0){e.next=17;break}return e.next=16,Object(d.a)(1);case 16:a=e.sent;case 17:return e.next=19,Object(d.c)(1,a.data);case 19:e.next=24;break;case 21:return e.next=23,Object(d.a)(1);case 23:a=e.sent;case 24:if(void 0===a.data){e.next=27;break}return e.next=27,t({type:i.d,payload:a.data});case 27:e.next=37;break;case 29:return e.prev=29,e.t3=e.catch(0),e.next=33,Object(d.a)(1);case 33:if(void 0===(n=e.sent.data)){e.next=37;break}return e.next=37,t({type:i.d,payload:n});case 37:case"end":return e.stop()}},e,this,[[0,29]])}));return function(t){return e.apply(this,arguments)}}()}}},[[166,28,23]]]);
//# sourceMappingURL=main.64ad0b71.chunk.js.map