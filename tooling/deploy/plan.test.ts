// usage: pnpm test:deploy

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  cacheControlOf,
  contentTypeOf,
  cspRouteOf,
  isSkipped,
  MANIFEST_KEY,
} from "./files.ts"
import { eachLimited } from "./limit.ts"
import {
  checkBucket,
  type LocalFile,
  type Manifest,
  planDeploy,
  type RemoteObject,
} from "./plan.ts"

describe("files", () => {
  it("types every file the builds make, with charsets on text", () => {
    assert.equal(
      contentTypeOf("en/pricing/index.html"),
      "text/html; charset=utf-8"
    )
    assert.equal(contentTypeOf("en/pricing.data"), "text/x-script")
    assert.equal(contentTypeOf("sitemap.xml"), "application/xml; charset=utf-8")
    assert.equal(
      contentTypeOf("en/blogs/feed.xml"),
      "application/rss+xml; charset=utf-8"
    )
    assert.equal(contentTypeOf("llms.txt"), "text/plain; charset=utf-8")
    assert.equal(contentTypeOf("site.webmanifest"), "application/manifest+json")
    assert.equal(contentTypeOf("images/home/her-desk-960.avif"), "image/avif")
    assert.equal(contentTypeOf("assets/root-CklUtISb.css"), "text/css")
  })

  it("refuses an extension it doesn't know instead of guessing", () => {
    assert.throws(() => contentTypeOf("assets/video.mp4"), /no content type/)
    assert.throws(() => contentTypeOf("README"), /no content type/)
  })

  it("caches hashed assets for good and revalidates pages", () => {
    assert.match(cacheControlOf("assets/app-abc123.js"), /immutable/)
    assert.match(cacheControlOf("assets/notes.txt"), /immutable/)
    for (const key of ["en/index.html", "en.data", "sitemap.xml", "robots.txt"])
      assert.match(cacheControlOf(key), /max-age=0, .*must-revalidate/, key)
    assert.match(cacheControlOf("og/home.jpg"), /max-age=86400/)
  })

  it("never ships notes, dotfiles, the marketing shell or resource-route .data", () => {
    assert.ok(isSkipped("marketing", "images/home/SOURCES.md"))
    assert.ok(isSkipped("app", ".DS_Store"))
    assert.ok(isSkipped("marketing", "index.html"))
    assert.ok(isSkipped("marketing", "en/blogs/feed.xml.data"))
    assert.ok(isSkipped("marketing", "en/blogs/search.json.data"))
    assert.ok(!isSkipped("app", "index.html"))
    assert.ok(!isSkipped("marketing", "en/blogs.data"))
  })

  it("finds each marketing page's policy by route, and the fallback for the rest", () => {
    assert.equal(cspRouteOf("marketing", "en/index.html"), "/en")
    assert.equal(
      cspRouteOf("marketing", "en/blogs/glossary/ctc/index.html"),
      "/en/blogs/glossary/ctc"
    )
    assert.equal(cspRouteOf("marketing", "404/index.html"), null)
    assert.equal(cspRouteOf("app", "index.html"), null)
  })
})

const NOW = new Date("2026-11-18T00:00:00Z")
const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY)

const file = (key: string, fingerprint = "v1"): LocalFile => ({
  key,
  path: key,
  contentType: "x",
  cacheControl: "x",
  metadata: {},
  fingerprint,
})
const object = (key: string, days = 0): RemoteObject => ({
  key,
  lastModified: daysAgo(days),
})
const manifest = (over: Partial<Manifest> = {}): Manifest => ({
  app: "marketing",
  commit: "abc",
  deployedAt: daysAgo(1).toISOString(),
  files: {},
  retired: {},
  ...over,
})
const plan = (
  local: LocalFile[],
  remote: RemoteObject[],
  previous: Manifest | null = null
) =>
  planDeploy("marketing", local, remote, previous, { now: NOW, commit: "def" })

