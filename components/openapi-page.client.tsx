"use client"

import { createOpenAPIPage } from "fumadocs-openapi/ui"

/**
 * The rendered OpenAPI operation UI: parameters, schemas, responses, code
 * samples, and the "try it" playground.
 *
 * It lives in its own client module because `createOpenAPIPage` is itself
 * exported from a client module, so the factory cannot be called from a server
 * component. `components/openapi-page.tsx` is the server wrapper that feeds it
 * the document.
 *
 * The playground posts straight to `servers[0]` of the document, with no proxy
 * in between (a static export has no server to proxy through), so that origin
 * has to allow this one in CORS.
 */
export const OpenAPIPageClient = createOpenAPIPage()
