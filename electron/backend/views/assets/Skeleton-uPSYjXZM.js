import{N as y,j as b,d as R,e as _,x as v,f as S,_ as s,y as u,r as A,i as U,k as $,l as M,n as j}from"./index-k7wCs-05.js";import{a as B}from"./Stack-CGbvLsS9.js";function N(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function X(t){return parseFloat(t)}const z=y(b.jsx("path",{d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"}),"ArrowBack");function L(t){return R("MuiSkeleton",t)}_("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const E=["animation","className","component","height","style","variant","width"];let r=t=>t,p,g,m,f;const F=t=>{const{classes:a,variant:e,animation:i,hasChildren:n,width:l,height:o}=t;return j({root:["root",e,i,n&&"withChildren",n&&!l&&"fitContent",n&&!o&&"heightAuto"]},L,a)},H=v(p||(p=r`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),I=v(g||(g=r`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),K=S("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,a)=>{const{ownerState:e}=t;return[a.root,a[e.variant],e.animation!==!1&&a[e.animation],e.hasChildren&&a.withChildren,e.hasChildren&&!e.width&&a.fitContent,e.hasChildren&&!e.height&&a.heightAuto]}})(({theme:t,ownerState:a})=>{const e=N(t.shape.borderRadius)||"px",i=X(t.shape.borderRadius);return s({display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:B(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em"},a.variant==="text"&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${i}${e}/${Math.round(i/.6*10)/10}${e}`,"&:empty:before":{content:'"\\00a0"'}},a.variant==="circular"&&{borderRadius:"50%"},a.variant==="rounded"&&{borderRadius:(t.vars||t).shape.borderRadius},a.hasChildren&&{"& > *":{visibility:"hidden"}},a.hasChildren&&!a.width&&{maxWidth:"fit-content"},a.hasChildren&&!a.height&&{height:"auto"})},({ownerState:t})=>t.animation==="pulse"&&u(m||(m=r`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),H),({ownerState:t,theme:a})=>t.animation==="wave"&&u(f||(f=r`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${0},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),I,(a.vars||a).palette.action.hover)),D=A.forwardRef(function(a,e){const i=U({props:a,name:"MuiSkeleton"}),{animation:n="pulse",className:l,component:o="span",height:d,style:k,variant:C="text",width:x}=i,h=$(i,E),c=s({},i,{animation:n,component:o,variant:C,hasChildren:!!h.children}),w=F(c);return b.jsx(K,s({as:o,ref:e,className:M(w.root,l),ownerState:c},h,{style:s({width:x,height:d},k)}))});export{z as A,D as S};
