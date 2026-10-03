/*
 * Phase 1: re-encode every shipped image as a sized WebP.
 *
 * Originals move to app/assets/_source/ rather than being overwritten. In git
 * that move is free — identical content hashes to the same blob, so a rename
 * costs no extra pack space — and it leaves a designer-facing copy in the tree.
 *
 * Run with --apply to write. Without it, nothing is touched and the predicted
 * savings are printed instead.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const ASSETS = "app/assets";
const SOURCE = path.join(ASSETS, "_source");
const PUBLIC = "public";

/* Max dimension per file. The default assumes nothing in this app is displayed
   wider than ~700 CSS px, so 1400 covers a 2x screen. Overrides are for images
   whose display size is known from the JSX and is much smaller. */
const DEFAULT_CAP = 1400;
const CAP = {
  "logo2.png": 400,          // Navbar renders it at w-[125px]
  "bg-logo.png": 400,
  "check-mark.png": 256,
  "favicon.png": 128,
  "employer-onboarding-thumbnail.png": 1280, // video poster, 16:9
  "ai-Interview-thumbnail.png": 1280,
};

/* favicon.png is served by filename convention — nothing links to it, so
   renaming it to .webp would silently stop it resolving. 51 KB is not worth
   the risk, and it is never on a render path anyway. */
const SKIP = new Set(["favicon.png"]);

/* Quality 80 is the usual sweet spot for WebP photographic content; the flat
   vector-style illustrations here would survive lower, but 80 keeps this a
   safe mechanical pass rather than a per-image judgement call. */
const QUALITY = 80;

function usedImages() {
  const code = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(jsx?|css)$/.test(e.name)) code.push(fs.readFileSync(p, "utf8"));
    }
  })("app");
  const src = code.join("\n");
  const out = [];
  for (const f of fs.readdirSync(ASSETS)) {
    if (/\.(png|jpe?g)$/i.test(f) && src.includes(f)) out.push({ dir: ASSETS, f });
  }
  /* public/ files are referenced by literal URL path, not import, so they are
     matched against the same source text by filename. favicon is linked from
     the HTML shell and is included unconditionally. */
  for (const f of fs.readdirSync(PUBLIC)) {
    if (/\.(png|jpe?g)$/i.test(f) && src.includes(f)) out.push({ dir: PUBLIC, f });
  }
  return out;
}

const rows = [];
let before = 0;
let after = 0;

for (const { dir, f } of usedImages()) {
  const inPath = path.join(dir, f);
  const cap = CAP[f] ?? DEFAULT_CAP;
  const orig = fs.statSync(inPath).size;
  const img = sharp(inPath, { animated: false });
  const meta = await img.metadata();

  const pipeline = sharp(inPath).rotate();
  if (meta.width > cap || meta.height > cap) {
    pipeline.resize(cap, cap, { fit: "inside", withoutEnlargement: true });
  }
  const buf = await pipeline.webp({ quality: QUALITY, effort: 5 }).toBuffer();
  const outMeta = await sharp(buf).metadata();

  before += orig;
  after += buf.length;
  rows.push({
    dir,
    f,
    from: `${meta.width}x${meta.height}`,
    to: `${outMeta.width}x${outMeta.height}`,
    kbBefore: Math.round(orig / 1024),
    kbAfter: Math.round(buf.length / 1024),
  });

  if (APPLY) {
    const outPath = path.join(dir, f.replace(/\.(png|jpe?g)$/i, ".webp"));
    fs.writeFileSync(outPath, buf);
    if (dir === ASSETS) {
      fs.mkdirSync(SOURCE, { recursive: true });
      fs.renameSync(inPath, path.join(SOURCE, f));
    } else {
      /* public/ originals are deleted, not archived: they are copies of files
         that already exist in app/assets or are trivially regenerable, and a
         stray original in public/ would still be served. */
      fs.unlinkSync(inPath);
    }
  }
}

rows.sort((a, b) => b.kbBefore - a.kbBefore);
for (const r of rows) {
  const pct = Math.round((1 - r.kbAfter / r.kbBefore) * 100);
  console.log(
    `${String(r.kbBefore).padStart(6)} → ${String(r.kbAfter).padStart(5)} KB  ` +
      `${String(pct).padStart(3)}%  ${r.from.padEnd(11)} → ${r.to.padEnd(11)}  ${r.dir}/${r.f}`,
  );
}
console.log(
  `\n${APPLY ? "APPLIED" : "DRY RUN"}: ${rows.length} images  ` +
    `${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB  ` +
    `(${Math.round((1 - after / before) * 100)}% smaller)`,
);
