import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * The API base URL these scripts should target.
 *
 * Next.js loads `.env` itself, but these run as plain node before it, so they
 * have to read the file. CI writes `.env` from GitHub Environment variables
 * and then calls `npm run build`, whose `prebuild` step is the generator, so
 * skipping this would silently bake the dev endpoint into a prod build.
 *
 * Precedence matches the site build: explicit env, then `.env.local`, then
 * `.env`, then the dev default that also lives in `lib/shared.ts`.
 */
export async function resolveApiBaseUrl() {
  let value = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!value) {
    for (const file of [".env.local", ".env"]) {
      try {
        const text = await readFile(join(repoRoot, file), "utf8")
        const match = text.match(/^NEXT_PUBLIC_API_BASE_URL=(.*)$/m)
        if (match?.[1]?.trim()) {
          value = match[1].trim()
          break
        }
      } catch {
        // no such file, try the next one
      }
    }
  }
  return (
    value ?? "https://h357muxy3k.execute-api.us-east-1.amazonaws.com"
  ).replace(/\/$/, "")
}
