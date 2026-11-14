import{u as N,h as c,m as H,o as i,c as d,a as t,e as P,v as L,g as k,t as a,f,F as E,q as V,w as I,k as C,z as M,s as O}from"./index-BWohHawG.js";const F={class:"space-y-6"},q={class:"flex items-center justify-between"},G={class:"flex items-center space-x-3"},U={key:0,class:"grid grid-cols-1 md:grid-cols-4 gap-4"},Q={class:"card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"},K={class:"text-3xl font-bold"},W={class:"card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"},Y={class:"text-3xl font-bold"},J={class:"card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"},X={class:"text-2xl font-bold"},Z={class:"card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"},tt={class:"text-2xl font-bold"},et={key:1,class:"flex items-center justify-center py-12"},st={key:2,class:"card"},ot={class:"overflow-x-auto"},at={class:"table"},nt={class:"font-mono font-semibold text-primary-700"},lt={class:"font-bold text-emerald-700"},it=["onClick"],dt={key:3,class:"card p-12 text-center"},rt={class:"bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"},ct={class:"sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl"},pt={class:"flex items-center justify-between"},ut={class:"text-2xl font-bold"},mt={class:"text-primary-100 text-sm mt-1"},vt={class:"p-6"},bt={class:"bg-slate-50 rounded-lg p-4 mb-6"},xt={class:"grid grid-cols-2 gap-4"},ft={class:"font-semibold"},gt={class:"font-semibold"},ht={class:"mb-6"},_t={class:"space-y-3"},wt={class:"flex items-start justify-between"},yt={class:"flex-1"},kt={class:"font-semibold text-slate-800"},Ct={class:"text-sm text-slate-600"},$t={class:"text-right"},Tt={class:"font-bold text-primary-700"},Et={class:"flex items-center justify-between mt-2 text-sm"},Vt={class:"text-slate-600"},Mt={key:0,class:"text-orange-600"},jt={class:"border-t-2 border-slate-200 pt-4 space-y-2"},zt={class:"flex justify-between text-slate-700"},Dt={class:"font-semibold"},St={key:0,class:"flex justify-between text-orange-600"},Rt={class:"font-semibold"},At={class:"flex justify-between text-2xl font-bold text-emerald-700"},Bt={class:"mt-6 flex gap-3"},Nt={key:1,class:"flex-1 btn btn-secondary py-3 opacity-50 cursor-not-allowed"},Lt={__name:"MiHistorialView",setup(Ht){const j=N(),{success:z,error:g}=M(),h=c(!1),_=c([]),r=c(null),w=c(new Date().toISOString().slice(0,10)),p=c(!1),l=c(null),y=c([]),n=o=>`Bs. ${parseFloat(o||0).toFixed(2)}`,D=o=>new Date(o).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),$=o=>new Date(o).toLocaleString("es-BO",{dateStyle:"long",timeStyle:"short"}),S=o=>({EFECTIVO:"badge-success",CREDITO:"badge-warning",QR:"badge-primary"})[o]||"badge-secondary",m=async()=>{h.value=!0;try{const o=await C.getMiHistorial({fecha:w.value});_.value=o.data.data.ventas,r.value=o.data.data.resumen}catch(o){console.error("Error loading historial:",o),g("Error al cargar el historial")}finally{h.value=!1}},R=async o=>{try{const e=await C.getById(o.id);l.value=e.data.data,y.value=e.data.data.detalles||[],p.value=!0}catch(e){console.error("Error loading detalle:",e),g("Error al cargar el detalle de la venta")}},A=o=>{var T;const e=window.open("","_blank","width=300,height=600"),s=o.cliente_nombre||"Público General",u=o.cliente_nit||"S/N",v=((T=j.user)==null?void 0:T.nombre)||"Vendedor",b=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${o.numero_venta}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 80mm;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 5mm;
          background: white;
        }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
        .header h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .header p { font-size: 10px; line-height: 1.3; }
        .info { margin-bottom: 10px; font-size: 10px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .items { margin-bottom: 10px; }
        .item { margin-bottom: 6px; }
        .item-name { font-weight: bold; margin-bottom: 2px; }
        .item-details { display: flex; justify-content: space-between; font-size: 10px; }
        .totals { border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
        .total-row.main { font-size: 14px; font-weight: bold; margin-top: 6px; }
        .payment { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; }
        .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; font-size: 9px; }
        @media print {
          body { padding: 2mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FERRETERÍA</h1>
        <p>Sistema de Punto de Venta</p>
        <p>La Paz - Bolivia</p>
      </div>

      <div class="info">
        <div class="info-row"><span>Nº Venta:</span><strong>${o.numero_venta}</strong></div>
        <div class="info-row"><span>Fecha:</span><span>${$(o.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${s}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${u}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${v}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${y.value.map(x=>`
          <div class="item">
            <div class="item-name">${x.nombre_producto}</div>
            <div class="item-details">
              <span>${x.cantidad} x ${n(x.precio_unitario)}</span>
              <strong>${n(x.total)}</strong>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="totals">
        <div class="total-row"><span>Subtotal:</span><span>${n(o.subtotal)}</span></div>
        ${o.descuento>0?`<div class="total-row"><span>Descuento:</span><span>-${n(o.descuento)}</span></div>`:""}
        <div class="total-row main"><span>TOTAL:</span><span>${n(o.total)}</span></div>
      </div>

      <div class="payment">
        <div class="info-row"><span>Método de pago:</span><strong>${o.metodo_pago}</strong></div>
      </div>

      <div class="footer">
        <p>¡Gracias por su compra!</p>
        <p>Este documento no es válido como factura</p>
        <p style="margin-top: 8px; font-weight: bold;">*** REIMPRESIÓN ***</p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        }
      <\/script>
    </body>
    </html>
  `;e.document.write(b),e.document.close()},B=async o=>{var u,v;if(!await M().confirm(`¿Estás seguro de que deseas ANULAR la venta ${o.numero_venta}?

Esta acción:
- Devolvería el stock de los productos
- Anularía cualquier crédito asociado
- Se registraría en auditoría`))return;const s=prompt("Motivo de la anulación:","Error en venta");if(s)try{await C.anular(o.id,{razon:s}),z(`Venta ${o.numero_venta} anulada exitosamente`),p.value=!1,await m()}catch(b){console.error("Error al anular venta:",b),g(((v=(u=b.response)==null?void 0:u.data)==null?void 0:v.message)||"Error al anular la venta")}};return H(()=>{m()}),(o,e)=>(i(),d("div",F,[t("div",q,[e[6]||(e[6]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-800"},"Mi Historial de Ventas"),t("p",{class:"text-slate-600 mt-1"},"Revisa tus ventas del día")],-1)),t("div",G,[P(t("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>w.value=s),type:"date",class:"input",onChange:m},null,544),[[L,w.value]]),t("button",{onClick:m,class:"btn btn-primary"},[...e[5]||(e[5]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})],-1),k(" Actualizar ",-1)])])])]),r.value?(i(),d("div",U,[t("div",Q,[e[7]||(e[7]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Ventas",-1)),t("div",K,a(r.value.cantidad_ventas||0),1)]),t("div",W,[e[8]||(e[8]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Cobrado",-1)),t("div",Y,a(n(r.value.total_vendido||0)),1)]),t("div",J,[e[9]||(e[9]=t("div",{class:"text-sm opacity-90 mb-1"},"Efectivo",-1)),t("div",X,a(n(r.value.total_efectivo||0)),1)]),t("div",Z,[e[10]||(e[10]=t("div",{class:"text-sm opacity-90 mb-1"},"Tarjeta + QR",-1)),t("div",tt,a(n((r.value.total_tarjeta||0)+(r.value.total_qr||0))),1)])])):f("",!0),h.value?(i(),d("div",et,[...e[11]||(e[11]=[t("div",{class:"spinner"},null,-1)])])):_.value.length>0?(i(),d("div",st,[t("div",ot,[t("table",at,[e[12]||(e[12]=t("thead",null,[t("tr",null,[t("th",null,"Nº Venta"),t("th",null,"Hora"),t("th",null,"Cliente"),t("th",null,"Método Pago"),t("th",null,"Subtotal"),t("th",null,"Descuento"),t("th",null,"Total"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),d(E,null,V(_.value,s=>(i(),d("tr",{key:s.id},[t("td",nt,a(s.numero_venta),1),t("td",null,a(D(s.fecha)),1),t("td",null,a(s.cliente_nombre||"Público General"),1),t("td",null,[t("span",{class:O(["badge",S(s.metodo_pago)])},a(s.metodo_pago),3)]),t("td",null,a(n(s.subtotal)),1),t("td",null,a(s.descuento>0?n(s.descuento):"-"),1),t("td",lt,a(n(s.total)),1),t("td",null,[t("button",{onClick:u=>R(s),class:"btn btn-sm btn-secondary"}," Ver Detalle ",8,it)])]))),128))])])])])):(i(),d("div",dt,[...e[13]||(e[13]=[t("svg",{class:"w-20 h-20 mx-auto mb-4 text-slate-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})],-1),t("h3",{class:"text-xl font-semibold text-slate-700 mb-2"},"No hay ventas",-1),t("p",{class:"text-slate-500"},"No se registraron ventas en esta fecha",-1)])])),p.value&&l.value?(i(),d("div",{key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",onClick:e[4]||(e[4]=I(s=>p.value=!1,["self"]))},[t("div",rt,[t("div",ct,[t("div",pt,[t("div",null,[t("h2",ut,a(l.value.numero_venta),1),t("p",mt,a($(l.value.fecha)),1)]),t("button",{onClick:e[1]||(e[1]=s=>p.value=!1),class:"text-white hover:bg-primary-600 p-2 rounded-lg"},[...e[14]||(e[14]=[t("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)])])])]),t("div",vt,[t("div",bt,[t("div",xt,[t("div",null,[e[15]||(e[15]=t("div",{class:"text-sm text-slate-600"},"Cliente",-1)),t("div",ft,a(l.value.cliente_nombre||"Público General"),1)]),t("div",null,[e[16]||(e[16]=t("div",{class:"text-sm text-slate-600"},"Método de Pago",-1)),t("div",gt,a(l.value.metodo_pago),1)])])]),t("div",ht,[e[17]||(e[17]=t("h3",{class:"font-semibold text-lg text-slate-800 mb-3"},"Productos",-1)),t("div",_t,[(i(!0),d(E,null,V(y.value,s=>(i(),d("div",{key:s.id,class:"bg-slate-50 rounded-lg p-4"},[t("div",wt,[t("div",yt,[t("h4",kt,a(s.nombre_producto),1),t("p",Ct,"SKU: "+a(s.codigo_producto),1)]),t("div",$t,[t("div",Tt,a(n(s.total)),1)])]),t("div",Et,[t("span",Vt,a(s.cantidad)+" x "+a(n(s.precio_unitario)),1),s.descuento>0?(i(),d("span",Mt,"Desc: "+a(n(s.descuento)),1)):f("",!0)])]))),128))])]),t("div",jt,[t("div",zt,[e[18]||(e[18]=t("span",null,"Subtotal:",-1)),t("span",Dt,a(n(l.value.subtotal)),1)]),l.value.descuento>0?(i(),d("div",St,[e[19]||(e[19]=t("span",null,"Descuento:",-1)),t("span",Rt,"-"+a(n(l.value.descuento)),1)])):f("",!0),t("div",At,[e[20]||(e[20]=t("span",null,"TOTAL:",-1)),t("span",null,a(n(l.value.total)),1)])]),t("div",Bt,[t("button",{onClick:e[2]||(e[2]=s=>A(l.value)),class:"flex-1 btn btn-primary py-3"},[...e[21]||(e[21]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),k(" Reimprimir Recibo ",-1)])]),l.value.estado==="COMPLETADA"?(i(),d("button",{key:0,onClick:e[3]||(e[3]=s=>B(l.value)),class:"flex-1 btn btn-danger py-3"},[...e[22]||(e[22]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1),k(" Anular Venta ",-1)])])):(i(),d("div",Nt," Venta "+a(l.value.estado),1))])])])])):f("",!0)]))}};export{Lt as default};
