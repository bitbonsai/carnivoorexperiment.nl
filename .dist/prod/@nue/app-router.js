import{onclick as L,loadPage as M,setActive as N}from"./view-transitions.js";var O=typeof window=="object",D=[];async function I(q){for(let{pattern:x,fn:z}of D){let B=J(x,q);if(B)await z(B)}N(q)}O&&addEventListener("before:route",()=>{D.splice(0,D.length)});var Q={on(q,x){D.push({pattern:q,fn:x})},start({path:q,root:x}){if(x)L(x,this.route);this.pattern=q,I(location.pathname)},route(q){scrollTo(0,0);let x=q.endsWith(".html");history.pushState({path:q,is_spa:!x},0,q),x?M(q):I(q)},set(q,x){let z=new URLSearchParams(location.search);z.set(q,x),history.replaceState(Q.data,0,`?${z}`)},get data(){let{pattern:q}=this,x=q?J(q,location.pathname,!0):{},z=Object.fromEntries(new URLSearchParams(location.search));return{...x,...z}}};function J(q,x,z){let B=q.split("/").slice(1),F=x.split("/").slice(1);if(!z&&B.length!=F.length)return null;let G=!0,H={};return B.forEach((E,K)=>{let C=F[K];if(E[0]==":"){if(C)H[E.slice(1)]=1*C||C}else if(!z&&E!=C)G=!1}),G?H:null}export{Q as router,J as match};
