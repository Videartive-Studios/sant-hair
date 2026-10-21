import type { APIRoute } from 'astro';
import { getPublishedProducts, getCategories } from '@/db/repo';
import { BLOG_POSTS } from '@/data/content';

export const prerender = false;

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tienda', priority: '0.9', changefreq: 'weekly' },
  { path: '/nosotros', priority: '0.6', changefreq: 'yearly' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/contacto', priority: '0.6', changefreq: 'yearly' },
  { path: '/legal/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/legal/terminos', priority: '0.3', changefreq: 'yearly' },
  { path: '/legal/envios', priority: '0.3', changefreq: 'yearly' },
  { path: '/legal/devoluciones', priority: '0.3', changefreq: 'yearly' },
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
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
.map(
    (url) => ` <url>
    <loc>${url.loc}</loc>
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
