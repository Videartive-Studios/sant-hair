import type { APIRoute } from 'astro';
import { getPublishedProducts, getCategories } from '@/db/repo';
import { BLOG_POSTS } from '@/data/content';
import { LEGAL_DOCS } from '@/data/legal';

export const prerender = false;

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tienda', priority: '0.9', changefreq: 'weekly' },
  { path: '/nosotros', priority: '0.6', changefreq: 'yearly' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/contacto', priority: '0.6', changefreq: 'yearly' },
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://santhair.com').replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const products = await getPublishedProducts();
  const categories = await getCategories();

  const urls: {
    loc: string;
    lastmod: string;
    priority: string;
    changefreq: string;
  }[] = [
    ...STATIC_ROUTES.map((route) => ({
      loc: `${base}${route.path}`,
      lastmod: today,
      priority: route.priority,
      changefreq: route.changefreq,
    })),
    ...products.map((product) => ({
      loc: `${base}/tienda/${product.slug}`,
      lastmod: today,
      priority: '0.9',
      changefreq: 'weekly',
    })),
    // Las categorias son vistas filtradas de /tienda: se incluyen para que
    // los buscadores scopten las listings, pero el canonical de cada pagina
    // de categoria apunta a su propia URL con parametro.
    ...categories.map((category) => ({
      loc: `${base}/tienda?categoria=${category.slug}`,
      lastmod: today,
      priority: '0.7',
      changefreq: 'monthly',
    })),
    ...BLOG_POSTS.map((post) => ({
      loc: `${base}/blog/${post.slug}`,
      lastmod: post.date,
      priority: '0.6',
      changefreq: 'monthly',
    })),
    ...LEGAL_DOCS.map((doc) => ({
      loc: `${base}/legal/${doc.slug}`,
      lastmod: doc.updated,
      priority: '0.3',
      changefreq: 'yearly',
    })),
  ];

  // Escape de caracteres XML: las URLs con `&` deben ir como `&amp;`.
  const escapeXml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
