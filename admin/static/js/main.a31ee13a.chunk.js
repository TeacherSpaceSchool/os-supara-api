(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{154:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(16),o=n.n(c),u=(n(160),n(83));Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var i=n(44),l=n(25),s=n(19),d=n(20),p={authenticated:!1,error:!1,status:{}};var h=n(43),f={title:"",child:null,show:!1};var b=n(89),m={drawer:!1};var y=n(47),v={count:0,page:0,data:[],data1:[],row:[],search:"",name:"",sort:"",selected:-1,ids:{}};var E=Object(l.c)({mini_dialog:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:f,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case h.b:return Object(s.a)({},e,{show:t.payload});case h.a:return Object(s.a)({},e,{title:t.payload.title,child:t.payload.child});default:return e}},user:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:p,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case d.a:return Object(s.a)({},e,{authenticated:!0,error:!1});case d.d:return Object(s.a)({},e,{authenticated:!1,error:!1});case d.b:return Object(s.a)({},e,{error:t.payload});case d.c:return Object(s.a)({},e,{status:t.payload});default:return e}},table:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case y.b:return Object(s.a)({},e,{ids:t.payload});case y.c:return Object(s.a)({},e,{selected:t.payload});case y.a:return Object(s.a)({},e,{count:t.payload.count,page:t.payload.page,data:t.payload.data,data1:t.payload.data1,row:t.payload.row,search:t.payload.search,name:t.payload.name,sort:t.payload.sort});default:return e}},app:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:m,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case b.a:return Object(s.a)({},e,{drawer:t.payload});default:return e}}}),w=n(134);var O=n(487),j=n(130),g=n(14),A=n(138),S=n(128),x=n.n(S);n.d(t,"store",function(){return P});var k,T=Object(g.createMuiTheme)({overrides:{MuiPickersToolbar:{toolbar:{backgroundColor:"#202124"}},MuiPickersCalendarHeader:{switchHeader:{}},MuiPickersDay:{day:{color:"#202124"},isSelected:{backgroundColor:"#202124"},current:{color:"#202124"}},MuiPickersModal:{dialogAction:{color:"#202124"}}}}),P=Object(l.d)(E,k,Object(l.a)(w.a));o.a.hydrate(r.a.createElement(g.MuiThemeProvider,{theme:T},r.a.createElement(j.b,{utils:A.a,locale:x.a},r.a.createElement(O.a,null,r.a.createElement(i.a,{store:P},r.a.createElement(u.a,null))))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},155:function(e,t,n){e.exports=n(154)},160:function(e,t,n){},164:function(e,t,n){},20:function(e,t,n){"use strict";n.d(t,"a",function(){return a}),n.d(t,"d",function(){return r}),n.d(t,"b",function(){return c}),n.d(t,"c",function(){return o});var a="AUTHENTICATED",r="UNAUTHENTICATED",c="ERROR_AUTHENTICATED",o="SET_STATUS"},43:function(e,t,n){"use strict";n.d(t,"a",function(){return a}),n.d(t,"b",function(){return r});var a="SET_MINI_DIALOG",r="SHOW_MINI_DIALOG"},47:function(e,t,n){"use strict";n.d(t,"a",function(){return a}),n.d(t,"b",function(){return r}),n.d(t,"c",function(){return c}),n.d(t,"d",function(){return o});var a="GET_DATA",r="GET_IDS",c="SET_SELECTED",o="SET_VAR"},83:function(e,t,n){"use strict";n.d(t,"b",function(){return S});var a=n(21),r=n.n(a),c=n(30),o=n(0),u=n.n(o),i=(n(164),n(44)),l=n(25),s=n(85),d=n(359),p=n(29),h=n(360),f=Object(o.lazy)(function(){return n.e(3).then(n.bind(null,361))}),b=Object(o.lazy)(function(){return Promise.all([n.e(1),n.e(4)]).then(n.bind(null,371))}),m=Object(o.lazy)(function(){return Promise.all([n.e(17),n.e(5)]).then(n.bind(null,362))}),y=Object(o.lazy)(function(){return Promise.all([n.e(1),n.e(6)]).then(n.bind(null,363))}),v=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(7)]).then(n.bind(null,364))}),E=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(8)]).then(n.bind(null,365))}),w=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(9)]).then(n.bind(null,366))}),O=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(10)]).then(n.bind(null,367))}),j=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(11)]).then(n.bind(null,368))}),g=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(12)]).then(n.bind(null,369))}),A=Object(o.lazy)(function(){return Promise.all([n.e(0),n.e(18),n.e(13)]).then(n.bind(null,370))}),S=u.a.createRef();function x(e,t,n){return function(a){return u.a.createElement(o.Suspense,{fallback:u.a.createElement("div",null,"Loading...")},u.a.createElement(e,Object.assign({},a,{history:t,location:n})))}}t.a=Object(h.a)(Object(i.b)(function(e){return{user:e.user}},function(e){return{userActions:Object(l.b)(s,e)}})(function(e){var t=e.userActions,n=t.checkAuthenticated,a=t.setStatus;return Object(o.useEffect)(Object(c.a)(r.a.mark(function e(){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n();case 2:return e.next=4,a();case 4:case"end":return e.stop()}},e,this)})),[]),u.a.createElement("div",{ref:S,className:"App"},u.a.createElement(o.Suspense,{fallback:null},u.a.createElement(b,{history:e.history,location:e.location})),u.a.createElement(o.Suspense,{fallback:null},u.a.createElement(m,{history:e.history})),u.a.createElement("div",{className:"App-body"},u.a.createElement(d.a,null,u.a.createElement(p.a,{path:"/",exact:!0,component:x(f,e.history,e.location)}),u.a.createElement(p.a,{path:"/plan",exact:!0,component:x(v,e.history,e.location)}),u.a.createElement(p.a,{path:"/nnpt",exact:!0,component:x(E,e.history,e.location)}),u.a.createElement(p.a,{path:"/ns1",exact:!0,component:x(w,e.history,e.location)}),u.a.createElement(p.a,{path:"/ns2",exact:!0,component:x(O,e.history,e.location)}),u.a.createElement(p.a,{path:"/nnvv",exact:!0,component:x(j,e.history,e.location)}),u.a.createElement(p.a,{path:"/oo",exact:!0,component:x(A,e.history,e.location)}),u.a.createElement(p.a,{path:"/or",exact:!0,component:x(g,e.history,e.location)}))),u.a.createElement(o.Suspense,{fallback:null},u.a.createElement(y,null)))}))},85:function(e,t,n){"use strict";n.r(t),n.d(t,"signin",function(){return s}),n.d(t,"checkAuthenticated",function(){return d}),n.d(t,"logout",function(){return p}),n.d(t,"setStatus",function(){return h});var a=n(21),r=n.n(a),c=n(30),o=n(20),u=n(43),i=n(63),l=n.n(i);function s(e){return function(){var t=Object(c.a)(r.a.mark(function t(n){var a;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,l.a.post("/users/signin?email="+e.email+"&password="+e.password);case 3:return a=t.sent,localStorage.userShoroAdmin=a.data,t.next=7,n({type:o.a});case 7:return t.next=9,n({type:u.b,payload:!1});case 9:window.location.reload(),t.next=16;break;case 12:return t.prev=12,t.t0=t.catch(0),t.next=16,n({type:o.b,payload:!0});case 16:case"end":return t.stop()}},t,this,[[0,12]])}));return function(e){return t.apply(this,arguments)}}()}function d(){return function(){var e=Object(c.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:try{localStorage.userShoroAdmin?t({type:o.a}):t({type:o.d})}catch(n){t({type:o.d})}case 1:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}function p(){return function(){var e=Object(c.a)(r.a.mark(function e(t){return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:localStorage.removeItem("userShoroAdmin"),t({type:o.d}),window.location.reload();case 3:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}function h(){return function(){var e=Object(c.a)(r.a.mark(function e(t){var n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,l.a.post("/users/status",{},{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 3:return n=e.sent,e.next=6,t({type:o.c,payload:n.data});case 6:e.next=11;break;case 8:e.prev=8,e.t0=e.catch(0),console.error(e.t0);case 11:case"end":return e.stop()}},e,this,[[0,8]])}));return function(t){return e.apply(this,arguments)}}()}},89:function(e,t,n){"use strict";n.d(t,"a",function(){return a});var a="SHOW_DRAWER"}},[[155,19,15]]]);
//# sourceMappingURL=main.a31ee13a.chunk.js.map