/**
 * Configuración global del sitio: identidad, contacto, envío y redes.
 * Los campos marcados con PENDIENTE deben completarse antes de publicar.
 */

export const SITE = {
  brand: 'Sant Hair+',
  brandFull: 'Sant Hair+ Línea Capilar',
  tagline: 'Línea Capilar',
  description:
    'Cuidados capilares de autor. Shampoo, acondicionador y mascarilla formulados con activos puros, sin sulfatos y cruelty free.',
  url: 'https://santhair.com',
  locale: 'es_CO',
  lang: 'es',

  // PENDIENTE: reemplazar con los datos reales de Sant Hair
  email: 'contacto@santhair.com',
  phoneDisplay: '+57 300 000 0000',
  phoneHref: '+573000000000',
  whatsapp: '573000000000',
  address: 'Bogotá, Colombia',

  currency: 'COP',
  currencySymbol: '$',
  freeShippingThreshold: 150_000,
  shippingCost: 12_000,
  taxRate: 0.19,

  social: {
    instagram: 'https://instagram.com/santhair',
    facebook: 'https://facebook.com/santhair',
    tiktok: 'https://tiktok.com/@santhair',
    youtube: 'https://youtube.com/@santhair',
  },

  announcement: {
    text: 'Envío gratis en pedidos superiores a $150.000',
    code: 'SANT10',
    /** Porcentaje de descuento que aplica el cupón de la barra superior. */
    discountPercent: 10,
  },
} as const;

export const FEATURES = [
  {
    icon: 'leaf',
    title: 'Activos Puros',
    text: 'Fórmulas limpias, libres de sulfatos y siliconas',
  },
  {
    icon: 'flask',
    title: 'Testado Dermatológicamente',
    text: 'Probado en cuero cabelludo sensible',
  },
  {
    icon: 'rabbit',
    title: 'Cruelty Free',
    text: 'Nunca probamos en animales',
  },
  {
    icon: 'drop',
    title: 'Todos los tipos de cabello',
    text: 'Cuidado suave y efectivo',
  },
] as const;

export const FOOTER_LINKS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Todo el catálogo', href: '/tienda' },
      { label: 'Shampoos', href: '/tienda?categoria=shampoos' },
      { label: 'Acondicionadores', href: '/tienda?categoria=acondicionadores' },
      { label: 'Mascarillas', href: '/tienda?categoria=mascarillas' },
    ],
  },
  {
    title: 'Compañía',
    links: [
      { label: 'Sobre nosotros', href: '/nosotros' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Preguntas frecuentes', href: '/contacto#faq' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Política de privacidad', href: '/legal/privacidad' },
      { label: 'Términos y condiciones', href: '/legal/terminos' },
      { label: 'Política de envíos', href: '/legal/envios' },
      { label: 'Cambios y devoluciones', href: '/legal/devoluciones' },
    ],
  },
] as const;
