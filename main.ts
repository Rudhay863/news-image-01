// news-image-01 — make.fun entry program.
//
// This program writes the entry image, a newspaper front page summing up
// Friday 13 November 2026's world news, to the output directory.
//
// It is intentionally a plain copy: the image itself (entry.png, shipped
// beside this file) is the entry, and the program only places an exact
// byte-for-byte copy at $MAKEFUN_OUTPUT_DIR/entry.png so the run is fully
// deterministic — the same bytes come out every time, with no network and
// no randomness involved.
//
// SPDX-License-Identifier: MIT

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// The grader sets MAKEFUN_OUTPUT_DIR; fall back to /output/entry.png
// (the path the competition rules name) when it is not set.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outDir, "entry.png");
const srcFile = join(here, "entry.png");

// Read the shipped image once, then write it out.
const bytes = readFileSync(srcFile);

// Sanity-check the shipped image against the competition limits before
// copying: at most 1 MiB, and PNG magic bytes up front. (The image was
// verified at build time too; this catches a bad file before it is graded.)
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
  throw new Error("entry.png does not start with PNG magic bytes");
}

mkdirSync(outDir, { recursive: true });
copyFileSync(srcFile, outFile);

// Verify the copy is byte-for-byte identical to the source image.
// If anything differs, fail loudly instead of handing in a corrupt entry.
const written = readFileSync(outFile);
if (!written.equals(bytes)) {
  throw new Error("entry.png copy failed verification: bytes differ");
}

if (!existsSync(outFile)) {
  throw new Error("entry.png was not written to the output directory");
}

console.log(`wrote ${outFile} (${written.length} bytes)`);
