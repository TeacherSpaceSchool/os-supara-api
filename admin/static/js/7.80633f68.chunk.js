(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{364:function(e,t,a){"use strict";a.r(t);var n=a(375),r=a(21),o=a.n(r),i=a(30),c=a(0),s=a.n(c),l=a(2),p=a.n(l),u=a(14),d=a(44),f=a(25),h=a(373),m=a(84),g=a.n(m),b=a(33),y=a.n(b),v=a(402),w=a(83),S=a(130),k=a(374),x=a(398),O=a.n(x),j=a(399),E=a.n(j),R=a(401),A=a.n(R),q=a(27),L=a.n(q),N=a(400),W=a.n(N),X=w.b.current.offsetWidth>800?500:240,C=w.b.current.offsetWidth>800?240:120,F=s.a.memo(function(e){Object(c.useEffect)(Object(i.a)(o.a.mark(function e(){var t,a,n,r,i,c,s;return o.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(-1!==u){e.next=19;break}return t=[],e.next=4,h.getDataSimple({name:"\u0420\u0435\u0433\u0438\u043e\u043d\u0418\u043c\u044f"});case 4:a=e.sent,n=0;case 6:if(!(n<a.length)){e.next=16;break}return r=[],e.next=10,h.getDataSimple({name:"\u0422\u043e\u0447\u043a\u0430\u041f\u043e\u0420\u0435\u0433\u0438\u043e\u043d\u0443",data:{region:a[n]}});case 10:for(i=e.sent,c=0;c<i.length;c++)r[c]={name:i[c],plan:0,current:0};t[n]={name:a[n],plan:0,current:0,points:r};case 13:n++,e.next=6;break;case 16:Y(t),e.next=28;break;case 19:return e.next=21,h.getDataSimple({name:"\u041f\u043b\u0430\u043d\u041f\u043e\u0414\u0430\u0442\u0435",data:{date:d[u][0]}});case 21:s=e.sent,N(s.date.split("-")),x(s.date),P(s.norma),M(s.current),T(s._id),Y(JSON.parse(s.regions));case 28:case"end":return e.stop()}},e,this)})),[]);var t=e.tableActions,a=t.setSelected,r=t.addData,l=t.setData,p=e.table,u=p.selected,d=p.data,f=e.classes,m=(e.user.status,Object(c.useState)("2019-01-01")),b=Object(n.a)(m,2),w=b[0],x=b[1],j=Object(c.useState)(["0","0","0"]),R=Object(n.a)(j,2),q=R[0],N=R[1],X=Object(c.useState)("2019-01-01"),C=Object(n.a)(X,2),F=C[0],T=C[1],H=Object(c.useState)(0),J=Object(n.a)(H,2),D=J[0],M=J[1],z=Object(c.useState)(0),B=Object(n.a)(z,2),I=B[0],P=B[1],U=Object(c.useState)([]),_=Object(n.a)(U,2),K=_[0],Y=_[1];return s.a.createElement("div",null,s.a.createElement("br",null),s.a.createElement("br",null),-1===u?s.a.createElement(s.a.Fragment,null,s.a.createElement(S.a,{views:["year","month"],label:"\u0414\u0430\u0442\u0430",className:f.textField,value:w,onChange:x}),s.a.createElement("br",null)):s.a.createElement("div",{class:f.message},s.a.createElement("h3",null,k.a[parseInt(q[1])-1]+" "+q[0])),s.a.createElement("div",{className:f.message},s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},I)),s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},D))),s.a.createElement("br",null),void 0!=K&&K.length>0?K.map(function(e,t){return s.a.createElement(O.a,null,s.a.createElement(E.a,{expandIcon:s.a.createElement(W.a,null)},s.a.createElement(L.a,{className:f.heading},e.name),s.a.createElement(L.a,{className:f.secondaryHeading},"\u0426\u0435\u043b\u044c: ",s.a.createElement("b",{style:{color:"black"}},e.plan),"\xa0\xa0 \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("b",{style:{color:"black"}},e.current))),s.a.createElement(A.a,null,void 0!=e.points&&e.points.length>0?e.points.map(function(e,a){return s.a.createElement("center",{style:{width:"100%"}},s.a.createElement("b",null,e.name),s.a.createElement("br",null),s.a.createElement("div",{style:{width:"40px",marginRight:"10px",display:"inline-block",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c:"),s.a.createElement(g.a,{style:{marginTop:"12px",marginRight:"10px",width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:e.plan,onChange:function(e){!function(e,t,a){var n=parseInt(e.target.value);K[t].points[a].plan=isNaN(n)?0:n,K[t].plan=0;for(var r=0;r<K[t].points.length;r++)K[t].plan+=K[t].points[r].plan;n=0;for(var o=0;o<K.length;o++)n+=K[o].plan;Y(K),P(n)}(e,t,a)}}),s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},e.current)))}):null))}):null,s.a.createElement("br",null),s.a.createElement("div",null,s.a.createElement(v.a,{className:"link",to:""},s.a.createElement(y.a,{variant:"contained",color:"primary",onClick:function(){-1===u?r({search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:I,regions:JSON.stringify(K),date:w}}):l({id:F,search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:I,regions:JSON.stringify(K)}}),a(-1)},className:f.button},"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c")),s.a.createElement(v.a,{className:"link",to:"",onClick:function(){a(-1)}},s.a.createElement(y.a,{variant:"contained",color:"secondary",className:f.button},"\u041e\u0442\u043c\u0435\u043d\u0430"))))});Event.propTypes={classes:p.a.object.isRequired},t.default=Object(u.withStyles)(function(e){return{button:{margin:e.spacing.unit},textFieldSmall:{display:"inline-block",marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:C},textField:{marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:X},urls:{margin:e.spacing.unit,width:X,maxHeight:100,overflow:"auto"},message:{width:X,marginTop:e.spacing.unit,marginBottom:e.spacing.unit,marginLeft:"calc((100% - "+X+"px)/2)",marginRight:"calc((100% - "+X+"px)/2)"},MuiPickersToolbar:{toolbar:{backgroundColor:"#000"}},MuiPickersModal:{dialogAction:{color:"#000"}},heading:{fontSize:e.typography.pxToRem(15),flexBasis:"33.33%",flexShrink:0},secondaryHeading:{fontSize:e.typography.pxToRem(15),color:e.palette.text.secondary}}})(Object(d.b)(function(e){return{user:e.user,table:e.table}},function(e){return{tableActions:Object(f.b)(h,e)}})(F))},373:function(e,t,a){"use strict";a.r(t),a.d(t,"setData",function(){return d}),a.d(t,"addData",function(){return f}),a.d(t,"setSelected",function(){return h}),a.d(t,"getIds",function(){return m}),a.d(t,"getData",function(){return g}),a.d(t,"getDataSimple",function(){return b}),a.d(t,"deleteData",function(){return y});var n=a(21),r=a.n(n),o=a(30),i=a(47),c=a(63),s=a.n(c),l=a(378),p=a.n(l),u=a(374);function d(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,l,d,f,h,m,g,b,y;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(t.prev=0,(n=new p.a).append("id",e.id),n.append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(10*e.page)),n.append("name",e.name),n.append("new",JSON.stringify(e.data)),void 0!=e.oldFile&&n.append("oldFile",e.oldFile),void 0!=e.oldFileWhatermark&&n.append("oldFileWhatermark",e.oldFileWhatermark),void 0!=e.file){for(n.append("fileLength",e.file.length),c=0;c<e.file.length;c++)n.append("file"+c,e.file[c]),n.append("fileName"+c,e.file[c].name);o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","Content-Type":"multipart/form-data; boundary=".concat(n._boundary),"X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}}else o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin};return t.next=13,s.a.post("/data/add",n,{headers:o});case 13:for(l=t.sent,d=[],f=0;f<l.data.row.length;f++)d.push({name:l.data.row[f],options:{filter:!0,sort:!0}});if(h=[],"\u041f\u043b\u0430\u043d"==e.name)for(m=0;m<l.data.data.length;m++){for(g=[],b=0;b<l.data.data[m].length;b++)y=l.data.data[m][b],0===b&&(y=y.split("-"),y=u.a[parseInt(y[1])-1]+" "+y[0]),g.push(y);h.push(g)}else h=l.data.data;e={count:l.data.count,page:e.page,data:l.data.data,data1:h,row:d,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=25;break;case 22:t.prev=22,t.t0=t.catch(0),console.error(t.t0);case 25:case"end":return t.stop()}},t,this,[[0,22]])}));return function(e){return t.apply(this,arguments)}}()}function f(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,l,d,f,h,m,g,b,y;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(t.prev=0,(n=new p.a).append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(10*e.page)),n.append("name",e.name),n.append("new",JSON.stringify(e.data)),void 0!=e.file){for(n.append("fileLength",e.file.length),c=0;c<e.file.length;c++)n.append("file"+c,e.file[c]),n.append("fileName"+c,e.file[c].name);o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","Content-Type":"multipart/form-data; boundary=".concat(n._boundary),"X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}}else o={accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin};return t.next=10,s.a.post("/data/add",n,{headers:o});case 10:for(l=t.sent,d=[],f=0;f<l.data.row.length;f++)d.push({name:l.data.row[f],options:{filter:!0,sort:!0}});if(h=[],"\u041f\u043b\u0430\u043d"==e.name)for(m=0;m<l.data.data.length;m++){for(g=[],b=0;b<l.data.data[m].length;b++)y=l.data.data[m][b],0===b&&(y=y.split("-"),y=u.a[parseInt(y[1])-1]+" "+y[0]),g.push(y);h.push(g)}else h=l.data.data;e={count:l.data.count,page:e.page,data:l.data.data,data1:h,row:d,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=22;break;case 19:t.prev=19,t.t0=t.catch(0),console.error(t.t0);case 22:case"end":return t.stop()}},t,this,[[0,19]])}));return function(e){return t.apply(this,arguments)}}()}function h(e){return{type:i.c,payload:e}}function m(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,(n=new p.a).append("name",e),t.next=5,s.a.post("/data/getIds",n,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 5:o=t.sent,a({type:i.b,payload:o.data}),t.next=12;break;case 9:t.prev=9,t.t0=t.catch(0),console.error(t.t0);case 12:case"end":return t.stop()}},t,this,[[0,9]])}));return function(e){return t.apply(this,arguments)}}()}function g(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,l,d,f,h,m,g;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,(n=new p.a).append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(10*e.page)),n.append("name",e.name),t.next=8,s.a.post("/data/get",n,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 8:for(o=t.sent,c=[],l=0;l<o.data.row.length;l++)c.push({name:o.data.row[l],options:{filter:!0,sort:!0}});if(d=[],"\u041f\u043b\u0430\u043d"==e.name)for(f=0;f<o.data.data.length;f++){for(h=[],m=0;m<o.data.data[f].length;m++)g=o.data.data[f][m],0===m&&(g=g.split("-"),g=u.a[parseInt(g[1])-1]+" "+g[0]),h.push(g);d.push(h)}else d=o.data.data;e={count:o.data.count,page:e.page,data:o.data.data,data1:d,row:c,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=20;break;case 17:t.prev=17,t.t0=t.catch(0),console.error(t.t0);case 20:case"end":return t.stop()}},t,this,[[0,17]])}));return function(e){return t.apply(this,arguments)}}()}var b=function(){var e=Object(o.a)(r.a.mark(function e(t){var a,n;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,(a=new p.a).append("name",t.name),void 0!==t.data&&a.append("data",JSON.stringify(t.data)),e.next=6,s.a.post("/data/get",a,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 6:return n=e.sent,e.abrupt("return",n.data);case 10:e.prev=10,e.t0=e.catch(0),console.error(e.t0);case 13:case"end":return e.stop()}},e,this,[[0,10]])}));return function(t){return e.apply(this,arguments)}}();function y(e){return function(){var t=Object(o.a)(r.a.mark(function t(a){var n,o,c,l,d,f,h,m,g;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,(n=new p.a).append("search",e.search),n.append("sort",e.sort),n.append("skip",JSON.stringify(10*e.page)),n.append("name",e.name),n.append("deleted",e.deleted),void 0!=e.oldFile&&e.oldFile.length>0&&n.append("oldFile",e.oldFile),t.next=10,s.a.post("/data/delete",n,{headers:{accept:"application/json","Accept-Language":"en-US,en;q=0.8","X-Requested-With":"XMLHttpRequest",Authorization:"Bearer "+localStorage.userShoroAdmin}});case 10:for(o=t.sent,c=[],l=0;l<o.data.row.length;l++)c.push({name:o.data.row[l],options:{filter:!0,sort:!0}});if(d=[],"\u041f\u043b\u0430\u043d"==e.name)for(f=0;f<o.data.data.length;f++){for(h=[],m=0;m<o.data.data[f].length;m++)g=o.data.data[f][m],0===m&&(g=g.split("-"),g=u.a[parseInt(g[1])-1]+" "+g[0]),h.push(g);d.push(h)}else d=o.data.data;e={count:o.data.count,page:e.page,data:o.data.data,data1:d,row:c,search:e.search,name:e.name,sort:e.sort},a({type:i.a,payload:e}),t.next=22;break;case 19:t.prev=19,t.t0=t.catch(0),console.error(t.t0);case 22:case"end":return t.stop()}},t,this,[[0,19]])}));return function(e){return t.apply(this,arguments)}}()}},374:function(e,t,a){"use strict";a.d(t,"a",function(){return n});var n=["\u044f\u043d\u0432\u0430\u0440\u044c","\u0444\u0435\u0432\u0440\u0430\u043b\u044c","\u043c\u0430\u0440\u0442","\u0430\u043f\u0440\u0435\u043b\u044c","\u043c\u0430\u0439","\u0438\u044e\u043d\u044c","\u0438\u044e\u043b\u044c","\u0430\u0432\u0433\u0443\u0441\u0442","\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c","\u043e\u043a\u0442\u044f\u0431\u0440\u044c","\u043d\u043e\u044f\u0431\u0440\u044c","\u0434\u0435\u043a\u0430\u0431\u0440\u044c"]},402:function(e,t,a){"use strict";var n=a(0),r=a.n(n),o=a(2),i=a.n(o),c=a(17),s=a.n(c),l=a(85),p=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e};function u(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}var d=function(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)},f=function(e){function t(){var a,n;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);for(var r=arguments.length,o=Array(r),i=0;i<r;i++)o[i]=arguments[i];return a=n=u(this,e.call.apply(e,[this].concat(o))),n.handleClick=function(e){if(n.props.onClick&&n.props.onClick(e),!e.defaultPrevented&&0===e.button&&!n.props.target&&!d(e)){e.preventDefault();var t=n.context.router.history,a=n.props,r=a.replace,o=a.to;r?t.replace(o):t.push(o)}},u(n,a)}return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),t.prototype.render=function(){var e=this.props,t=(e.replace,e.to),a=e.innerRef,n=function(e,t){var a={};for(var n in e)t.indexOf(n)>=0||Object.prototype.hasOwnProperty.call(e,n)&&(a[n]=e[n]);return a}(e,["replace","to","innerRef"]);s()(this.context.router,"You should not use <Link> outside a <Router>"),s()(void 0!==t,'You must specify the "to" property');var o=this.context.router.history,i="string"===typeof t?Object(l.b)(t,null,null,o.location):t,c=o.createHref(i);return r.a.createElement("a",p({},n,{onClick:this.handleClick,href:c,ref:a}))},t}(r.a.Component);f.propTypes={onClick:i.a.func,target:i.a.string,replace:i.a.bool,to:i.a.oneOfType([i.a.string,i.a.object]).isRequired,innerRef:i.a.oneOfType([i.a.string,i.a.func])},f.defaultProps={replace:!1},f.contextTypes={router:i.a.shape({history:i.a.shape({push:i.a.func.isRequired,replace:i.a.func.isRequired,createHref:i.a.func.isRequired}).isRequired}).isRequired},t.a=f}}]);
//# sourceMappingURL=7.80633f68.chunk.js.map