import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.config.js';

export default defineConfig({
  site: site.url,
  integrations: [sitemap()],
  trailingSlash: 'never',
});
