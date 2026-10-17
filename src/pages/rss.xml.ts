import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  const entries = await getCollection('writing');
  return rss({ title: 'aminkbi.tech — The field journal', description: 'Essays and field notes about distributed systems, reliable software, and the tradeoffs in between.', site: context.site!, items: entries.map(entry => ({ title: entry.data.title, description: entry.data.description, pubDate: entry.data.publishedAt, link: `/writing/${entry.id}/` })), customData: '<language>en</language>' });
}
