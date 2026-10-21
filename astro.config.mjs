import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro build/config
export default defineConfig({
  site: 'https://santhair.com',
  output: 'server',
  adapter: netlify({
    // En `astro dev` la emulacion de Edge Functions levanta un servidor extra
    // que no es necesario para este proyecto (no usamos middleware edge).
    devFeatures: {
      edgeFunctions: false,
      images: false,
      environmentVariables: false,
    },
  }),
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      noExternal: ['@netlify/blobs'],
    },
  },
});
