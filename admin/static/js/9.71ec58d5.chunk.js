(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{372:function(e,t,n){"use strict";n.r(t);var a=n(387),r=n(15),i=n.n(r),l=n(20),o=n(0),c=n.n(o),s=n(2),u=n.n(s),p=n(13),m=n(51),d=n(29),f=n(68),g=n(91),b=n.n(g),h=n(37),y=n.n(h),v=n(413),E=n(90),O=n(92),x=n(31),k=n(401),j=n.n(k),w=n(402),S=n.n(w),R=n(404),N=n.n(R),C=n(34),T=n.n(C),A=n(403),D=n.n(A),J=void 0===E.b||E.b.current.offsetWidth>800?500:240,P=void 0===E.b||E.b.current.offsetWidth>800?240:120,q=c.a.memo(function(e){Object(o.useEffect)(Object(l.a)(i.a.mark(function t(){var n,a,r,l,o,c,s,u,d;return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if("active"===g.status&&["admin","\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"].includes(g.role)||e.history.push("/"),-1!==p){t.next=21;break}return n=[],t.next=5,f.getDataSimple({name:"\u0420\u0435\u0433\u0438\u043e\u043d\u0418\u043c\u044f"});case 5:if(void 0===(a=t.sent)){t.next=19;break}r=0;case 8:if(!(r<a.length)){t.next=18;break}return l=[],t.next=12,f.getDataSimple({name:"\u0422\u043e\u0447\u043a\u0430\u041f\u043e\u0420\u0435\u0433\u0438\u043e\u043d\u0443",data:{region:a[r]}});case 12:for(o=t.sent,c=0;c<o.length;c++)l[c]={name:o[c],plan:"",current:0};n[r]={name:a[r],plan:0,current:0,points:l};case 15:r++,t.next=8;break;case 18:U(n);case 19:t.next=37;break;case 21:return t.next=23,f.getDataSimple({name:"\u041f\u043b\u0430\u043d\u041f\u043e\u0414\u0430\u0442\u0435",data:{date:m[p][0]}});case 23:if(void 0===(s=t.sent)){t.next=37;break}if(U(JSON.parse(s.regions)),w(s.date),B(s.norma),K(s.current),H(s._id),"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==g.role){t.next=37;break}for(u=JSON.parse(s.regions),d=0;d<u.length;d++)A.region===u[d].name&&(B(JSON.parse(s.regions)[0].plan),K(JSON.parse(s.regions)[0].current));return t.next=35,f.getDataSimple({name:"\u041f\u0440\u043e\u0444\u0438\u043b\u044c"});case 35:s=t.sent,J(s);case 37:case"end":return t.stop()}},t,this)})),[]);var t=e.tableActions,n=t.setSelected,r=t.addData,s=t.setData,u=e.table,p=u.selected,m=u.data,d=e.classes,g=e.user.status,h=Object(o.useState)("2019-01-01"),E=Object(a.a)(h,2),k=E[0],w=E[1],R=Object(o.useState)({}),C=Object(a.a)(R,2),A=C[0],J=C[1],P=Object(o.useState)("2019-01-01"),q=Object(a.a)(P,2),M=q[0],H=q[1],W=Object(o.useState)(0),_=Object(a.a)(W,2),F=_[0],K=_[1],L=Object(o.useState)(0),Y=Object(a.a)(L,2),z=Y[0],B=Y[1],I=Object(o.useState)([]),G=Object(a.a)(I,2),Q=G[0],U=G[1];return c.a.createElement("div",null,c.a.createElement("br",null),c.a.createElement("br",null),-1===p?c.a.createElement(c.a.Fragment,null,c.a.createElement(O.a,{views:["year","month"],label:"\u0414\u0430\u0442\u0430",className:d.textField,value:k,onChange:w}),c.a.createElement("br",null)):c.a.createElement("div",{class:d.message},c.a.createElement("h3",null,k)),c.a.createElement("div",{className:d.message},c.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c: ",c.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},z)),c.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",c.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},0!==z&&""!==z?Math.round(100*F/z)+"%":F))),c.a.createElement("br",null),void 0!=Q&&Q.length>0?Q.map(function(e,t){if("admin"==g.role||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==g.role&&A.region===e.name)return c.a.createElement(j.a,null,c.a.createElement(S.a,{expandIcon:c.a.createElement(D.a,null)},c.a.createElement(T.a,{className:d.heading},e.name),c.a.createElement(T.a,{className:d.secondaryHeading},"\u0426\u0435\u043b\u044c: ",c.a.createElement("b",{style:{color:"black"}},e.plan),"\xa0\xa0 \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",c.a.createElement("b",{style:{color:"black"}},0!==e.plan&&""!==e.plan?Math.round(100*e.current/e.plan)+"%":e.current))),void 0!=e.points&&e.points.length>0?e.points.map(function(e,n){return c.a.createElement(N.a,null,c.a.createElement("center",{style:{width:"100%"}},c.a.createElement("b",null,e.name),c.a.createElement("br",null),c.a.createElement("div",{style:{width:"40px",marginRight:"10px",display:"inline-block",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c:"),c.a.createElement(b.a,{style:{marginTop:"12px",marginRight:"10px",width:"70px",display:"inline-block",verticalAlign:"middle"},type:"number",margin:"normal",value:e.plan,onChange:function(e){!function(e,t,n){var a=parseInt(e.target.value);Q[t].points[n].plan=isNaN(a)?"":a,Q[t].plan=0;for(var r=0;r<Q[t].points.length;r++)Q[t].plan+=Object(x.a)(Q[t].points[r].plan);a=0;for(var i=0;i<Q.length;i++)a+=Object(x.a)(Q[i].plan);U(Q),B(a)}(e,t,n)}}),c.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",c.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},0!==e.plan&&""!==e.plan?Math.round(100*e.current/e.plan)+"%":e.current))))}):null)}):null,c.a.createElement("br",null),c.a.createElement("div",null,c.a.createElement(v.a,{className:"link",to:""},c.a.createElement(y.a,{variant:"contained",color:"primary",onClick:function(){-1===p?r({search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:z,regions:JSON.stringify(Q),date:x.c[new Date(k).getMonth()]+" "+(1900+new Date(k).getYear())}}):s({id:M,search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:z,regions:JSON.stringify(Q)}}),n(-1)},className:d.button},"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c")),c.a.createElement(v.a,{className:"link",to:"",onClick:function(){n(-1)}},c.a.createElement(y.a,{variant:"contained",color:"secondary",className:d.button},"\u041e\u0442\u043c\u0435\u043d\u0430"))))});Event.propTypes={classes:u.a.object.isRequired},t.default=Object(p.withStyles)(function(e){return{button:{margin:e.spacing.unit},textFieldSmall:{display:"inline-block",marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:P},textField:{marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:J},urls:{margin:e.spacing.unit,width:J,maxHeight:100,overflow:"auto"},message:{width:J,marginTop:e.spacing.unit,marginBottom:e.spacing.unit,marginLeft:"calc((100% - "+J+"px)/2)",marginRight:"calc((100% - "+J+"px)/2)"},MuiPickersToolbar:{toolbar:{backgroundColor:"#000"}},MuiPickersModal:{dialogAction:{color:"#000"}},heading:{fontSize:e.typography.pxToRem(15),flexBasis:"33.33%",flexShrink:0},secondaryHeading:{fontSize:e.typography.pxToRem(15),color:e.palette.text.secondary}}})(Object(m.b)(function(e){return{user:e.user,table:e.table}},function(e){return{tableActions:Object(d.b)(f,e)}})(q))},413:function(e,t,n){"use strict";var a=n(0),r=n.n(a),i=n(2),l=n.n(i),o=n(22),c=n.n(o),s=n(93),u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e};function p(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}var m=function(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)},d=function(e){function t(){var n,a;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);for(var r=arguments.length,i=Array(r),l=0;l<r;l++)i[l]=arguments[l];return n=a=p(this,e.call.apply(e,[this].concat(i))),a.handleClick=function(e){if(a.props.onClick&&a.props.onClick(e),!e.defaultPrevented&&0===e.button&&!a.props.target&&!m(e)){e.preventDefault();var t=a.context.router.history,n=a.props,r=n.replace,i=n.to;r?t.replace(i):t.push(i)}},p(a,n)}return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),t.prototype.render=function(){var e=this.props,t=(e.replace,e.to),n=e.innerRef,a=function(e,t){var n={};for(var a in e)t.indexOf(a)>=0||Object.prototype.hasOwnProperty.call(e,a)&&(n[a]=e[a]);return n}(e,["replace","to","innerRef"]);c()(this.context.router,"You should not use <Link> outside a <Router>"),c()(void 0!==t,'You must specify the "to" property');var i=this.context.router.history,l="string"===typeof t?Object(s.b)(t,null,null,i.location):t,o=i.createHref(l);return r.a.createElement("a",u({},a,{onClick:this.handleClick,href:o,ref:n}))},t}(r.a.Component);d.propTypes={onClick:l.a.func,target:l.a.string,replace:l.a.bool,to:l.a.oneOfType([l.a.string,l.a.object]).isRequired,innerRef:l.a.oneOfType([l.a.string,l.a.func])},d.defaultProps={replace:!1},d.contextTypes={router:l.a.shape({history:l.a.shape({push:l.a.func.isRequired,replace:l.a.func.isRequired,createHref:l.a.func.isRequired}).isRequired}).isRequired},t.a=d}}]);
//# sourceMappingURL=9.71ec58d5.chunk.js.map