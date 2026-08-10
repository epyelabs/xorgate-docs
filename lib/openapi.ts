/**
 * OpenAPI reference wiring. STUB: `fumadocs-openapi` is installed but not yet
 * hooked up, because the spec it would generate from is not truthful yet
 * (hand-written in `xorgate-core-service/src/handlers/docs.ts`, covering
 * roughly half the routes).
 *
 * Wiring it up means, roughly:
 *
 *   import { createOpenAPI } from 'fumadocs-openapi/server'
 *   export const openapi = createOpenAPI({
 *     // Browser-side playground: requests go straight to the API, so the docs
 *     // origin must be in the core-service CORS allowlist
 *     // (lib/stacks/api-stack.ts). Deliberately NOT using `createProxy`: it
 *     // needs a Node server, which a static export does not have.
 *     proxyUrl: undefined,
 *     servers: [{ url: apiBaseUrl }],
 *   })
 *
 * plus a generator step over `openapi/xorgate.json` that emits MDX into
 * `content/docs/api-reference/`, and an `openapi` page type in `lib/source.ts`.
 *
 * Keep `openapi/xorgate.json` refreshed with `npm run refresh-openapi`.
 */

/** Where the checked-in spec snapshot lives, relative to the repo root. */
export const OPENAPI_SPEC_PATH = "openapi/xorgate.json"

/** Where generated reference pages will be written. */
export const OPENAPI_OUTPUT_DIR = "content/docs/api-reference"
