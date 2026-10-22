import{n as e,t}from"./escape.Cw0wT-mm.js";import{a as n,i as r,n as i,r as a,s as o,t as s}from"./cart.Dq-DqGmT.js";import{t as c}from"./url.CGWNQk6F.js";var l=document.querySelector(`[data-cart-page-items]`),u=document.querySelector(`[data-cart-page-summary]`);function d(){if(!l||!u)return;let f=r();if(f.length===0){l.innerHTML=`
        <div class="summary-card text-center" style="padding:3.5rem 1.5rem">
          <h2 class="summary-card__title">Tu carrito está vacío</h2>
          <p style="color:var(--muted)">
            Todavía no has agregado productos. Te esperamos en la tienda.
          </p>
          <a class="btn" href="${c(`/tienda`)}" style="margin-top:1.5rem">Explorar la tienda</a>
        </div>`,u.innerHTML=``;return}l.innerHTML=f.map(n=>`
        <div class="cart-line" data-slug="${t(n.slug)}" style="background:#fff;border:1px solid var(--line);padding:1.25rem;margin-bottom:.75rem">
          <a class="cart-line__img" href="${c(`/tienda/${encodeURIComponent(n.slug)}`)}">
            <img src="${e(n.image)}" alt="${t(n.name)}" width="80" height="80" loading="lazy" />
          </a>
          <div>
            <a class="cart-line__name" href="${c(`/tienda/${encodeURIComponent(n.slug)}`)}">${t(n.name)}</a>
            <div class="cart-line__meta">${t(n.size)} &middot; ${a(n.price)} c/u</div>
            <div class="qty" style="margin-top:.6rem">
              <button type="button" data-cart-decrease aria-label="Restar una unidad">&minus;</button>
              <input type="number" value="${n.qty}" min="1" max="99" data-cart-qty aria-label="Cantidad" />
              <button type="button" data-cart-increase aria-label="Sumar una unidad">+</button>
            </div>
            <button type="button" class="cart-line__remove" data-cart-remove style="margin-top:.5rem">
              Quitar del carrito
            </button>
          </div>
          <div class="cart-line__price">${a(n.price*n.qty)}</div>
        </div>`).join(``);let{subtotal:p,discount:m,promo:h,shipping:g,total:_,freeShippingRemaining:v,count:y}=s(f);u.innerHTML=`
      <h2 class="summary-card__title">Resumen del pedido</h2>
      <div class="cart-progress"><div class="cart-progress__bar" style="width:${Math.min(100,p/15e4*100)}%"></div></div>
      ${v>0?`<p style="font-size:.82rem;color:var(--muted);margin-bottom:1rem">Te faltan <strong style="color:var(--gold-deep)">${a(v)}</strong> para el envío gratis</p>`:`<p style="font-size:.82rem;color:var(--ok);margin-bottom:1rem">Tienes envío gratis aplicado</p>`}
      <div class="cart-summary"><span>Productos (${y})</span><span>${a(p)}</span></div>
      ${m>0?`<div class="cart-summary" style="color:var(--ok)"><span>Descuento ${t(h?.code??``)}</span><span>-${a(m)}</span></div>`:``}
      <div class="cart-summary"><span>Envío</span><span>${g===0?`Gratis`:a(g)}</span></div>
      <div class="cart-summary cart-summary--total"><span>Total</span><span>${a(_)}</span></div>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <input class="input" type="text" placeholder="Código de descuento" data-cart-promo
          value="${t(n())}" style="text-transform:uppercase" autocomplete="off" spellcheck="false" />
        <button class="btn btn--light" type="button" data-cart-promo-apply>Aplicar</button>
      </div>
      <p style="font-size:.78rem;color:var(--muted);margin-top:.5rem" data-cart-promo-message>
        ${m>0?`Código ${t(h?.code??``)} aplicado.`:`El descuento se aplica sobre el subtotal.`}
      </p>
      <a class="btn btn--gold btn--block" href="${c(`/checkout`)}" style="margin-top:1.25rem">
        Finalizar compra
      </a>
      <p style="font-size:.78rem;color:var(--muted);text-align:center;margin-top:.85rem">
        Pago seguro &middot; Envío a todo el país
      </p>`;let b=u.querySelector(`[data-cart-promo-apply]`),x=u.querySelector(`[data-cart-promo]`);b?.addEventListener(`click`,()=>{let e=x?.value??``;e.trim()?(o(e),d()):(i(),d())})}d(),document.addEventListener(`santhair:cart:updated`,d);