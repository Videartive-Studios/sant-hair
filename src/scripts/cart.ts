/**
 * Carrito de compras (vanilla TS, sin framework).
 * Persiste en localStorage y notifica a todos los oyentes con el evento
 * `santhair:cart:updated`.
 */

import { escapeHtml, safeImageSrc } from '@/lib/escape';
import { PROMO_CODES, normalizeCode, resolvePromo } from '@/lib/promo';

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  size: string;
};

const STORAGE_KEY = 'santhair:cart:v1';
const PROMO_KEY = 'santhair:promo:v1';
const EVENT = 'santhair:cart:updated';

const FREE_SHIPPING_THRESHOLD = 150_000;
const SHIPPING_COST = 12_000;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export function getCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Solo se aceptan los campos que el carrito necesita, para que un
    // localStorage manipulado no inyecte datos extra.
    return parsed
      .filter(
        (item): item is CartItem =>
          !!item && typeof item === 'object' && typeof item.slug === 'string',
      )
      .map((item) => ({
        slug: String(item.slug),
        name: String(item.name ?? ''),
        price: Number(item.price) || 0,
        qty: Math.max(1, Math.min(99, Number(item.qty) || 1)),
        image: String(item.image ?? ''),
        size: String(item.size ?? ''),
      }));
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent(EVENT, { detail: { items } }));
}

/* ------------------------------------------------------------------ */
/* Cupon de descuento                                                  */
/* ------------------------------------------------------------------ */

export function getPromoCode(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem(PROMO_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setPromoCode(code: string): boolean {
  const normalized = normalizeCode(code);
  if (typeof localStorage === 'undefined') return false;
  if (normalized && !PROMO_CODES[normalized]) return false;
  localStorage.setItem(PROMO_KEY, normalized);
  document.dispatchEvent(new CustomEvent(EVENT));
  return true;
}

export function clearPromoCode() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PROMO_KEY);
  document.dispatchEvent(new CustomEvent(EVENT));
}

/* ------------------------------------------------------------------ */
/* Carrito                                                              */
/* ------------------------------------------------------------------ */

export function addItem(item: Omit<CartItem, 'qty'>, qty = 1) {
  const items = getCart();
  const existing = items.find((i) => i.slug === item.slug);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 99);
  } else {
    items.push({ ...item, qty });
  }
  save(items);
}

export function setQty(slug: string, qty: number) {
  const items = getCart();
  const index = items.findIndex((i) => i.slug === slug);
  if (index === -1) return;
  if (qty <= 0) {
    items.splice(index, 1);
  } else {
    items[index].qty = Math.min(qty, 99);
  }
  save(items);
}

export function removeItem(slug: string) {
  save(getCart().filter((i) => i.slug !== slug));
}

export function clearCart() {
  save([]);
}

export function cartTotals(items = getCart()) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const promo = resolvePromo(getPromoCode(), subtotal);
  const discount = promo?.amount ?? 0;
  const base = subtotal - discount;
  const shipping = base === 0 || base >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  return {
    count,
    subtotal,
    discount,
    promo,
    shipping,
    total: base + shipping,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - base),
  };
}

/* ------------------------------------------------------------------ */
/* Interfaz                                                            */
/* ------------------------------------------------------------------ */

function renderCartBadge() {
  const { count } = cartTotals();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('is-visible', count > 0);
  });
  document.querySelectorAll<HTMLElement>('[data-cart-open-label]').forEach((el) => {
    el.textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;
  });
}

function renderCartFooter() {
  const foot = document.querySelector<HTMLElement>('[data-cart-foot]');
  if (!foot) return;

  const items = getCart();
  if (items.length === 0) {
    foot.innerHTML = '';
    return;
  }

  const {
    subtotal,
    discount,
    promo,
    shipping,
    total,
    freeShippingRemaining,
  } = cartTotals(items);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  foot.innerHTML = `
    <div class="cart-progress"><div class="cart-progress__bar" style="width:${progress}%"></div></div>
    ${
      freeShippingRemaining > 0
        ? `<p style="font-size:.8rem;color:var(--muted);margin-bottom:.9rem">Te faltan <strong style="color:var(--gold-deep)">${formatMoney(freeShippingRemaining)}</strong> para el envío gratis</p>`
        : `<p style="font-size:.8rem;color:var(--ok);margin-bottom:.9rem">Tienes envío gratis aplicado</p>`
    }
    <div class="cart-summary"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
    ${
      discount > 0
        ? `<div class="cart-summary" style="color:var(--ok)"><span>Descuento ${escapeHtml(promo?.code ?? '')}</span><span>-${formatMoney(discount)}</span></div>`
        : ''
    }
    <div class="cart-summary"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : formatMoney(shipping)}</span></div>
    <div class="cart-summary cart-summary--total"><span>Total</span><span>${formatMoney(total)}</span></div>
    <a class="btn btn--gold btn--block" href="/checkout" style="margin-top:1rem">Finalizar compra</a>
    <a class="btn btn--light btn--block" href="/carrito" style="margin-top:.6rem">Ver carrito completo</a>`;
}

