import{e as l,j as e,aU as h,B as r,S as c,T as i,D as b,av as j,b as w}from"./index-BRNsbvVc.js";import{a as T,T as v}from"./TableContainer-DLSZYY84.js";const L=`
  @page {
    size: A4 landscape;
    margin: 12mm;
  }

  @media print {
    html,
    body {
      width: 297mm;
      min-height: 210mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`,y=`
  @page {
    size: A4 portrait;
    margin: 10mm;
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
`,C=(...t)=>t.map(o=>String(o||"").trim()).filter(Boolean).join(" - "),k=t=>{const o=(t==null?void 0:t.logoEglise)||(t==null?void 0:t.logoUtilisateur);return o?/^(https?:|data:|blob:|file:)/i.test(o)?o:t!=null&&t.logoEglise&&o===t.logoEglise?j(o):w(o):null};function P({identity:t,logoUrl:o}){return e.jsxs(r,{sx:{display:"grid",gridTemplateColumns:"88px minmax(0, 1fr)",alignItems:"center",gap:2,pb:1.75,mb:2.25,borderBottom:"2px solid #0f274a"},children:[e.jsx(r,{sx:{width:38,height:38,borderRadius:1.1,bgcolor:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",p:.4},children:o?e.jsx(r,{component:"img",src:o,alt:"Logo eglise",sx:{width:"100%",height:"100%",objectFit:"contain"}}):e.jsx(i,{sx:{color:"#0f172a",fontWeight:900},children:"MC"})}),e.jsx(i,{variant:"h4",sx:{fontWeight:900,lineHeight:1.05,color:"#0f274a"},children:t.nomEgliseCourt||t.nomTemple||"Communaute locale"})]})}function S({contactLine:t,showPagination:o}){return e.jsx(r,{className:"print-page-footer",sx:{mt:2,pt:1,borderTop:"1px solid rgba(15, 39, 74, 0.12)",color:"#5b6b7f",fontSize:"0.72rem"},children:e.jsxs(c,{direction:"row",justifyContent:"space-between",alignItems:"center",spacing:2,children:[e.jsx(i,{variant:"caption",sx:{color:"inherit"},children:t||"Document interne de l'eglise"}),o?e.jsx(i,{variant:"caption",sx:{color:"inherit"},children:"Page 1"}):e.jsx(r,{})]})})}function B({identity:t,orientation:o="landscape",title:d,variant:E="default",showDocumentMeta:m=!0,showCountMeta:A=!0,showPagination:p=!1,children:g}){const u=l(n=>n.application.userConnected),a={...l(n=>n.authentification.utilisateurData)||{},...u||{},...t||{}},x=k(a),s=o==="landscape"?"273mm":"190mm",f=C(a.lieuEglise,a.telephoneSecretariatEglise||a.telephoneUtilisateur,a.emailEglise||a.email,a.boitePostaleEglise);return e.jsxs(e.Fragment,{children:[e.jsx(h,{styles:{"@page":{size:`A4 ${o}`,margin:"8mm"},"@media print":{"html, body":{WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},".print-document-root":{width:`${s} !important`,maxWidth:`${s} !important`,paddingBottom:"18mm",minHeight:o==="landscape"?"186mm":"273mm"},".print-block-avoid-break":{breakInside:"avoid",pageBreakInside:"avoid"},".print-page-footer":{position:"fixed",left:"12mm",right:"12mm",bottom:"6mm",marginTop:0,backgroundColor:"#ffffff"}}}}),e.jsxs(r,{className:"print-document-root",sx:{width:"100%",maxWidth:"100%",background:"#fff",color:"#111827",display:"flex",flexDirection:"column",p:0,"@media print":{width:"100%",maxWidth:"100%",background:"#fff",padding:0,margin:0,minHeight:"auto"}},children:[e.jsx(P,{identity:a,logoUrl:x}),e.jsxs(r,{sx:{width:"100%",position:"relative",overflow:"visible",flex:1,background:"transparent",color:"#111827",border:"none",borderRadius:0,p:0},children:[m&&e.jsxs(e.Fragment,{children:[e.jsx(c,{direction:{xs:"column",md:"row"},spacing:2,justifyContent:"space-between",alignItems:{xs:"flex-start",md:"center"},sx:{mb:1.5},children:e.jsx(r,{children:e.jsx(i,{variant:"h4",sx:{fontWeight:900,color:"#0f274a",textTransform:"uppercase",letterSpacing:.8},children:d})})}),e.jsx(b,{sx:{mb:3}})]}),g]}),e.jsx(S,{contactLine:f,showPagination:p})]})]})}function D({children:t,minWidth:o=760}){return e.jsx(T,{className:"print-block-avoid-break",sx:{borderRadius:3,width:"100%",maxWidth:"100%",border:"1px solid rgba(15, 23, 42, 0.1)",overflow:"hidden","@media print":{borderRadius:2}},children:e.jsx(v,{sx:{minWidth:o,width:"100%",tableLayout:"fixed","& .MuiTableCell-root":{py:1.5,px:1.5,borderColor:"rgba(15, 23, 42, 0.08)",verticalAlign:"top",whiteSpace:"normal",wordBreak:"break-word"},"& .MuiTableHead-root":{backgroundColor:"#e8f0fb","& .MuiTableCell-root":{color:"#0f274a",fontWeight:800,textTransform:"uppercase",fontSize:"0.75rem",letterSpacing:.5}},"& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)":{backgroundColor:"#f8fafc"},"& .MuiTableRow-root":{breakInside:"avoid",pageBreakInside:"avoid"},"@media print":{minWidth:"100%","& .MuiTableCell-root":{py:.8,px:.9,fontSize:"0.72rem",lineHeight:1.2}}},children:t})})}function M({title:t,message:o}){return e.jsxs(r,{sx:{py:8,textAlign:"center",borderRadius:3,border:"1px dashed rgba(15, 23, 42, 0.16)",backgroundColor:"#fafcff"},children:[e.jsx(i,{variant:"h6",sx:{mb:1,fontWeight:700},children:t}),e.jsx(i,{variant:"body2",color:"text.secondary",children:o})]})}export{B as P,M as a,D as b,y as c,L as d};
