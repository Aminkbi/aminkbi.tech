import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
async function filesIn(directory) {
  const files = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(files.map(file => file.isDirectory() ? filesIn(path.join(directory, file.name)) : [path.join(directory, file.name)]))).flat();
}
const files = await filesIn(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));

test('all built pages expose unique titles, descriptions, language, and one main heading', async () => {
  const titles = new Set();
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, `Missing title in ${file}`);
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    titles.add(title);
    assert.match(html, /<html[^>]+lang="en"/, file);
    assert.match(html, /<meta name="description" content="[^"]+"/, file);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, file);
    assert.match(html, /<main[^>]+id="main"/, file);
  }
});

test('every internal page, asset, and anchor resolves in the production build', async () => {
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|data:|mailto:|\/\/)/.test(raw)) continue;
      const url = new URL(raw.replaceAll('&amp;', '&'), `https://aminkbi.tech/${path.relative(root, file)}`);
      let target = path.join(root, decodeURIComponent(url.pathname));
      try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); }
      catch { assert.fail(`Broken internal URL ${raw} in ${path.relative(root,file)}`); }
      const content = await readFile(target, 'utf8');
      if (url.hash) assert.ok(content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${raw} in ${file}`);
    }
  }
});

test('RSS includes the three published essays and the site ships a sitemap and text lab alternative', async () => {
  const feed = await readFile(path.join(root, 'rss.xml'), 'utf8');
  assert.equal((feed.match(/<item>/g) ?? []).length, 3);
  for (const slug of ['reliable-orders','idempotency','transactional-outbox']) assert.ok(feed.includes(`/writing/${slug}/`));
  assert.ok(files.some(file => file.endsWith('sitemap-index.xml')));
  const lab = await readFile(path.join(root, 'lab/index.html'), 'utf8');
  assert.match(lab, /Scenario notes/);
  for (const scenario of ['Healthy:', 'Timeout:', 'Duplicate:']) assert.ok(lab.includes(scenario));
});
