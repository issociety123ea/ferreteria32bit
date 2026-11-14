import{u as A,h as c,m as B,o as i,c as d,a as t,e as N,v as R,g as w,t as a,f as x,F as $,q as E,w as H,k as y,s as P}from"./index-DnKAQFL7.js";const L={class:"space-y-6"},I={class:"flex items-center justify-between"},O={class:"flex items-center space-x-3"},F={key:0,class:"grid grid-cols-1 md:grid-cols-4 gap-4"},q={class:"card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"},G={class:"text-3xl font-bold"},U={class:"card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"},Q={class:"text-3xl font-bold"},K={class:"card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"},W={class:"text-2xl font-bold"},Y={class:"card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"},J={class:"text-2xl font-bold"},X={key:1,class:"flex items-center justify-center py-12"},Z={key:2,class:"card"},tt={class:"overflow-x-auto"},et={class:"table"},st={class:"font-mono font-semibold text-primary-700"},ot={class:"font-bold text-emerald-700"},at=["onClick"],nt={key:3,class:"card p-12 text-center"},lt={class:"bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"},it={class:"sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl"},dt={class:"flex items-center justify-between"},rt={class:"text-2xl font-bold"},ct={class:"text-primary-100 text-sm mt-1"},pt={class:"p-6"},ut={class:"bg-slate-50 rounded-lg p-4 mb-6"},mt={class:"grid grid-cols-2 gap-4"},vt={class:"font-semibold"},bt={class:"font-semibold"},xt={class:"mb-6"},gt={class:"space-y-3"},ft={class:"flex items-start justify-between"},ht={class:"flex-1"},_t={class:"font-semibold text-slate-800"},wt={class:"text-sm text-slate-600"},yt={class:"text-right"},kt={class:"font-bold text-primary-700"},Ct={class:"flex items-center justify-between mt-2 text-sm"},$t={class:"text-slate-600"},Et={key:0,class:"text-orange-600"},Tt={class:"border-t-2 border-slate-200 pt-4 space-y-2"},Vt={class:"flex justify-between text-slate-700"},Mt={class:"font-semibold"},jt={key:0,class:"flex justify-between text-orange-600"},zt={class:"font-semibold"},Dt={class:"flex justify-between text-2xl font-bold text-emerald-700"},St={class:"mt-6 flex gap-3"},At={key:1,class:"flex-1 btn btn-secondary py-3 opacity-50 cursor-not-allowed"},Rt={__name:"MiHistorialView",setup(Bt){const T=A(),g=c(!1),f=c([]),r=c(null),h=c(new Date().toISOString().slice(0,10)),p=c(!1),l=c(null),_=c([]),n=o=>`Bs. ${parseFloat(o||0).toFixed(2)}`,V=o=>new Date(o).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),k=o=>new Date(o).toLocaleString("es-BO",{dateStyle:"long",timeStyle:"short"}),M=o=>({EFECTIVO:"badge-success",CREDITO:"badge-warning",QR:"badge-primary"})[o]||"badge-secondary",m=async()=>{g.value=!0;try{const o=await y.getMiHistorial({fecha:h.value});f.value=o.data.data.ventas,r.value=o.data.data.resumen}catch(o){console.error("Error loading historial:",o),alert("Error al cargar el historial")}finally{g.value=!1}},j=async o=>{try{const e=await y.getById(o.id);l.value=e.data.data,_.value=e.data.data.detalles||[],p.value=!0}catch(e){console.error("Error loading detalle:",e),alert("Error al cargar el detalle de la venta")}},z=o=>{var C;const e=window.open("","_blank","width=300,height=600"),s=o.cliente_nombre||"Público General",u=o.cliente_nit||"S/N",v=((C=T.user)==null?void 0:C.nombre)||"Vendedor",S=`
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
        <div class="info-row"><span>Fecha:</span><span>${k(o.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${s}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${u}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${v}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${_.value.map(b=>`
          <div class="item">
            <div class="item-name">${b.nombre_producto}</div>
            <div class="item-details">
              <span>${b.cantidad} x ${n(b.precio_unitario)}</span>
              <strong>${n(b.total)}</strong>
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
  `;e.document.write(S),e.document.close()},D=async o=>{var s,u;if(!confirm(`¿Estás seguro de que deseas ANULAR la venta ${o.numero_venta}?

Esta acción:
- Devolvería el stock de los productos
- Anularía cualquier crédito asociado
- Se registraría en auditoría`))return;const e=prompt("Motivo de la anulación:","Error en venta");if(e)try{await y.anular(o.id,{razon:e}),alert(`✓ Venta ${o.numero_venta} anulada exitosamente`),p.value=!1,await m()}catch(v){console.error("Error al anular venta:",v),alert(((u=(s=v.response)==null?void 0:s.data)==null?void 0:u.message)||"Error al anular la venta")}};return B(()=>{m()}),(o,e)=>(i(),d("div",L,[t("div",I,[e[6]||(e[6]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-800"},"Mi Historial de Ventas"),t("p",{class:"text-slate-600 mt-1"},"Revisa tus ventas del día")],-1)),t("div",O,[N(t("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>h.value=s),type:"date",class:"input",onChange:m},null,544),[[R,h.value]]),t("button",{onClick:m,class:"btn btn-primary"},[...e[5]||(e[5]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})],-1),w(" Actualizar ",-1)])])])]),r.value?(i(),d("div",F,[t("div",q,[e[7]||(e[7]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Ventas",-1)),t("div",G,a(r.value.cantidad_ventas||0),1)]),t("div",U,[e[8]||(e[8]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Cobrado",-1)),t("div",Q,a(n(r.value.total_vendido||0)),1)]),t("div",K,[e[9]||(e[9]=t("div",{class:"text-sm opacity-90 mb-1"},"Efectivo",-1)),t("div",W,a(n(r.value.total_efectivo||0)),1)]),t("div",Y,[e[10]||(e[10]=t("div",{class:"text-sm opacity-90 mb-1"},"Tarjeta + QR",-1)),t("div",J,a(n((r.value.total_tarjeta||0)+(r.value.total_qr||0))),1)])])):x("",!0),g.value?(i(),d("div",X,[...e[11]||(e[11]=[t("div",{class:"spinner"},null,-1)])])):f.value.length>0?(i(),d("div",Z,[t("div",tt,[t("table",et,[e[12]||(e[12]=t("thead",null,[t("tr",null,[t("th",null,"Nº Venta"),t("th",null,"Hora"),t("th",null,"Cliente"),t("th",null,"Método Pago"),t("th",null,"Subtotal"),t("th",null,"Descuento"),t("th",null,"Total"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),d($,null,E(f.value,s=>(i(),d("tr",{key:s.id},[t("td",st,a(s.numero_venta),1),t("td",null,a(V(s.fecha)),1),t("td",null,a(s.cliente_nombre||"Público General"),1),t("td",null,[t("span",{class:P(["badge",M(s.metodo_pago)])},a(s.metodo_pago),3)]),t("td",null,a(n(s.subtotal)),1),t("td",null,a(s.descuento>0?n(s.descuento):"-"),1),t("td",ot,a(n(s.total)),1),t("td",null,[t("button",{onClick:u=>j(s),class:"btn btn-sm btn-secondary"}," Ver Detalle ",8,at)])]))),128))])])])])):(i(),d("div",nt,[...e[13]||(e[13]=[t("svg",{class:"w-20 h-20 mx-auto mb-4 text-slate-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})],-1),t("h3",{class:"text-xl font-semibold text-slate-700 mb-2"},"No hay ventas",-1),t("p",{class:"text-slate-500"},"No se registraron ventas en esta fecha",-1)])])),p.value&&l.value?(i(),d("div",{key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",onClick:e[4]||(e[4]=H(s=>p.value=!1,["self"]))},[t("div",lt,[t("div",it,[t("div",dt,[t("div",null,[t("h2",rt,a(l.value.numero_venta),1),t("p",ct,a(k(l.value.fecha)),1)]),t("button",{onClick:e[1]||(e[1]=s=>p.value=!1),class:"text-white hover:bg-primary-600 p-2 rounded-lg"},[...e[14]||(e[14]=[t("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)])])])]),t("div",pt,[t("div",ut,[t("div",mt,[t("div",null,[e[15]||(e[15]=t("div",{class:"text-sm text-slate-600"},"Cliente",-1)),t("div",vt,a(l.value.cliente_nombre||"Público General"),1)]),t("div",null,[e[16]||(e[16]=t("div",{class:"text-sm text-slate-600"},"Método de Pago",-1)),t("div",bt,a(l.value.metodo_pago),1)])])]),t("div",xt,[e[17]||(e[17]=t("h3",{class:"font-semibold text-lg text-slate-800 mb-3"},"Productos",-1)),t("div",gt,[(i(!0),d($,null,E(_.value,s=>(i(),d("div",{key:s.id,class:"bg-slate-50 rounded-lg p-4"},[t("div",ft,[t("div",ht,[t("h4",_t,a(s.nombre_producto),1),t("p",wt,"SKU: "+a(s.codigo_producto),1)]),t("div",yt,[t("div",kt,a(n(s.total)),1)])]),t("div",Ct,[t("span",$t,a(s.cantidad)+" x "+a(n(s.precio_unitario)),1),s.descuento>0?(i(),d("span",Et,"Desc: "+a(n(s.descuento)),1)):x("",!0)])]))),128))])]),t("div",Tt,[t("div",Vt,[e[18]||(e[18]=t("span",null,"Subtotal:",-1)),t("span",Mt,a(n(l.value.subtotal)),1)]),l.value.descuento>0?(i(),d("div",jt,[e[19]||(e[19]=t("span",null,"Descuento:",-1)),t("span",zt,"-"+a(n(l.value.descuento)),1)])):x("",!0),t("div",Dt,[e[20]||(e[20]=t("span",null,"TOTAL:",-1)),t("span",null,a(n(l.value.total)),1)])]),t("div",St,[t("button",{onClick:e[2]||(e[2]=s=>z(l.value)),class:"flex-1 btn btn-primary py-3"},[...e[21]||(e[21]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),w(" Reimprimir Recibo ",-1)])]),l.value.estado==="COMPLETADA"?(i(),d("button",{key:0,onClick:e[3]||(e[3]=s=>D(l.value)),class:"flex-1 btn btn-danger py-3"},[...e[22]||(e[22]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1),w(" Anular Venta ",-1)])])):(i(),d("div",At," Venta "+a(l.value.estado),1))])])])])):x("",!0)]))}};export{Rt as default};
