import{u as N,h as p,m as B,o as i,c as d,a as t,e as P,v as H,g as k,t as a,f as g,F as T,q as M,w as F,k as C,z as V,s as I}from"./index-B4iq-kKE.js";const O={class:"space-y-6"},q={class:"flex items-center justify-between"},G={class:"flex items-center space-x-3"},U={key:0,class:"grid grid-cols-1 md:grid-cols-4 gap-4"},Q={class:"card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"},Y={class:"text-3xl font-bold"},Z={class:"card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"},K={class:"text-3xl font-bold"},W={class:"card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"},J={class:"text-2xl font-bold"},X={class:"card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"},tt={class:"text-2xl font-bold"},et={class:"card p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white"},st={class:"text-2xl font-bold"},ot={class:"card p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white"},at={class:"text-2xl font-bold"},nt={class:"text-xs opacity-75 mt-1"},lt={key:1,class:"flex items-center justify-center py-12"},it={key:2,class:"card"},dt={class:"overflow-x-auto"},rt={class:"table"},ct={class:"font-mono font-semibold text-primary-700"},pt={class:"font-bold text-emerald-700"},ut=["onClick"],mt={key:3,class:"card p-12 text-center"},vt={class:"bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"},bt={class:"sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl"},xt={class:"flex items-center justify-between"},gt={class:"text-2xl font-bold"},ft={class:"text-primary-100 text-sm mt-1"},ht={class:"p-6"},_t={class:"bg-slate-50 rounded-lg p-4 mb-6"},yt={class:"grid grid-cols-2 gap-4"},wt={class:"font-semibold"},kt={class:"font-semibold"},Ct={class:"mb-6"},$t={class:"space-y-3"},Et={class:"flex items-start justify-between"},Tt={class:"flex-1"},Mt={class:"font-semibold text-slate-800"},Vt={class:"text-sm text-slate-600"},zt={class:"text-right"},Dt={class:"font-bold text-primary-700"},St={class:"flex items-center justify-between mt-2 text-sm"},jt={class:"text-slate-600"},At={key:0,class:"text-orange-600"},Rt={class:"border-t-2 border-slate-200 pt-4 space-y-2"},Lt={class:"flex justify-between text-slate-700"},Nt={class:"font-semibold"},Bt={key:0,class:"flex justify-between text-orange-600"},Pt={class:"font-semibold"},Ht={class:"flex justify-between text-2xl font-bold text-emerald-700"},Ft={class:"mt-6 flex gap-3"},It={key:1,class:"flex-1 btn btn-secondary py-3 opacity-50 cursor-not-allowed"},Ut={__name:"MiHistorialView",setup(Ot){const z=N(),{success:D,error:f}=V(),h=p(!1),_=p([]),r=p(null),y=p((()=>{const s=new Date,e=s.getFullYear(),o=String(s.getMonth()+1).padStart(2,"0"),c=String(s.getDate()).padStart(2,"0");return`${e}-${o}-${c}`})()),u=p(!1),l=p(null),w=p([]),n=s=>`Bs. ${parseFloat(s||0).toFixed(2)}`,S=s=>new Date(s).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit",timeZone:"America/La_Paz"}),$=s=>new Date(s).toLocaleString("es-BO",{dateStyle:"long",timeStyle:"short",timeZone:"America/La_Paz"}),j=s=>({EFECTIVO:"badge-success",CREDITO:"badge-warning",QR:"badge-primary"})[s]||"badge-secondary",m=async()=>{h.value=!0;try{const s=await C.getMiHistorial({fecha:y.value});_.value=s.data.data.ventas,r.value=s.data.data.resumen}catch(s){console.error("Error loading historial:",s),f("Error al cargar el historial")}finally{h.value=!1}},A=async s=>{try{const e=await C.getById(s.id);l.value=e.data.data,w.value=e.data.data.detalles||[],u.value=!0}catch(e){console.error("Error loading detalle:",e),f("Error al cargar el detalle de la venta")}},R=s=>{var E;const e=window.open("","_blank","width=300,height=600"),o=s.cliente_nombre||"Público General",c=s.cliente_nit||"S/N",v=((E=z.user)==null?void 0:E.nombre)||"Vendedor",b=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${s.numero_venta}</title>
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
        <div class="info-row"><span>Nº Venta:</span><strong>${s.numero_venta}</strong></div>
        <div class="info-row"><span>Fecha:</span><span>${$(s.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${o}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${c}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${v}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${w.value.map(x=>`
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
        <div class="total-row"><span>Subtotal:</span><span>${n(s.subtotal)}</span></div>
        ${s.descuento>0?`<div class="total-row"><span>Descuento:</span><span>-${n(s.descuento)}</span></div>`:""}
        <div class="total-row main"><span>TOTAL:</span><span>${n(s.total)}</span></div>
      </div>

      <div class="payment">
        <div class="info-row"><span>Método de pago:</span><strong>${s.metodo_pago}</strong></div>
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
  `;e.document.write(b),e.document.close()},L=async s=>{var c,v;if(!await V().confirm(`¿Estás seguro de que deseas ANULAR la venta ${s.numero_venta}?

Esta acción:
- Devolvería el stock de los productos
- Anularía cualquier crédito asociado
- Se registraría en auditoría`))return;const o=prompt("Motivo de la anulación:","Error en venta");if(o)try{await C.anular(s.id,{razon:o}),D(`Venta ${s.numero_venta} anulada exitosamente`),u.value=!1,await m()}catch(b){console.error("Error al anular venta:",b),f(((v=(c=b.response)==null?void 0:c.data)==null?void 0:v.message)||"Error al anular la venta")}};return B(()=>{m()}),(s,e)=>(i(),d("div",O,[t("div",q,[e[6]||(e[6]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-800"},"Mi Historial de Ventas (v2.0)"),t("p",{class:"text-slate-600 mt-1"},"Revisa tus ventas del día")],-1)),t("div",G,[P(t("input",{"onUpdate:modelValue":e[0]||(e[0]=o=>y.value=o),type:"date",class:"input",onChange:m},null,544),[[H,y.value]]),t("button",{onClick:m,class:"btn btn-primary"},[...e[5]||(e[5]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})],-1),k(" Actualizar ",-1)])])])]),r.value?(i(),d("div",U,[t("div",Q,[e[7]||(e[7]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Ventas",-1)),t("div",Y,a(r.value.cantidad_ventas||0),1)]),t("div",Z,[e[8]||(e[8]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Cobrado",-1)),t("div",K,a(n(r.value.total_cobrado||0)),1),e[9]||(e[9]=t("div",{class:"text-xs opacity-75 mt-1"},"Efectivo + QR + Abonos de fiados",-1))]),t("div",W,[e[10]||(e[10]=t("div",{class:"text-sm opacity-90 mb-1"},"Efectivo",-1)),t("div",J,a(n(r.value.total_efectivo||0)),1)]),t("div",X,[e[11]||(e[11]=t("div",{class:"text-sm opacity-90 mb-1"},"QR / Transferencia",-1)),t("div",tt,a(n(r.value.total_qr||0)),1)]),t("div",et,[e[12]||(e[12]=t("div",{class:"text-sm opacity-90 mb-1"},"Fiado / Crédito",-1)),t("div",st,a(n(r.value.total_credito||0)),1),e[13]||(e[13]=t("div",{class:"text-xs opacity-75 mt-1"},"No cobrado todavía",-1))]),t("div",ot,[e[14]||(e[14]=t("div",{class:"text-sm opacity-90 mb-1"},"Abonos de Fiados",-1)),t("div",at,a(n(r.value.total_abonos||0)),1),t("div",nt,a(r.value.cantidad_abonos||0)+" pagos recibidos",1)])])):g("",!0),h.value?(i(),d("div",lt,[...e[15]||(e[15]=[t("div",{class:"spinner"},null,-1)])])):_.value.length>0?(i(),d("div",it,[t("div",dt,[t("table",rt,[e[16]||(e[16]=t("thead",null,[t("tr",null,[t("th",null,"Nº Venta"),t("th",null,"Hora"),t("th",null,"Cliente"),t("th",null,"Método Pago"),t("th",null,"Subtotal"),t("th",null,"Descuento"),t("th",null,"Total"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),d(T,null,M(_.value,o=>(i(),d("tr",{key:o.id},[t("td",ct,a(o.numero_venta),1),t("td",null,a(S(o.fecha)),1),t("td",null,a(o.cliente_nombre||"Público General"),1),t("td",null,[t("span",{class:I(["badge",j(o.metodo_pago)])},a(o.metodo_pago),3)]),t("td",null,a(n(o.subtotal)),1),t("td",null,a(o.descuento>0?n(o.descuento):"-"),1),t("td",pt,a(n(o.total)),1),t("td",null,[t("button",{onClick:c=>A(o),class:"btn btn-sm btn-secondary"}," Ver Detalle ",8,ut)])]))),128))])])])])):(i(),d("div",mt,[...e[17]||(e[17]=[t("svg",{class:"w-20 h-20 mx-auto mb-4 text-slate-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})],-1),t("h3",{class:"text-xl font-semibold text-slate-700 mb-2"},"No hay ventas",-1),t("p",{class:"text-slate-500"},"No se registraron ventas en esta fecha",-1)])])),u.value&&l.value?(i(),d("div",{key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",onClick:e[4]||(e[4]=F(o=>u.value=!1,["self"]))},[t("div",vt,[t("div",bt,[t("div",xt,[t("div",null,[t("h2",gt,a(l.value.numero_venta),1),t("p",ft,a($(l.value.fecha)),1)]),t("button",{onClick:e[1]||(e[1]=o=>u.value=!1),class:"text-white hover:bg-primary-600 p-2 rounded-lg"},[...e[18]||(e[18]=[t("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)])])])]),t("div",ht,[t("div",_t,[t("div",yt,[t("div",null,[e[19]||(e[19]=t("div",{class:"text-sm text-slate-600"},"Cliente",-1)),t("div",wt,a(l.value.cliente_nombre||"Público General"),1)]),t("div",null,[e[20]||(e[20]=t("div",{class:"text-sm text-slate-600"},"Método de Pago",-1)),t("div",kt,a(l.value.metodo_pago),1)])])]),t("div",Ct,[e[21]||(e[21]=t("h3",{class:"font-semibold text-lg text-slate-800 mb-3"},"Productos",-1)),t("div",$t,[(i(!0),d(T,null,M(w.value,o=>(i(),d("div",{key:o.id,class:"bg-slate-50 rounded-lg p-4"},[t("div",Et,[t("div",Tt,[t("h4",Mt,a(o.nombre_producto),1),t("p",Vt,"SKU: "+a(o.codigo_producto),1)]),t("div",zt,[t("div",Dt,a(n(o.total)),1)])]),t("div",St,[t("span",jt,a(o.cantidad)+" x "+a(n(o.precio_unitario)),1),o.descuento>0?(i(),d("span",At,"Desc: "+a(n(o.descuento)),1)):g("",!0)])]))),128))])]),t("div",Rt,[t("div",Lt,[e[22]||(e[22]=t("span",null,"Subtotal:",-1)),t("span",Nt,a(n(l.value.subtotal)),1)]),l.value.descuento>0?(i(),d("div",Bt,[e[23]||(e[23]=t("span",null,"Descuento:",-1)),t("span",Pt,"-"+a(n(l.value.descuento)),1)])):g("",!0),t("div",Ht,[e[24]||(e[24]=t("span",null,"TOTAL:",-1)),t("span",null,a(n(l.value.total)),1)])]),t("div",Ft,[t("button",{onClick:e[2]||(e[2]=o=>R(l.value)),class:"flex-1 btn btn-primary py-3"},[...e[25]||(e[25]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),k(" Reimprimir Recibo ",-1)])]),l.value.estado==="COMPLETADA"?(i(),d("button",{key:0,onClick:e[3]||(e[3]=o=>L(l.value)),class:"flex-1 btn btn-danger py-3"},[...e[26]||(e[26]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1),k(" Anular Venta ",-1)])])):(i(),d("div",It," Venta "+a(l.value.estado),1))])])])])):g("",!0)]))}};export{Ut as default};
