#!/usr/bin/env node
/**
 * Refresh the checked-in OpenAPI snapshot.
 *
 *   npm run refresh-openapi                            # from the dev deployment
 *   NEXT_PUBLIC_API_BASE_URL=https://... npm run refresh-openapi
 *   npm run refresh-openapi -- ../../backend/xorgate-core-service/openapi.json
 *
 * The API reference pages are generated from the snapshot, not fetched at build
 * time, so a docs build is reproducible and works offline. Run this when the API
 * changes, review the diff, commit it, and re-run `npm run generate-openapi`.
 * Diffing the snapshot is also the cheapest way to spot undocumented drift.
 *
 * The file form matters when the spec has changed but is not deployed yet:
 * `npm run openapi:emit` in xorgate-core-service writes the same document the
 * live `/openapi.json` would serve, straight from source.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { repoRoot, resolveApiBaseUrl } from "./api-base-url.mjs"

const OUT = join(repoRoot, "openapi", "xorgate.json")

/** A local path argument reads from disk instead of over HTTP. */
const fileArg = process.argv[2]

let spec
if (fileArg) {
  const from = resolve(process.cwd(), fileArg)
  console.log(`Reading ${from}`)
  spec = JSON.parse(await readFile(from, "utf8"))
} else {
  // `/v1` is part of the PATH, not the host: NEXT_PUBLIC_API_BASE_URL is a bare
  // origin and the document lives under the version like every other route.
  // Fetching `${base}/openapi.json` returned a stale snapshot silently once the
  // unversioned paths were deleted (2026-08-19), because the 404 only exits
  // this script and callers had already piped its output.
  const specUrl = `${await resolveApiBaseUrl()}/v1/openapi.json`
  console.log(`Fetching ${specUrl}`)
  const res = await fetch(specUrl)
  if (!res.ok) {
    console.error(`Failed: ${res.status} ${res.statusText}`)
    process.exit(1)
  }
  spec = await res.json()
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(spec, null, 2)}\n`)

const pathCount = Object.keys(spec.paths ?? {}).length
console.log(
  `Wrote ${OUT} (${pathCount} paths, version ${spec.info?.version ?? "unknown"})`
)