function renderDrawer() {
  const body = document.querySelector<HTMLElement>('[data-cart-body]');
  if (!body) return;

  const items = getCart();

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Tu carrito está vacío</p>
        <a class="btn btn--light btn--sm" href="/tienda" style="margin-top:1.25rem">Explorar la tienda</a>
      </div>`;
    renderCartFooter();
    return;
  }

  body.innerHTML = items
    .map(
      (item) => `
      <div class="cart-line" data-slug="${escapeHtml(item.slug)}">
        <a class="cart-line__img" href="/tienda/${encodeURIComponent(item.slug)}">
          <img src="${safeImageSrc(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
        </a>
        <div>
          <a class="cart-line__name" href="/tienda/${encodeURIComponent(item.slug)}">${escapeHtml(item.name)}</a>
          <div class="cart-line__meta">${escapeHtml(item.size)}</div>
          <div class="qty" style="margin-top:.55rem;transform:scale(.86);transform-origin:left center">
            <button type="button" data-cart-decrease aria-label="Restar una unidad">&minus;</button>
            <input type="number" value="${item.qty}" min="1" max="99" data-cart-qty aria-label="Cantidad" />
            <button type="button" data-cart-increase aria-label="Sumar una unidad">+</button>
          </div>
          <button type="button" class="cart-line__remove" data-cart-remove style="margin-top:.4rem">Quitar</button>
        </div>
        <div class="cart-line__price">${formatMoney(item.price * item.qty)}</div>
      </div>`,
    )
    .join('');

  renderCartFooter();
}

function openDrawer() {
  document.querySelectorAll('[data-cart-drawer]').forEach((el) => {
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
}

function closeDrawer() {
  document.querySelectorAll('[data-cart-drawer]').forEach((el) => {
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  });
}

export function showToast(message: string) {
  let toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-toast', '');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast?.classList.add('is-visible'));
  window.setTimeout(() => toast?.classList.remove('is-visible'), 3200);
}

function bindEvents() {
  // Agregar al carrito
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const addBtn = target.closest<HTMLElement>('[data-add-to-cart]');
    if (addBtn) {
      event.preventDefault();
      const qty = Number(
        document.querySelector<HTMLInputElement>('[data-qty-input]')?.value ?? 1,
      );
      addItem(
        {
          slug: addBtn.dataset.slug ?? '',
          name: addBtn.dataset.name ?? '',
          price: Number(addBtn.dataset.price ?? 0),
          image: addBtn.dataset.image ?? '',
          size: addBtn.dataset.size ?? '',
        },
        Number.isFinite(qty) && qty > 0 ? qty : 1,
      );
      showToast(`${addBtn.dataset.name ?? 'Producto'} agregado al carrito`);
      openDrawer();
      return;
    }

    if (target.closest('[data-cart-open]')) {
      event.preventDefault();
      openDrawer();
      return;
    }

    if (target.closest('[data-cart-close]')) {
      event.preventDefault();
      closeDrawer();
      return;
    }

    const line = target.closest<HTMLElement>('[data-slug]');
    if (line) {
      const slug = line.dataset.slug!;
      if (target.closest('[data-cart-increase]')) {
        const item = getCart().find((i) => i.slug === slug);
        if (item) setQty(slug, item.qty + 1);
        return;
      }
      if (target.closest('[data-cart-decrease]')) {
        const item = getCart().find((i) => i.slug === slug);
        if (item) setQty(slug, item.qty - 1);
        return;
      }
      if (target.closest('[data-cart-remove]')) {
        removeItem(slug);
        return;
      }
    }
  });

  // Cantidad por input
  document.addEventListener('change', (event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>(
      '[data-cart-qty]',
    );
    if (!input) return;
    const line = input.closest<HTMLElement>('[data-slug]');
    if (!line) return;
    setQty(line.dataset.slug!, Number(input.value));
  });

  // Tecla Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  // Notificacion de cambios
  document.addEventListener(EVENT, () => {
    renderCartBadge();
    renderDrawer();
  });
}

export function initCart() {
  bindEvents();
  renderCartBadge();
  renderDrawer();
  // Re-render cuando el navegador restaura la sesion (carrito persistido).
  window.addEventListener('storage', () => {
    renderCartBadge();
    renderDrawer();
  });
}
