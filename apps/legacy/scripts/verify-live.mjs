#!/usr/bin/env node
// Checks a deployed site the way a crawler sees it. Run after every deploy:
//   pnpm verify:live [https://letshyre.ai]
// Catches what the build can't: redirects added by the server, a staging
// robots.txt, a missing pixel.
import "./lib/env.mjs";
import { SITE } from "../app/lib/seo.js";

const base = (process.argv[2] || SITE.url).replace(/\/+$/, "");
const CONCURRENCY = 8;

const REDIRECTS = [
  ["/", 301, "/en"],
  ["/en/about/", 301, "/en/about"],
  ["/hi/pricing", 302, "/en/pricing"],
];

const failures = [];
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures.push(label);
};

const get = (url) => fetch(url, { redirect: "manual" });
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];
const tags = (html, rel) =>
  [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag).filter((tag) => attr(tag, "rel") === rel);
const pathOf = (location) => new URL(location, base).pathname;

async function pool(items, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}

const robots = await get(`${base}/robots.txt`);
const robotsText = await robots.text();
check(robots.status === 200 && /^Allow: \/$/m.test(robotsText), "robots.txt allows crawling");
check(robotsText.includes(`Sitemap: ${SITE.url}/sitemap.xml`), "robots.txt points at the sitemap");

const sitemap = await get(`${base}/sitemap.xml`);
const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
check(sitemap.status === 200 && urls.length > 0, `sitemap.xml lists ${urls.length} URLs`);

const listed = new Set(urls);
const badPages = [];
await pool(urls, async (url) => {
  const res = await get(base + new URL(url).pathname);
  if (res.status !== 200) {
    badPages.push(`${url} -> ${res.status} ${res.headers.get("location") ?? ""}`.trim());
    return;
  }
  const html = await res.text();
  const canonical = attr(tags(html, "canonical")[0] ?? "", "href");
  if (canonical !== url) badPages.push(`${url} canonical is ${canonical}`);
  for (const tag of tags(html, "alternate")) {
    const href = attr(tag, "href");
    if (attr(tag, "hreflang") && !listed.has(href)) badPages.push(`${url} hreflang -> ${href} (not in sitemap)`);
  }
});
check(!badPages.length, "every sitemap URL returns 200 with a self canonical and valid hreflang");
for (const line of badPages.slice(0, 10)) console.log(`    ${line}`);
if (badPages.length > 10) console.log(`    …and ${badPages.length - 10} more`);

for (const [from, status, to] of REDIRECTS) {
  const res = await get(`${base}${from}`);
  const location = res.headers.get("location");
  check(res.status === status && location && pathOf(location) === to, `${from} -> ${status} ${to} (got ${res.status} ${location ?? ""})`.trim());
}

const home = await (await fetch(`${base}/en`)).text();
check(home.includes("fbevents.js") && home.includes('fbq("init"'), "Meta Pixel base code is in the page source");

const asset = await get(`${base}/assets/__missing__.js`);
check(asset.status === 404, `missing asset returns 404 (got ${asset.status})`);

for (const path of ["/__not-a-page__", "/xx"]) {
  const res = await get(`${base}${path}`);
  const html = await res.text();
  check(res.status === 404 && /<meta name="robots" content="noindex/.test(html), `${path} returns the noindex 404 page (got ${res.status})`);
}

const app = await get(`${base}/get-started`);
check(app.status === 200 && /<meta name="robots" content="noindex/.test(await app.text()), `client routes get the noindex shell (got ${app.status})`);

if (failures.length) {
  console.error(`\nverify-live: ${failures.length} check(s) failed for ${base}`);
  process.exit(1);
}
console.log(`\nverify-live: all checks passed for ${base}`);
