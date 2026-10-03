#!/usr/bin/env node
/**
 * Runs `react-router build`, retrying on the flaky prerender step.
 *
 * In SPA mode React Router prerenders `/` by issuing an HTTP request to an
 * internal Vite preview server. On Windows that request intermittently fails
 * with an empty-message socket error (see the `nodeFetch` comment in
 * @react-router/dev/dist/vite.js, which documents a libuv assertion around
 * pooled keep-alive sockets). Observed at roughly 1 failure in 6 local runs.

 * The failure is transport-level, not a build error: the same commit builds
 * clean on retry, and the generated index.html is byte-identical. Retrying is
 * the pragmatic fix until the upstream issue is resolved.
 *
 * Measured at roughly a 30% per-attempt failure rate locally (including one run
 * that failed twice in a row), hence 5 attempts rather than 2 or 3 — that puts
 * the odds of a spurious CI failure well under 1%.
 *
 * Only prerender-transport failures are retried — a genuine compile error
 * fails immediately, so this cannot mask a real break.
 */
import { spawn } from "node:child_process";

const MAX_ATTEMPTS = 5;
const RETRYABLE = /Prerender: Request (failed|timed out) for/;

function build() {
  return new Promise((resolve) => {
    const child = spawn("react-router", ["build"], {
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });

    let output = "";
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (chunk) => {
        output += chunk;
        process.stdout.write(chunk);
      });
    }

    child.on("close", (code) => resolve({ code, output }));
  });
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const { code, output } = await build();

  if (code === 0) {
    if (attempt > 1) console.log(`\nBuild succeeded on attempt ${attempt}.`);
    process.exit(0);
  }

  if (!RETRYABLE.test(output)) {
    console.error("\nBuild failed with a non-retryable error.");
    process.exit(code ?? 1);
  }

  if (attempt < MAX_ATTEMPTS) {
    console.warn(
      `\nPrerender transport failure (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying…\n`,
    );
  }
}

console.error(`\nPrerender failed ${MAX_ATTEMPTS} times. Failing the build.`);
process.exit(1);
