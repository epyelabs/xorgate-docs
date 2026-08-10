#!/usr/bin/env node
/**
 * Refresh the checked-in OpenAPI snapshot from a live core-service deployment.
 *
 *   npm run refresh-openapi
 *   NEXT_PUBLIC_API_BASE_URL=https://... npm run refresh-openapi
 *
 * The API reference pages are generated from the snapshot, not fetched at build
 * time, so a docs build is reproducible and works offline. Run this when the API
 * changes, review the diff, and commit it. Diffing the snapshot is also the
 * cheapest way to spot undocumented drift.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(repoRoot, "openapi", "xorgate.json")

// Same precedence the site build uses: explicit env, then .env, then the dev
// default in lib/shared.ts.
async function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL)
    return process.env.NEXT_PUBLIC_API_BASE_URL
  for (const file of [".env.local", ".env"]) {
    try {
      const text = await readFile(join(repoRoot, file), "utf8")
      const match = text.match(/^NEXT_PUBLIC_API_BASE_URL=(.*)$/m)
      if (match?.[1]) return match[1].trim()
    } catch {
      // no such file, try the next one
    }
  }
  return "https://h357muxy3k.execute-api.us-east-1.amazonaws.com"
}

const baseUrl = (await resolveBaseUrl()).replace(/\/$/, "")
const specUrl = `${baseUrl}/openapi.json`

console.log(`Fetching ${specUrl}`)
const res = await fetch(specUrl)
if (!res.ok) {
  console.error(`Failed: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const spec = await res.json()
await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(spec, null, 2)}\n`)

const pathCount = Object.keys(spec.paths ?? {}).length
console.log(
  `Wrote ${OUT} (${pathCount} paths, version ${spec.info?.version ?? "unknown"})`
)
