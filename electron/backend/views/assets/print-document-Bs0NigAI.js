import{e as s,j as e,aZ as h,B as t,T as i,az as j,b as k,S as C}from"./index-BGwmLYst.js";import{a as T,T as w}from"./TableContainer-CasmigDT.js";const z=`
@page {
  size: A4 landscape;
  margin: 5mm;
}

@media print {
  html, body {
    width: 297mm;
    height: 210mm;
    margin:0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`,I=`
  @page {
    size: A4 portrait;
    margin: 5mm;
  }

  @media print {
    html,
    body {
      width: 210mm;
      min-height: 297mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`,S=(...o)=>o.map(r=>String(r||"").trim()).filter(Boolean).join(" - "),v=o=>{const r=(o==null?void 0:o.logoEglise)||(o==null?void 0:o.logoUtilisateur);return r?/^(https?:|data:|blob:|file:)/i.test(r)?r:o!=null&&o.logoEglise&&r===o.logoEglise?j(r):k(r):null};function P({identity:o,logoUrl:r}){return e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:1.5,p:1.35,mb:1.4,border:"1px solid rgba(15, 39, 74, 0.18)",borderBottom:"3px solid #0f274a",borderRadius:1.4,backgroundColor:"#ffffff"},children:[e.jsx(t,{sx:{width:44,height:44,borderRadius:1.1,bgcolor:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",p:.4,flexShrink:0,border:"1px solid rgba(15, 39, 74, 0.14)"},children:r?e.jsx(t,{component:"img",src:r,alt:"Logo eglise",sx:{width:"100%",height:"100%",objectFit:"contain"}}):e.jsx(i,{sx:{color:"#0f172a",fontWeight:900},children:"MC"})}),e.jsxs(t,{sx:{minWidth:0},children:[e.jsx(i,{sx:{fontSize:"1.08rem",fontWeight:900,lineHeight:1.15,color:"#0f274a",overflowWrap:"anywhere"},children:o.nomEgliseCourt||o.nomTemple||"Communauté locale"}),e.jsx(i,{sx:{mt:.25,color:"#63758c",fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:.8},children:"État imprimable"})]})]})}function A({contactLine:o,showPagination:r}){return e.jsx(t,{className:"print-page-footer",sx:{mt:2,pt:1,borderTop:"1px solid rgba(15, 39, 74, 0.12)",color:"#5b6b7f",fontSize:"0.72rem"},children:e.jsxs(C,{direction:"row",justifyContent:"space-between",alignItems:"center",spacing:2,children:[e.jsx(i,{variant:"caption",sx:{color:"inherit"},children:o||"Document interne de l'église"}),r?e.jsx(i,{variant:"caption",sx:{color:"inherit"},children:"Page 1"}):e.jsx(t,{})]})})}function M({identity:o,orientation:r="landscape",title:c,variant:d="default",showDocumentMeta:m=!0,showCountMeta:E=!0,showPagination:f=!1,children:p}){const g=s(n=>n.application.userConnected),a={...s(n=>n.authentification.utilisateurData)||{},...g||{},...o||{}},u=v(a),b=d==="plain",l=r==="landscape"?"281mm":"190mm",x=S(a.lieuEglise,a.telephoneSecretariatEglise||a.telephoneUtilisateur,a.emailEglise||a.email,a.boitePostaleEglise);return e.jsxs(e.Fragment,{children:[e.jsx(h,{styles:{"@page":{size:`A4 ${r}`,margin:"5mm"},"@media print":{"html, body":{WebkitPrintColorAdjust:"exact",printColorAdjust:"exact",backgroundColor:"#ffffff"},".print-document-root":{width:`${l} !important`,maxWidth:`${l} !important`,minHeight:r==="landscape"?"194mm":"281mm",paddingBottom:"10mm"},".print-block-avoid-break":{breakInside:"avoid",pageBreakInside:"avoid"},".print-page-footer":{position:"fixed",left:"5mm",right:"5mm",bottom:"5mm",marginTop:0,backgroundColor:"#ffffff"}}}}),e.jsxs(t,{className:"print-document-root",sx:{width:"100%",maxWidth:"100%",background:"#fff",color:"#111827",display:"flex",flexDirection:"column",p:0,minHeight:r==="landscape"?720:1040,"@media print":{width:"100%",maxWidth:"100%",background:"#fff",padding:0,margin:0,minHeight:"auto"}},children:[e.jsx(P,{identity:a,logoUrl:u}),e.jsxs(t,{sx:{width:"100%",position:"relative",overflow:"visible",flex:1,background:"transparent",color:"#111827",border:"none",borderRadius:0,p:0},children:[m&&e.jsx(e.Fragment,{children:e.jsx(t,{className:"print-block-avoid-break",sx:{mb:b?1.2:2,px:2,py:1.05,border:"1.5px solid #0f274a",borderRadius:1.2,backgroundColor:"#eef4ff",textAlign:"center"},children:e.jsx(i,{sx:{fontSize:r==="landscape"?"1.08rem":"1rem",fontWeight:900,color:"#0f274a",textTransform:"uppercase",letterSpacing:.8,lineHeight:1.15},children:c})})}),p]}),e.jsx(A,{contactLine:x,showPagination:f})]})]})}function H({children:o,minWidth:r=760}){return e.jsx(T,{className:"print-block-avoid-break",sx:{borderRadius:1.6,width:"100%",maxWidth:"100%",border:"1px solid rgba(15, 39, 74, 0.16)",overflow:"hidden",backgroundColor:"#ffffff","@media print":{borderRadius:1.2}},children:e.jsx(w,{sx:{minWidth:r,width:"100%",tableLayout:"fixed","& .MuiTableCell-root":{py:1.1,px:1.15,borderColor:"rgba(15, 39, 74, 0.10)",verticalAlign:"top",whiteSpace:"normal",wordBreak:"break-word",color:"#10233f"},"& .MuiTableHead-root":{backgroundColor:"#eaf2ff","& .MuiTableCell-root":{color:"#0f274a",fontWeight:800,textTransform:"uppercase",fontSize:"0.7rem",letterSpacing:.5,py:.9}},"& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)":{backgroundColor:"#f8fafc"},"& .MuiTableRow-root":{breakInside:"avoid",pageBreakInside:"avoid"},"@media print":{minWidth:"100%","& .MuiTableCell-root":{py:.65,px:.72,fontSize:"0.68rem",lineHeight:1.2},"& .MuiTableHead-root .MuiTableCell-root":{fontSize:"0.62rem",lineHeight:1.1}}},children:o})})}function L({title:o,message:r}){return e.jsxs(t,{sx:{py:8,textAlign:"center",borderRadius:3,border:"1px dashed rgba(15, 23, 42, 0.16)",backgroundColor:"#fafcff"},children:[e.jsx(i,{variant:"h6",sx:{mb:1,fontWeight:700},children:o}),e.jsx(i,{variant:"body2",color:"text.secondary",children:r})]})}export{M as P,L as a,H as b,I as c,z as d};
