import{t as e}from"./url.Bwo27btg.js";var t=e=>new Intl.NumberFormat(`es-CO`,{style:`currency`,currency:`COP`,maximumFractionDigits:0}).format(e),n=e=>new Intl.DateTimeFormat(`es-CO`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e)),r=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),i=e=>{let t=document.querySelector(`[data-toast]`);t||(t=document.createElement(`div`),t.className=`toast`,t.setAttribute(`data-toast`,``),document.body.appendChild(t)),t.textContent=e,requestAnimationFrame(()=>t?.classList.add(`is-visible`)),window.setTimeout(()=>t?.classList.remove(`is-visible`),3200)},a=document.querySelector(`[data-admin-login]`),o=document.querySelector(`[data-admin-login-result]`);a?.addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(a).get(`password`)?.toString()??``;try{let t=await fetch(e(`/api/admin/login`),{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({password:n})}),r=await t.json();if(!t.ok)throw Error(r.error??`No se pudo entrar`);window.location.reload()}catch(e){o&&(o.innerHTML=`<p class="notice notice--error">${r(e.message)}</p>`)}}),document.querySelector(`[data-admin-logout]`)?.addEventListener(`click`,async()=>{await fetch(e(`/api/admin/logout`),{method:`POST`}),window.location.reload()});var s=document.querySelector(`[data-admin-stats]`),c=document.querySelector(`[data-admin-panel]`),l=[`pendiente`,`pagado`,`enviado`,`entregado`,`cancelado`];async function u(){let n=await fetch(e(`/api/admin/data`));if(!n.ok)return;let r=await n.json();s&&(s.innerHTML=`
      <div class="summary-card">
        <p class="filter-group__title">Pedidos</p>
        <p class="display-3">${r.pedidos}</p>
      </div>
      <div class="summary-card">
        <p class="filter-group__title">Ingresos</p>
        <p class="display-3">${t(r.ingresos)}</p>
      </div>
      <div class="summary-card">
        <p class="filter-group__title">Suscriptores</p>
        <p class="display-3">${r.suscriptores}</p>
      </div>
      <div class="summary-card">
        <p class="filter-group__title">Unidades en stock</p>
        <p class="display-3">${r.stockTotal}</p>
      </div>`)}function d(e){c&&(c.innerHTML=e.length===0?`<div class="summary-card"><p style="color:var(--muted)">Todavía no hay pedidos.</p></div>`:`
      <div class="summary-card" style="overflow-x:auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Contacto</th>
              <th>Items</th><th>Total</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${e.map(e=>`
              <tr>
                <td><strong>${r(e.id)}</strong><br><span style="color:var(--muted);font-size:.78rem">${r(e.metodoPago)}</span></td>
                <td>${r(n(e.createdAt))}</td>
                <td>${r(e.customer.nombre)}<br><span style="color:var(--muted);font-size:.78rem">${r(e.customer.ciudad)}</span></td>
                <td>${r(e.customer.email)}<br><span style="color:var(--muted);font-size:.78rem">${r(e.customer.telefono)}</span></td>
                <td>${e.items.map(e=>`${e.qty} x ${r(e.name)}`).join(`<br>`)}</td>
                <td><strong>${t(e.total)}</strong></td>
                <td><span class="badge badge--${r(e.status)}">${r(e.status)}</span></td>
                <td>
                  <select class="select" data-order-status="${r(e.id)}" style="min-width:130px;padding:.5rem .6rem">
                    ${l.map(t=>`<option value="${t}" ${t===e.status?`selected`:``}>${t}</option>`).join(``)}
                  </select>
                </td>
              </tr>`).join(``)}
          </tbody>
        </table>
      </div>`)}function f(e){c&&(c.innerHTML=`
      <div class="summary-card" style="overflow-x:auto">
        <table class="admin-table">
          <thead>
            <tr><th>Producto</th><th>Categoria</th><th>Precio</th><th>Stock</th><th>Publicado</th><th></th></tr>
          </thead>
          <tbody>
            ${e.map(e=>`
              <tr>
                <td>
                  <strong>${r(e.name)}</strong><br>
                  <span style="color:var(--muted);font-size:.78rem">${r(e.size)} · ${r(e.slug)}</span>
                </td>
                <td>${r(e.category)}</td>
                <td>
                  <input class="input" type="number" min="0" value="${e.price}" data-product-price="${r(e.slug)}" style="width:120px;padding:.45rem .6rem" />
                </td>
                <td>
                  <input class="input" type="number" min="0" value="${e.stock}" data-product-stock="${r(e.slug)}" style="width:90px;padding:.45rem .6rem" />
                </td>
                <td>
                  <input type="checkbox" data-product-published="${r(e.slug)}" ${e.published?`checked`:``} />
                </td>
                <td><button class="btn btn--sm" type="button" data-save-product="${r(e.slug)}">Guardar</button></td>
              </tr>`).join(``)}
          </tbody>
        </table>
      </div>`)}function p(e){c&&(c.innerHTML=`
      <div class="summary-card" style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>Correo</th><th>Fecha</th><th>Origen</th></tr></thead>
          <tbody>
            ${e.map(e=>`<tr>
                    <td>${r(e.email)}</td>
                    <td>${r(n(e.createdAt))}</td>
                    <td>${r(e.origen)}</td>
                  </tr>`).join(``)||`<tr><td colspan="3" style="color:var(--muted)">Sin suscriptores todavía.</td></tr>`}
          </tbody>
        </table>
      </div>`)}function m(e){c&&(c.innerHTML=`
      <div class="stack stack-2">
        ${e.map(e=>`
          <div class="summary-card">
            <div class="section-head" style="margin-bottom:.75rem">
              <div>
                <p class="filter-group__title">${r(e.asunto)} · ${r(n(e.createdAt))}</p>
                <p style="font-weight:500">${r(e.nombre)} — ${r(e.email)}${e.telefono?` · `+r(e.telefono):``}</p>
              </div>
            </div>
            <p style="color:var(--text-2);font-size:.93rem;white-space:pre-wrap">${r(e.mensaje)}</p>
          </div>`).join(``)||`<div class="summary-card"><p style="color:var(--muted)">Sin mensajes todavía.</p></div>`}
      </div>`)}async function h(t){if(!c)return;c.innerHTML=`<div class="summary-card text-center"><p style="color:var(--muted)">Cargando...</p></div>`;let n=await fetch(`${e(`/api/admin/data`)}?recurso=${t}`);if(!n.ok){c.innerHTML=`<div class="summary-card"><p class="notice notice--error">No se pudo cargar la información.</p></div>`;return}let r=await n.json();t===`pedidos`?d(r):t===`productos`?f(r):t===`suscriptores`?p(r):m(r)}document.querySelectorAll(`[data-admin-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-admin-tab`);t&&h(t)})}),document.addEventListener(`change`,async t=>{let n=t.target,r=n.closest(`[data-order-status]`);if(r){let t=await fetch(e(`/api/admin/data`),{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({accion:`estado-pedido`,id:r.dataset.orderStatus,status:r.value})});t.ok||(i((await t.json().catch(()=>({}))).error??`No se pudo actualizar el estado.`),await h(`pedidos`));return}let a=n.closest(`[data-product-published]`);if(a){let t=await fetch(e(`/api/admin/data`),{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({accion:`actualizar-producto`,slug:a.dataset.productPublished,published:a.checked})});t.ok||(i((await t.json().catch(()=>({}))).error??`No se pudo actualizar el producto.`),await h(`productos`))}}),document.addEventListener(`click`,async t=>{let n=t.target.closest(`[data-save-product]`);if(!n)return;let r=n.dataset.saveProduct,a=document.querySelector(`[data-product-price="${r}"]`)?.value,o=document.querySelector(`[data-product-stock="${r}"]`)?.value;n.setAttribute(`disabled`,`true`);let s=await fetch(e(`/api/admin/data`),{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({accion:`actualizar-producto`,slug:r,price:Number(a),stock:Number(o)})});if(n.removeAttribute(`disabled`),!s.ok){let e=await s.json().catch(()=>({}));n.textContent=`Error`,i(e.error??`No se pudo guardar el producto.`),await h(`productos`),setTimeout(()=>n.textContent=`Guardar`,1800)}else n.textContent=`Guardado`,setTimeout(()=>n.textContent=`Guardar`,1800)}),s&&(u(),h(`pedidos`));