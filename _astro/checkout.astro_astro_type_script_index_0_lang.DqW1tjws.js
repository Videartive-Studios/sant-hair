import{t as e}from"./escape.oPTvyap1.js";import{a as t,i as n,n as r,r as i,s as a,t as o}from"./cart.CPaQRiyY.js";import{t as s}from"./url.Bwo27btg.js";import{t as c}from"./preview.CXpyHGbQ.js";var l=document.querySelector(`[data-checkout-form]`),u=document.querySelector(`[data-checkout-summary]`),d=document.querySelector(`[data-checkout-result]`),f=document.querySelector(`#ck-codigo`),p=document.querySelector(`[data-promo-message]`),m=document.querySelector(`[data-apply-promo]`),h=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;function g(){if(!u)return;let t=n();if(t.length===0){u.innerHTML=`
        <h2 class="summary-card__title">Tu pedido</h2>
        <p style="color:var(--muted);font-size:.9rem">Tu carrito está vacío.</p>
        <a class="btn btn--light btn--block" href="${s(`/tienda`)}" style="margin-top:1rem">Ir a la tienda</a>`;return}let{subtotal:r,discount:a,promo:c,shipping:l,total:d,count:f}=o(t);u.innerHTML=`
      <h2 class="summary-card__title">Tu pedido (${f})</h2>
      <div class="stack stack-2" style="gap:.85rem;margin-bottom:1.25rem">
        ${t.map(t=>`
          <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem">
            <span style="color:var(--text-2)">${t.qty} x ${e(t.name)}</span>
            <span>${i(t.price*t.qty)}</span>
          </div>`).join(``)}
      </div>
      <div class="cart-summary"><span>Subtotal</span><span>${i(r)}</span></div>
      ${a>0?`<div class="cart-summary" style="color:var(--ok)"><span>Descuento ${e(c?.code??``)}</span><span>-${i(a)}</span></div>`:``}
      <div class="cart-summary"><span>Envío</span><span>${l===0?`Gratis`:i(l)}</span></div>
      <div class="cart-summary cart-summary--total"><span>Total</span><span>${i(d)}</span></div>
      <p style="font-size:.78rem;color:var(--muted);margin-top:1rem">
        Confirmas el pedido y te contactamos para coordinar la entrega y el pago.
      </p>`}if(g(),document.addEventListener(`santhair:cart:updated`,g),f){let e=t();e&&(f.value=e)}m?.addEventListener(`click`,()=>{let e=f?.value??``;e.trim()?(a(e)?p&&(p.textContent=`Código ${e.trim().toUpperCase()} aplicado.`,p.style.color=`var(--ok)`):p&&(p.textContent=`Ese código no es válido.`,p.style.color=`var(--error, #b4342c)`),g()):(r(),p&&(p.textContent=`El descuento se aplica sobre el subtotal antes del envío.`,p.style.color=`var(--muted)`),g())}),l?.addEventListener(`submit`,async t=>{t.preventDefault();let r=new FormData(l),i=Object.fromEntries(r.entries());if(n().length===0){d&&(d.innerHTML=`<p class="notice notice--error">Tu carrito está vacío. Agrega productos antes de continuar.</p>`);return}if([`nombre`,`email`,`telefono`,`ciudad`,`direccion`].filter(e=>!String(i[e]??``).trim()).length>0){d&&(d.innerHTML=`<p class="notice notice--error">Completa todos los campos obligatorios.</p>`);return}let a=String(i.email??``).trim();if(!h.test(a)){d&&(d.innerHTML=`<p class="notice notice--error">Escribe un correo electrónico válido.</p>`);return}let o=l.querySelector(`button[type="submit"]`);o&&o.setAttribute(`disabled`,`true`),d&&(d.innerHTML=`<p class="notice notice--error">${e(c)}</p>`),o&&o.removeAttribute(`disabled`)});