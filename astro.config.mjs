import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aminkbi.tech',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
});