describe("planDeploy", () => {
  it("uploads in phases: assets, public files, .data, then HTML", () => {
    const { phases } = plan(
      [
        file("en/index.html"),
        file("en.data"),
        file("og/home.jpg"),
        file("assets/a.js"),
        file("assets/b.js"),
      ],
      []
    )
    assert.deepEqual(
      phases.map((phase) => phase.map((f) => f.key)),
      [
        ["assets/a.js", "assets/b.js"],
        ["og/home.jpg"],
        ["en.data"],
        ["en/index.html"],
      ]
    )
  })

  it("skips what the last deploy already shipped and does nothing when nothing changed", () => {
    const result = plan(
      [file("en/index.html"), file("assets/a.js")],
      [object("en/index.html"), object("assets/a.js"), object(MANIFEST_KEY)],
      manifest({ files: { "en/index.html": "v1", "assets/a.js": "v1" } })
    )
    assert.deepEqual(result.phases, [])
    assert.deepEqual(result.remove, [])
    assert.equal(result.changed, false)
  })

  it("re-uploads a page whose policy or CSP mode changed", () => {
    const result = plan(
      [file("en/index.html", "enforce")],
      [object("en/index.html")],
      manifest({ files: { "en/index.html": "report-only" } })
    )
    assert.deepEqual(
      result.phases.flat().map((f) => f.key),
      ["en/index.html"]
    )
    assert.equal(result.changed, true)
  })

  it("re-uploads every page when there's no manifest to compare with", () => {
    const result = plan([file("en/index.html")], [object("en/index.html")])
    assert.equal(result.phases.flat().length, 1)
  })

  it("removes dropped pages but never the manifest or an asset", () => {
    const result = plan(
      [file("en/index.html")],
      [
        object("en/index.html"),
        object("en/policy/index.html"),
        object("assets/old.js"),
        object(MANIFEST_KEY),
      ],
      manifest()
    )
    assert.deepEqual(result.remove, ["en/policy/index.html"])
  })

  it("starts an asset's 30 days when it leaves the build, however old the file is", () => {
    const result = plan(
      [file("en/index.html")],
      [object("assets/vendor-old.js", 90)],
      manifest()
    )
    assert.deepEqual(result.prune, [])
    assert.deepEqual(result.manifest.retired, {
      "assets/vendor-old.js": NOW.toISOString(),
    })
  })

  it("prunes an asset 30 days after it left the build", () => {
    const result = plan(
      [file("en/index.html")],
      [object("assets/gone-long.js", 90), object("assets/gone-recent.js", 90)],
      manifest({
        retired: {
          "assets/gone-long.js": daysAgo(31).toISOString(),
          "assets/gone-recent.js": daysAgo(3).toISOString(),
        },
      })
    )
    assert.deepEqual(result.prune, ["assets/gone-long.js"])
    assert.deepEqual(Object.keys(result.manifest.retired), [
      "assets/gone-recent.js",
    ])
  })

  it("forgets the retirement of an asset the build uses again", () => {
    const result = plan(
      [file("assets/back.js")],
      [object("assets/back.js", 40)],
      manifest({ retired: { "assets/back.js": daysAgo(31).toISOString() } })
    )
    assert.deepEqual(result.prune, [])
    assert.deepEqual(result.manifest.retired, {})
  })

  it("records the commit and every file it shipped", () => {
    const result = plan([file("en/index.html", "f1")], [])
    assert.equal(result.manifest.commit, "def")
    assert.deepEqual(result.manifest.files, { "en/index.html": "f1" })
  })
})

describe("checkBucket", () => {
  it("refuses a bucket another app deployed to", () => {
    assert.throws(
      () => checkBucket("app", manifest({ app: "marketing" }), []),
      /holds the marketing site/
    )
  })

  it("refuses a bucket with files but no manifest, unless told to adopt it", () => {
    const remote = [object("en/index.html")]
    assert.throws(() => checkBucket("app", null, remote), /--adopt/)
    assert.doesNotThrow(() => checkBucket("app", null, remote, { adopt: true }))
  })

  it("accepts an empty bucket and its own", () => {
    assert.doesNotThrow(() => checkBucket("admin", null, []))
    assert.doesNotThrow(() =>
      checkBucket("marketing", manifest(), [object("en/index.html")])
    )
  })
})

describe("eachLimited", () => {
  it("starts nothing new after a failure and still throws it", async () => {
    const started: number[] = []
    await assert.rejects(
      eachLimited([1, 2, 3, 4, 5, 6], 2, async (n) => {
        started.push(n)
        await new Promise((done) => setTimeout(done, 5))
        if (n === 1) throw new Error("upload 1 failed")
      }),
      /upload 1 failed/
    )
    assert.deepEqual(started, [1, 2])
  })
})
