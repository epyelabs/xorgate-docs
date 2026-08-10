import { createOpenAPI } from "fumadocs-openapi/server"

/**
 * The OpenAPI reference.
 *
 * Two documents, on purpose:
 *
 * - `openapi/xorgate.json` is the truthful snapshot of `GET /openapi.json`,
 *   internal operations and all. Refresh it with `npm run refresh-openapi`.
 * - `openapi/xorgate.public.json` is derived from it by
 *   `scripts/generate-openapi.mjs`: internal operations stripped, `servers`
 *   pointed at the environment's API. It is a build artifact (gitignored) and
 *   is what both the generated pages and the rendered playground read.
 *
 * `createProxy` is deliberately unused. It needs a Node server and this site is
 * a static export, so the playground calls the API straight from the browser.
 * That is why the docs origins have to be in the core-service CORS allowlist
 * (`backend/xorgate-core-service/lib/stacks/api-stack.ts`).
 */

/** Truthful snapshot, committed. Refreshed by `npm run refresh-openapi`. */
export const OPENAPI_SNAPSHOT_PATH = "openapi/xorgate.json"

/** Derived, public-facing document. Written by `npm run generate-openapi`. */
export const OPENAPI_PUBLIC_PATH = "openapi/xorgate.public.json"

/** Where generated reference pages land. */
export const OPENAPI_OUTPUT_DIR = "content/docs/api-reference"

/** The schema id the generated MDX refers to (`<OpenAPIPage document="..." />`). */
export const OPENAPI_SCHEMA_ID = "xorgate"

export const openapi = createOpenAPI({
  input: { [OPENAPI_SCHEMA_ID]: OPENAPI_PUBLIC_PATH },
})
