/**
 * Cut a document down to what one reference page actually renders.
 *
 * `<OpenAPIPage />` is a client component, so whatever document it is handed
 * gets serialized into that page's payload. Handing it the whole thing means
 * every operation page ships the full ~115 KB document, several times over once
 * Next.js writes both the HTML and the RSC payloads. Measured across 53
 * operation pages that was 39 MB of static output for a document that describes
 * one endpoint per page.
 *
 * So each page gets a document containing only its own path items plus the
 * transitive closure of the components those reach. The result is a valid
 * OpenAPI document with the same `info`, `servers` and `security`, which is all
 * the renderer and the playground need.
 */

type Json = Record<string, unknown>

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
])

/** `#/components/schemas/Device` -> `["schemas", "Device"]`, else null. */
function parseRef(ref: string): [string, string] | null {
  const parts = ref.split("/")
  if (parts.length !== 4 || parts[0] !== "#" || parts[1] !== "components") {
    return null
  }
  return [parts[2], parts[3]]
}

function collectRefs(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, into)
    return
  }
  if (!node || typeof node !== "object") return
  for (const [key, value] of Object.entries(node as Json)) {
    if (key === "$ref" && typeof value === "string") into.add(value)
    else collectRefs(value, into)
  }
}

export interface OperationRef {
  path: string
  method: string
}

export function sliceDocument<T extends Json>(
  bundled: T,
  operations: OperationRef[]
): T {
  // Webhooks would need the same treatment; this API has none, so rather than
  // carry untested code, fall back to the whole document if one ever appears.
  if (bundled.webhooks || operations.length === 0) return bundled

  const allPaths = (bundled.paths ?? {}) as Record<string, Json>
  const paths: Record<string, Json> = {}
  for (const { path, method } of operations) {
    const item = allPaths[path]
    if (!item) return bundled
    const kept = (paths[path] ??= {})
    for (const [key, value] of Object.entries(item)) {
      // Path-level members (`parameters`, `summary`) apply to every operation
      // under the path, so they come along; sibling methods do not.
      if (!HTTP_METHODS.has(key)) kept[key] = value
    }
    kept[method] = item[method]
  }

  const allComponents = (bundled.components ?? {}) as Record<string, Json>
  // Security schemes are referenced by NAME from `security`, never by `$ref`,
  // so the closure below would never find them.
  const components: Record<string, Json> = allComponents.securitySchemes
    ? { securitySchemes: allComponents.securitySchemes }
    : {}

  const pending = new Set<string>()
  collectRefs(paths, pending)
  collectRefs(components, pending)
  const seen = new Set<string>()
  while (pending.size > 0) {
    const ref: string = pending.values().next().value!
    pending.delete(ref)
    if (seen.has(ref)) continue
    seen.add(ref)
    const parsed = parseRef(ref)
    if (!parsed) continue
    const [group, name] = parsed
    const value = allComponents[group]?.[name]
    if (value === undefined) continue
    ;(components[group] ??= {})[name] = value
    collectRefs(value, pending)
  }

  return { ...bundled, paths, components }
}
