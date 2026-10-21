/**
 * Catalogo de productos. Esta es la semilla (seed) que se carga en la base de
 * datos (Netlify Blobs) la primera vez que el sitio arranca. Despues, la
 * base de datos manda y estos valores solo sirven como respaldo.
 */

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  size: string;
  image: string;
  gallery: string[];
  badge?: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  published: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'cat-shampoos',
    slug: 'shampoos',
    name: 'Shampoos',
    description: 'Limpieza profunda que respeta la fibra capilar.',
    image: '/img/producto-shampoo.webp',
    seoTitle: 'Shampoos Sant Hair+ | Limpieza sin sulfatos',
    seoDescription:
      'Shampoos de la linea Sant Hair+ con keratina vegetal, pantenol y biotina. Limpieza profunda, sin sulfatos ni siliconas.',
  },
  {
    id: 'cat-acondicionadores',
    slug: 'acondicionadores',
    name: 'Acondicionadores',
    description: 'Desenreda, nutre y sella la cuticula sin pesar.',
    image: '/img/producto-acondicionador.webp',
    seoTitle: 'Acondicionadores Sant Hair+ | Desenreda y nutre',
    seoDescription:
      'Acondicionadores Sant Hair+ de textura ligera con manteca de karite y keratina vegetal. Desenreda y nutre sin efecto grasa.',
  },
  {
    id: 'cat-mascarillas',
    slug: 'mascarillas',
    name: 'Mascarillas',
    description: 'Reparacion profunda para cabellos danados.',
    image: '/img/producto-mascarilla.webp',
    seoTitle: 'Mascarillas capilares Sant Hair+ | Reparacion profunda',
    seoDescription:
      'Mascarillas capilares Sant Hair+ con manteca de karite y keratina vegetal. Ritual de reparacion profunda para cabellos danados.',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prd-shampoo',
    slug: 'shampoo-nutritivo-sant-hair',
    name: 'Shampoo Nutritivo',
    subtitle: 'Limpieza profunda sin agresivo',
    category: 'shampoos',
    price: 54_900,
    compareAtPrice: 64_900,
    stock: 42,
    size: '300 ml',
    image: '/img/producto-shampoo.webp',
    gallery: [
      '/img/producto-shampoo.webp',
      '/img/mockup-claro.webp',
      '/img/mascarilla-detalle.webp',
    ],
    badge: 'Mas vendido',
    shortDescription:
      'Limpia en profundidad, respeta la fibra capilar y deja el cabello suelto y con brillo.',
    description:
      'Un shampoo de uso diario pensado para cabellos que se ven opacos, secos o con exceso de producto. Su formula a base de tensioactivos suaves, sin sulfatos, limpia la piel del cuero cabelludo en profundidad sin arrastrar los hidratos de la fibra capilar, respetando la cuticula y el color. La keratina vegetal reconstruye el cabello durante el lavado, el pantenol devuelve flexibilidad y la biotina fortalece la raiz. El resultado es un cabello limpio, ligero y con brillo natural, sin la sensacion de tirantez que deja un lavado agresivo.',
    benefits: [
      'Limpieza profunda sin sulfatos ni siliconas',
      'Keratina vegetal que refuerza la fibra capilar',
      'Pantenol y biotina para brillo y nutricion',
      'No reseca ni estrapa el cabello rizado',
      'Apto para uso diario y cabellos tratados con color',
    ],
    ingredients: [
      'Agua',
      'Cocoamidopropil betaina',
      'Laureato de etilo cocoato',
      'Glicerina vegetal',
      'Pantenol (provitamina B5)',
      'Keratina vegetal hidrolizada',
      'Biotina',
      'Extracto de raiz de ginseng',
      'Acido hialuronico de bajo peso molecular',
      'Conservantes de origen vegetal',
    ],
    howToUse:
      'Aplica una moneda generosa sobre el cabello humedo, masajea el cuero cabelludo con las yemas durante 30 segundos y enjuaga. Repite el lavado solo si es necesario. Para un ritual completo, sigue con el Acondicionador Suave.',
    seoTitle: 'Shampoo Nutritivo Sant Hair+ 300 ml | Sin sulfatos',
    seoDescription:
      'Shampoo nutritivo de la linea Sant Hair+ con keratina vegetal, pantenol y biotina. Limpieza profunda sin resecar. 300 ml.',
    featured: true,
    published: true,
  },
  {
    id: 'prd-acondicionador',
    slug: 'acondicionador-suave-sant-hair',
    name: 'Acondicionador Suave',
    subtitle: 'Desenreda, nutre y sella',
    category: 'acondicionadores',
    price: 62_900,
    stock: 35,
    size: '300 ml',
    image: '/img/producto-acondicionador.webp',
    gallery: [
      '/img/producto-acondicionador.webp',
      '/img/mockup-claro.webp',
      '/img/mascarilla-detalle.webp',
    ],
    badge: 'Nuevo',
    shortDescription:
      'Textura ligera que desenreda al instante y sella la cuticula sin dejar efecto grasa.',
    description:
      'Un acondicionador de textura ligera pensado para cabellos que se enredan facil y que huyen de los productos densos. Su base de manteca de karite y aceites vegetales ligeros forma una pelicula delgada sobre la fibra que facilita el deslizamiento del peine y sella la cuticula, reduciendo la estatica y el frizz. La keratina vegetal aporta cuerpo y el acido hialuronico mantiene la hidratacion sin pesadez. Se absorbe rapido: el cabello queda suelto, suave y con brillo, nunca con efecto grasa.',
    benefits: [
      'Desenreda en un solo paso, incluso en cabello mojado',
      'Sella la cuticula y controla el frizz y la estatica',
      'Manteca de karite y keratina vegetal de origen etico',
      'Textura ligera: sin efecto grasa ni acumulacion',
      'Ideal para cabellos finos, rizados y extensiones',
    ],
    ingredients: [
      'Agua',
      'Cetearil alcohol (vegetal)',
      'Manteca de karite',
      'Aceite de coco',
      'Mantequilla de mango',
      'Keratina vegetal hidrolizada',
      'Acido hialuronico',
      'Proteinas de seda',
      'Extracto de aloe vera',
      'Vitamina E',
    ],
    howToUse:
      'Aplica de medios a extremos sobre el cabello escurrido despues del shampoo. Deja actuar de 2 a 3 minutos y enjuaga con agua fria. En cabello muy grueso o poroso, puede dejarse actuar hasta 5 minutos.',
    seoTitle: 'Acondicionador Suave Sant Hair+ 300 ml | Desenreda y nutre',
    seoDescription:
      'Acondicionador de textura ligera con manteca de karite y keratina vegetal. Desenreda, sella la cuticula y controla el frizz. 300 ml.',
    featured: true,
    published: true,
  },
  {
    id: 'prd-mascarilla',
    slug: 'mascarilla-intensiva-sant-hair',
    name: 'Mascarilla Intensiva',
    subtitle: 'Ritual de reparacion profunda',
    category: 'mascarillas',
    price: 78_900,
    compareAtPrice: 89_900,
    stock: 28,
    size: '250 ml',
    image: '/img/producto-mascarilla.webp',
    gallery: [
      '/img/producto-mascarilla.webp',
      '/img/mockup-claro.webp',
      '/img/mascarilla-detalle.webp',
    ],
    badge: 'Ritual semanal',
    shortDescription:
      'Reparacion profunda para cabellos danados por calor, color o quimica.',
    description:
      'La etapa mas profunda del ritual Sant Hair+. Esta mascarilla combina manteca de karite, miel de azahar y keratina vegetal en una textura densa que repara el dano visible: cuticulas levantadas, sequedad extrema y falta de movimiento. En uso semanal, ayuda a reconstruir los enlaces debilitados por decoloracion, planchas o tratamientos quimicos, devolviendo al cabello su textura, resistencia y brillo. El resultado es un cabello que se peina facil y que se siente mas sano desde la raiz hasta las puntas.',
    benefits: [
      'Repara el dano por calor, color y tratamientos quimicos',
      'Reconstruye la cuticula y aporta resistencia',
      'Miel de azahar y manteca de karite en alta concentracion',
      'Devuelve brillo y movimiento al cabello apagado',
      'Uso semanal: una vez cada 7 dias',
    ],
    ingredients: [
      'Agua',
      'Manteca de karite',
      'Miel de azahar',
      'Cera de candelilla',
      'Keratina vegetal hidrolizada',
      'Proteinas de seda',
      'Aceite de argan',
      'Vitamina E',
      'Extracto de romero',
      'Alantoina',
    ],
    howToUse:
      'Aplica una cantidad generosa sobre el cabello limpio y escurrido, de la media longitud hacia las puntas. Distribuye con los dedos y deja actuar de 5 a 10 minutos, o toda la noche en el caso de cabello muy danado. Enjuaga con agua fria. Usa una vez por semana.',
    seoTitle: 'Mascarilla Intensiva Sant Hair+ 250 ml | Reparacion profunda',
    seoDescription:
      'Mascarilla capilar de reparacion profunda con manteca de karite, miel de azahar y keratina vegetal. Para cabellos danados. 250 ml.',
    featured: true,
    published: true,
  },
];
