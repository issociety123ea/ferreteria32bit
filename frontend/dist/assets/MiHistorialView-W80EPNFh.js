import{u as P,h as p,m as B,o as l,c as i,a as t,e as N,v as F,g as k,t as a,f as m,F as C,q as D,w as H,k as $,z as M,s as I}from"./index-ny2CxOhD.js";const O={class:"space-y-6"},q={class:"flex items-center justify-between"},G={class:"flex items-center space-x-3"},U={key:0,class:"grid grid-cols-1 md:grid-cols-4 gap-4"},Q={class:"card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"},Y={class:"text-3xl font-bold"},Z={class:"card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"},K={class:"text-3xl font-bold"},W={class:"card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"},J={class:"text-2xl font-bold"},X={class:"card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"},tt={class:"text-2xl font-bold"},et={class:"card p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white"},st={class:"text-2xl font-bold"},ot={class:"card p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white"},at={class:"text-2xl font-bold"},nt={class:"text-xs opacity-75 mt-1"},lt={key:1,class:"flex items-center justify-center py-12"},it={key:2,class:"card"},dt={class:"overflow-x-auto"},rt={class:"table"},ct={class:"font-mono font-semibold text-primary-700"},pt={key:0,class:"mt-1 text-xs leading-tight"},ut={class:"text-slate-500"},mt={class:"text-amber-600 font-semibold"},vt={key:1,class:"text-emerald-600 font-medium"},bt={class:"font-bold text-emerald-700"},xt=["onClick"],gt={key:3,class:"card p-12 text-center"},ft={class:"bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"},ht={class:"sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl"},_t={class:"flex items-center justify-between"},yt={class:"text-2xl font-bold"},wt={class:"text-primary-100 text-sm mt-1"},kt={class:"p-6"},Ct={class:"bg-slate-50 rounded-lg p-4 mb-6"},$t={class:"grid grid-cols-2 gap-4"},Et={class:"font-semibold"},Tt={class:"font-semibold"},Dt={class:"mb-6"},Mt={class:"space-y-3"},Vt={class:"flex items-start justify-between"},zt={class:"flex-1"},St={class:"font-semibold text-slate-800"},At={class:"text-sm text-slate-600"},jt={class:"text-right"},Rt={class:"font-bold text-primary-700"},Lt={class:"flex items-center justify-between mt-2 text-sm"},Pt={class:"text-slate-600"},Bt={key:0,class:"text-orange-600"},Nt={class:"border-t-2 border-slate-200 pt-4 space-y-2"},Ft={class:"flex justify-between text-slate-700"},Ht={class:"font-semibold"},It={key:0,class:"flex justify-between text-orange-600"},Ot={class:"font-semibold"},qt={class:"flex justify-between text-2xl font-bold text-emerald-700"},Gt={class:"mt-6 flex gap-3"},Ut={key:1,class:"flex-1 btn btn-secondary py-3 opacity-50 cursor-not-allowed"},Kt={__name:"MiHistorialView",setup(Qt){const V=P(),{success:z,error:f}=M(),h=p(!1),_=p([]),r=p(null),y=p((()=>{const o=new Date,e=o.getFullYear(),s=String(o.getMonth()+1).padStart(2,"0"),c=String(o.getDate()).padStart(2,"0");return`${e}-${s}-${c}`})()),u=p(!1),d=p(null),w=p([]),n=o=>`Bs. ${parseFloat(o||0).toFixed(2)}`,S=o=>new Date(o).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit",timeZone:"America/La_Paz"}),E=o=>new Date(o).toLocaleString("es-BO",{dateStyle:"long",timeStyle:"short",timeZone:"America/La_Paz"}),A=o=>({EFECTIVO:"badge-success",CREDITO:"badge-warning",QR:"badge-primary"})[o]||"badge-secondary",v=async()=>{h.value=!0;try{const o=await $.getMiHistorial({fecha:y.value});_.value=o.data.data.ventas,r.value=o.data.data.resumen}catch(o){console.error("Error loading historial:",o),f("Error al cargar el historial")}finally{h.value=!1}},j=async o=>{try{const e=await $.getById(o.id);d.value=e.data.data,w.value=e.data.data.detalles||[],u.value=!0}catch(e){console.error("Error loading detalle:",e),f("Error al cargar el detalle de la venta")}},R=o=>{var T;const e=window.open("","_blank","width=300,height=600"),s=o.cliente_nombre||"Público General",c=o.cliente_nit||"S/N",b=((T=V.user)==null?void 0:T.nombre)||"Vendedor",x=`
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
        <div class="info-row"><span>Fecha:</span><span>${E(o.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${s}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${c}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${b}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${w.value.map(g=>`
          <div class="item">
            <div class="item-name">${g.nombre_producto}</div>
            <div class="item-details">
              <span>${g.cantidad} x ${n(g.precio_unitario)}</span>
              <strong>${n(g.total)}</strong>
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
  `;e.document.write(x),e.document.close()},L=async o=>{var c,b;if(!await M().confirm(`¿Estás seguro de que deseas ANULAR la venta ${o.numero_venta}?

Esta acción:
- Devolvería el stock de los productos
- Anularía cualquier crédito asociado
- Se registraría en auditoría`))return;const s=prompt("Motivo de la anulación:","Error en venta");if(s)try{await $.anular(o.id,{razon:s}),z(`Venta ${o.numero_venta} anulada exitosamente`),u.value=!1,await v()}catch(x){console.error("Error al anular venta:",x),f(((b=(c=x.response)==null?void 0:c.data)==null?void 0:b.message)||"Error al anular la venta")}};return B(()=>{v()}),(o,e)=>(l(),i("div",O,[t("div",q,[e[6]||(e[6]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-800"},"Mi Historial de Ventas"),t("p",{class:"text-slate-600 mt-1"},"Revisa tus ventas del día")],-1)),t("div",G,[N(t("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>y.value=s),type:"date",class:"input",onChange:v},null,544),[[F,y.value]]),t("button",{onClick:v,class:"btn btn-primary"},[...e[5]||(e[5]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})],-1),k(" Actualizar ",-1)])])])]),r.value?(l(),i("div",U,[t("div",Q,[e[7]||(e[7]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Ventas",-1)),t("div",Y,a(r.value.cantidad_ventas||0),1)]),t("div",Z,[e[8]||(e[8]=t("div",{class:"text-sm opacity-90 mb-1"},"Total Cobrado",-1)),t("div",K,a(n(r.value.total_cobrado||0)),1),e[9]||(e[9]=t("div",{class:"text-xs opacity-75 mt-1"},"Efectivo + QR + Abonos de fiados",-1))]),t("div",W,[e[10]||(e[10]=t("div",{class:"text-sm opacity-90 mb-1"},"Efectivo",-1)),t("div",J,a(n(r.value.total_efectivo||0)),1)]),t("div",X,[e[11]||(e[11]=t("div",{class:"text-sm opacity-90 mb-1"},"QR / Transferencia",-1)),t("div",tt,a(n(r.value.total_qr||0)),1)]),t("div",et,[e[12]||(e[12]=t("div",{class:"text-sm opacity-90 mb-1"},"Fiado / Crédito",-1)),t("div",st,a(n(r.value.total_credito||0)),1),e[13]||(e[13]=t("div",{class:"text-xs opacity-75 mt-1"},"Saldo por cobrar",-1))]),t("div",ot,[e[14]||(e[14]=t("div",{class:"text-sm opacity-90 mb-1"},"Abonos de Fiados",-1)),t("div",at,a(n(r.value.total_abonos||0)),1),t("div",nt,a(r.value.cantidad_abonos||0)+" pagos recibidos",1)])])):m("",!0),h.value?(l(),i("div",lt,[...e[15]||(e[15]=[t("div",{class:"spinner"},null,-1)])])):_.value.length>0?(l(),i("div",it,[t("div",dt,[t("table",rt,[e[16]||(e[16]=t("thead",null,[t("tr",null,[t("th",null,"Nº Venta"),t("th",null,"Hora"),t("th",null,"Cliente"),t("th",null,"Método Pago"),t("th",null,"Subtotal"),t("th",null,"Descuento"),t("th",null,"Total"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(l(!0),i(C,null,D(_.value,s=>(l(),i("tr",{key:s.id},[t("td",ct,a(s.numero_venta),1),t("td",null,a(S(s.fecha)),1),t("td",null,a(s.cliente_nombre||"Público General"),1),t("td",null,[t("span",{class:I(["badge",A(s.metodo_pago)])},a(s.metodo_pago),3),s.metodo_pago==="CREDITO"&&s.credito_id?(l(),i("div",pt,[(s.credito_saldo_pendiente||0)>0?(l(),i(C,{key:0},[t("div",ut,"Abonó: "+a(n((s.credito_monto_total||0)-s.credito_saldo_pendiente)),1),t("div",mt,"Falta: "+a(n(s.credito_saldo_pendiente)),1)],64)):(l(),i("span",vt,"Pagado completo"))])):m("",!0)]),t("td",null,a(n(s.subtotal)),1),t("td",null,a(s.descuento>0?n(s.descuento):"-"),1),t("td",bt,a(n(s.total)),1),t("td",null,[t("button",{onClick:c=>j(s),class:"btn btn-sm btn-secondary"}," Ver Detalle ",8,xt)])]))),128))])])])])):(l(),i("div",gt,[...e[17]||(e[17]=[t("svg",{class:"w-20 h-20 mx-auto mb-4 text-slate-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})],-1),t("h3",{class:"text-xl font-semibold text-slate-700 mb-2"},"No hay ventas",-1),t("p",{class:"text-slate-500"},"No se registraron ventas en esta fecha",-1)])])),u.value&&d.value?(l(),i("div",{key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",onClick:e[4]||(e[4]=H(s=>u.value=!1,["self"]))},[t("div",ft,[t("div",ht,[t("div",_t,[t("div",null,[t("h2",yt,a(d.value.numero_venta),1),t("p",wt,a(E(d.value.fecha)),1)]),t("button",{onClick:e[1]||(e[1]=s=>u.value=!1),class:"text-white hover:bg-primary-600 p-2 rounded-lg"},[...e[18]||(e[18]=[t("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)])])])]),t("div",kt,[t("div",Ct,[t("div",$t,[t("div",null,[e[19]||(e[19]=t("div",{class:"text-sm text-slate-600"},"Cliente",-1)),t("div",Et,a(d.value.cliente_nombre||"Público General"),1)]),t("div",null,[e[20]||(e[20]=t("div",{class:"text-sm text-slate-600"},"Método de Pago",-1)),t("div",Tt,a(d.value.metodo_pago),1)])])]),t("div",Dt,[e[21]||(e[21]=t("h3",{class:"font-semibold text-lg text-slate-800 mb-3"},"Productos",-1)),t("div",Mt,[(l(!0),i(C,null,D(w.value,s=>(l(),i("div",{key:s.id,class:"bg-slate-50 rounded-lg p-4"},[t("div",Vt,[t("div",zt,[t("h4",St,a(s.nombre_producto),1),t("p",At,"SKU: "+a(s.codigo_producto),1)]),t("div",jt,[t("div",Rt,a(n(s.total)),1)])]),t("div",Lt,[t("span",Pt,a(s.cantidad)+" x "+a(n(s.precio_unitario)),1),s.descuento>0?(l(),i("span",Bt,"Desc: "+a(n(s.descuento)),1)):m("",!0)])]))),128))])]),t("div",Nt,[t("div",Ft,[e[22]||(e[22]=t("span",null,"Subtotal:",-1)),t("span",Ht,a(n(d.value.subtotal)),1)]),d.value.descuento>0?(l(),i("div",It,[e[23]||(e[23]=t("span",null,"Descuento:",-1)),t("span",Ot,"-"+a(n(d.value.descuento)),1)])):m("",!0),t("div",qt,[e[24]||(e[24]=t("span",null,"TOTAL:",-1)),t("span",null,a(n(d.value.total)),1)])]),t("div",Gt,[t("button",{onClick:e[2]||(e[2]=s=>R(d.value)),class:"flex-1 btn btn-primary py-3"},[...e[25]||(e[25]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),k(" Reimprimir Recibo ",-1)])]),d.value.estado==="COMPLETADA"?(l(),i("button",{key:0,onClick:e[3]||(e[3]=s=>L(d.value)),class:"flex-1 btn btn-danger py-3"},[...e[26]||(e[26]=[t("svg",{class:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1),k(" Anular Venta ",-1)])])):(l(),i("div",Ut," Venta "+a(d.value.estado),1))])])])])):m("",!0)]))}};export{Kt as default};
