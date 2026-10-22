/**
 * Datos estructurados (schema.org) y metadatos de redes sociales.
 *
 * El sitio usa JSON-LD embebido en el HTML: es lo que leen Google, Facebook
 * y Twitter para mostrar tarjetas enriquecidas (precio, disponibilidad,
 * migas de pan, preguntas frecuentes).
 */

import { SITE } from '@/data/site';
import { img } from '@/lib/assets';

const abs = (path: string) => new URL(path, SITE.url).toString();

/** Organization + WebSite: los datos de la marca, en todas las paginas. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE.url}/#organization`,
        name: SITE.brandFull,
        alternateName: SITE.brand,
        url: SITE.url,
        logo: {
          '@type': 'ImageObject',
          url: abs(img('/img/logo-horizontal.png')),
          width: 630,
          height: 173,
        },
        image: abs(img('/img/mockup-claro.webp')),
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phoneHref,
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.address,
          addressCountry: 'CO',
        },
        sameAs: [
          SITE.social.instagram,
          SITE.social.facebook,
          SITE.social.tiktok,
          SITE.social.youtube,
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: SITE.email,
          telephone: SITE.phoneHref,
          availableLanguage: ['es'],
          areaServed: 'CO',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.brandFull,
        description: SITE.description,
        inLanguage: SITE.locale,
        publisher: { '@id': `${SITE.url}/#organization` },
      },
    ],
  };
}

/** Product: se usa en la ficha de producto. */
export function productSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  size: string;
  slug: string;
}) {
  const url = abs(`/tienda/${product.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [abs(product.image)],
    sku: product.slug,
    category: 'Cuidado capilar',
    brand: { '@type': 'Brand', name: SITE.brand },
    size: product.size,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: SITE.currency,
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 864e5)
        .toISOString()
        .slice(0, 10),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE.url}/#organization` },
    },
  };
}

/** BreadcrumbList: las migas de pan de una pagina. */
export function breadcrumbSchema(
  items: { name: string; href: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: abs(item.href),
    })),
  };
}

/** FAQPage: convierte las preguntas frecuentes en resultados enriquecidos. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Article: se usa en las entradas del blog. */
export function articleSchema(post: {
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  author: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: abs(post.cover),
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    inLanguage: 'es',
  };
}

/** ItemList: el catalogo de la tienda. */
export function itemListSchema(
  products: { name: string; slug: string; image: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: abs(`/tienda/${product.slug}`),
      name: product.name,
      image: abs(product.image),
    })),
  };
}
