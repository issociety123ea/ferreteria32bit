import{u as D,h as c,m as B,o as l,c as i,a as t,e as N,v as R,g as y,t as a,f as m,F as k,q as C,w as H,k as T,s as P}from"./index-CmHCcPn3.js";const A={class:"space-y-6"},F={class:"flex items-center justify-between"},I={class:"flex items-center space-x-3"},L={key:0,class:"grid grid-cols-1 md:grid-cols-4 gap-4"},O={class:"card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"},G={class:"text-3xl font-bold"},U={class:"card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"},q={class:"text-3xl font-bold"},Q={class:"card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"},J={class:"text-2xl font-bold"},K={class:"card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"},W={class:"text-2xl font-bold"},Y={key:1,class:"flex items-center justify-center py-12"},X={key:2,class:"card"},Z={class:"overflow-x-auto"},tt={class:"table"},et={class:"font-mono font-semibold text-primary-700"},st={class:"font-bold text-emerald-700"},ot=["onClick"],at={key:3,class:"card p-12 text-center"},nt={class:"bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"},lt={class:"sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl"},it={class:"flex items-center justify-between"},dt={class:"text-2xl font-bold"},rt={class:"text-primary-100 text-sm mt-1"},ct={class:"p-6"},pt={class:"bg-slate-50 rounded-lg p-4 mb-6"},ut={class:"grid grid-cols-2 gap-4"},mt={class:"font-semibold"},vt={class:"font-semibold"},bt={class:"mb-6"},xt={class:"space-y-3"},gt={class:"flex items-start justify-between"},ft={class:"flex-1"},ht={class:"font-semibold text-slate-800"},_t={class:"text-sm text-slate-600"},wt={class:"text-right"},yt={class:"font-bold text-primary-700"},kt={class:"flex items-center justify-between mt-2 text-sm"},Ct={class:"text-slate-600"},Tt={key:0,class:"text-orange-600"},$t={class:"border-t-2 border-slate-200 pt-4 space-y-2"},jt={class:"flex justify-between text-slate-700"},Vt={class:"font-semibold"},zt={key:0,class:"flex justify-between text-orange-600"},Mt={class:"font-semibold"},Et={class:"flex justify-between text-2xl font-bold text-emerald-700"},St={class:"mt-6"},Nt={__name:"MiHistorialView",setup(Dt){const $=D(),v=c(!1),b=c([]),r=c(null),x=c(new Date().toISOString().slice(0,10)),p=c(!1),d=c(null),g=c([]),n=o=>`Bs. ${parseFloat(o||0).toFixed(2)}`,j=o=>new Date(o).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),h=o=>new Date(o).toLocaleString("es-BO",{dateStyle:"long",timeStyle:"short"}),V=o=>({EFECTIVO:"badge-success",TARJETA:"badge-primary",QR:"badge-warning"})[o]||"badge-secondary",f=async()=>{v.value=!0;try{const o=await T.getMiHistorial({fecha:x.value});b.value=o.data.data.ventas,r.value=o.data.data.resumen}catch(o){console.error("Error loading historial:",o),alert("Error al cargar el historial")}finally{v.value=!1}},z=async o=>{try{const e=await T.getById(o.id);d.value=e.data.data,g.value=e.data.data.detalles||[],p.value=!0}catch(e){console.error("Error loading detalle:",e),alert("Error al cargar el detalle de la venta")}},M=o=>{var w;const e=window.open("","_blank","width=300,height=600"),s=o.cliente_nombre||"Público General",_=o.cliente_nit||"S/N",E=((w=$.user)==null?void 0:w.nombre)||"Vendedor",S=`
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
        <div class="info-row"><span>Fecha:</span><span>${h(o.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${s}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${_}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${E}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${g.value.map(u=>`
          <div class="item">
            <div class="item-name">${u.nombre_producto}</div>
            <div class="item-details">
              <span>${u.cantidad} x ${n(u.precio_unitario)}</span>
              <strong>${n(u.total)}</strong>
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
  `;e.document.write(S),e.document.close()};return B(()=>{f()}),(o,e)=>(l(),i("div",A,[t("div",F,[e[5]||(e[5]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-800"},"Mi Historial de Ventas"),t("p",{class:"text-slate-600 mt-1"},"Revisa tus ventas del día")],-1)),t("div",I,[N(t("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>x.value=s),type:"date",class:"input",onChange:f},null,544),[[R,x.value]]),t("button",{onClick:f,class:"btn btn-primary"},[...e[4]||(e[4]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})],-1),y(" Actualizar ",-1)])])])]),r.value?(l(),i("div",L,[t("div",O,[e[6]||(e[6]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Ventas",-1)),t("div",G,a(r.value.cantidad_ventas||0),1)]),t("div",U,[e[7]||(e[7]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Cobrado",-1)),t("div",q,a(n(r.value.total_vendido||0)),1)]),t("div",Q,[e[8]||(e[8]=t("div",{class:"text-sm opacity-90 mb-1"},"Efectivo",-1)),t("div",J,a(n(r.value.total_efectivo||0)),1)]),t("div",K,[e[9]||(e[9]=t("div",{class:"text-sm opacity-90 mb-1"},"Tarjeta + QR",-1)),t("div",W,a(n((r.value.total_tarjeta||0)+(r.value.total_qr||0))),1)])])):m("",!0),v.value?(l(),i("div",Y,[...e[10]||(e[10]=[t("div",{class:"spinner"},null,-1)])])):b.value.length>0?(l(),i("div",X,[t("div",Z,[t("table",tt,[e[11]||(e[11]=t("thead",null,[t("tr",null,[t("th",null,"Nº Venta"),t("th",null,"Hora"),t("th",null,"Cliente"),t("th",null,"Método Pago"),t("th",null,"Subtotal"),t("th",null,"Descuento"),t("th",null,"Total"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(l(!0),i(k,null,C(b.value,s=>(l(),i("tr",{key:s.id},[t("td",et,a(s.numero_venta),1),t("td",null,a(j(s.fecha)),1),t("td",null,a(s.cliente_nombre||"Público General"),1),t("td",null,[t("span",{class:P(["badge",V(s.metodo_pago)])},a(s.metodo_pago),3)]),t("td",null,a(n(s.subtotal)),1),t("td",null,a(s.descuento>0?n(s.descuento):"-"),1),t("td",st,a(n(s.total)),1),t("td",null,[t("button",{onClick:_=>z(s),class:"btn btn-sm btn-secondary"}," Ver Detalle ",8,ot)])]))),128))])])])])):(l(),i("div",at,[...e[12]||(e[12]=[t("svg",{class:"w-20 h-20 mx-auto mb-4 text-slate-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})],-1),t("h3",{class:"text-xl font-semibold text-slate-700 mb-2"},"No hay ventas",-1),t("p",{class:"text-slate-500"},"No se registraron ventas en esta fecha",-1)])])),p.value&&d.value?(l(),i("div",{key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",onClick:e[3]||(e[3]=H(s=>p.value=!1,["self"]))},[t("div",nt,[t("div",lt,[t("div",it,[t("div",null,[t("h2",dt,a(d.value.numero_venta),1),t("p",rt,a(h(d.value.fecha)),1)]),t("button",{onClick:e[1]||(e[1]=s=>p.value=!1),class:"text-white hover:bg-primary-600 p-2 rounded-lg"},[...e[13]||(e[13]=[t("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)])])])]),t("div",ct,[t("div",pt,[t("div",ut,[t("div",null,[e[14]||(e[14]=t("div",{class:"text-sm text-slate-600"},"Cliente",-1)),t("div",mt,a(d.value.cliente_nombre||"Público General"),1)]),t("div",null,[e[15]||(e[15]=t("div",{class:"text-sm text-slate-600"},"Método de Pago",-1)),t("div",vt,a(d.value.metodo_pago),1)])])]),t("div",bt,[e[16]||(e[16]=t("h3",{class:"font-semibold text-lg text-slate-800 mb-3"},"Productos",-1)),t("div",xt,[(l(!0),i(k,null,C(g.value,s=>(l(),i("div",{key:s.id,class:"bg-slate-50 rounded-lg p-4"},[t("div",gt,[t("div",ft,[t("h4",ht,a(s.nombre_producto),1),t("p",_t,"SKU: "+a(s.codigo_producto),1)]),t("div",wt,[t("div",yt,a(n(s.total)),1)])]),t("div",kt,[t("span",Ct,a(s.cantidad)+" x "+a(n(s.precio_unitario)),1),s.descuento>0?(l(),i("span",Tt,"Desc: "+a(n(s.descuento)),1)):m("",!0)])]))),128))])]),t("div",$t,[t("div",jt,[e[17]||(e[17]=t("span",null,"Subtotal:",-1)),t("span",Vt,a(n(d.value.subtotal)),1)]),d.value.descuento>0?(l(),i("div",zt,[e[18]||(e[18]=t("span",null,"Descuento:",-1)),t("span",Mt,"-"+a(n(d.value.descuento)),1)])):m("",!0),t("div",Et,[e[19]||(e[19]=t("span",null,"TOTAL:",-1)),t("span",null,a(n(d.value.total)),1)])]),t("div",St,[t("button",{onClick:e[2]||(e[2]=s=>M(d.value)),class:"w-full btn btn-primary py-3"},[...e[20]||(e[20]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),y(" Reimprimir Recibo ",-1)])])])])])])):m("",!0)]))}};export{Nt as default};
