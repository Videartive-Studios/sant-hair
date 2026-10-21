/**
 * Cupones de descuento.
 *
 * El mismo modulo se usa en el navegador (para mostrar el descuento en el
 * carrito y el checkout) y en el servidor (para recalcular el total). El
 * servidor es siempre la fuente de verdad: recalcula los precios contra la
 * base de datos y aplica el cupon validado aqui, nunca el que envie el
 * cliente.
 */

/** Codigo -> porcentaje de descuento sobre el subtotal. */
export const PROMO_CODES: Record<string, number> = {
  SANT10: 10,
};

export type Promo = {
  code: string;
  percent: number;
  amount: number;
};

/** Normaliza lo que escribe el cliente: mayusculas, sin espacios. */
export function normalizeCode(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

/**
 * Resuelve un cupon contra el subtotal indicado.
 * Devuelve `null` si el codigo no existe o no aplica.
 */
export function resolvePromo(raw: unknown, subtotal: number): Promo | null {
  const code = normalizeCode(raw);
  if (!code) return null;

  const percent = PROMO_CODES[code];
  if (!percent || percent <= 0) return null;

  const amount = Math.round((subtotal * percent) / 100);
  if (amount <= 0) return null;

  return { code, percent, amount };
}
