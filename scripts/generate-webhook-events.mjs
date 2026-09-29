#!/usr/bin/env node
/**
 * Render the webhook event reference on `platform-concepts/webhooks.mdx` from
 * the committed OpenAPI snapshot.
 *
 *   npm run generate-openapi     # runs this after the API reference
 *   node scripts/generate-webhook-events.mjs
 *
 * Core publishes one entry per event type under the snapshot's top-level
 * `x-webhooks` (the document is OAS 3.0.3, which has no `webhooks` section).
 * Each entry's request body example is the full envelope with that type's
 * sample `data`, taken from the same catalog that backs
 * `GET /webhook-event-types`. So the samples on the concept page are never
 * typed by hand: this script rewrites the regions between
 *
 *   {/* BEGIN generated:<region> ... *\/}   and   {/* END generated:<region> *\/}
 *
 * and leaves every other line of the page alone. Regions: `envelope` (one
 * whole delivery body) and `events` (the event table plus one `data` sample
 * per type). The result is run through Prettier so a later `npm run format`
 * does not fight the generator.
 */
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import * as prettier from "prettier"
import { repoRoot } from "./api-base-url.mjs"

const SNAPSHOT = join(repoRoot, "openapi", "xorgate.json")
const PAGE = join(
  repoRoot,
  "content",
  "docs",
  "platform-concepts",
  "webhooks.mdx"
)
/** The event whose envelope the `envelope` region shows. */
const ENVELOPE_EXAMPLE = "device.offline"

const snapshot = JSON.parse(await readFile(SNAPSHOT, "utf8"))
const hooks = snapshot["x-webhooks"] ?? snapshot.webhooks
if (!hooks || Object.keys(hooks).length === 0) {
  console.error(`${SNAPSHOT} has no x-webhooks; refresh the snapshot first`)
  process.exit(1)
}

/** Event types a device route may carry, from `PUT /devices/{id}/webhooks`. */
function deviceRoutableTypes() {
  const put = Object.entries(snapshot.paths ?? {}).find(([path]) =>
    path.endsWith("/devices/{id}/webhooks")
  )?.[1]?.put
  const schema = put?.requestBody?.content?.["application/json"]?.schema
  return new Set(
    schema?.properties?.routes?.items?.properties?.eventTypes?.items?.enum ?? []
  )
}

function routingOf(type, deviceTypes) {
  if (deviceTypes.has(type)) return "Device route"
  if (type === "ping") return "`POST /webhooks/{id}/test`"
  return "The `output.event` node's `webhook` field"
}

/** The example envelope of one event type. */
function exampleOf(type) {
  const post = hooks[type]?.post
  const example = post?.requestBody?.content?.["application/json"]?.example
  if (!example) throw new Error(`x-webhooks.${type} has no request example`)
  return example
}

/** First paragraph of the entry's description, made safe for an MDX cell. */
function summaryOf(type) {
  const description = hooks[type]?.post?.description ?? ""
  return description
    .split("\n\n")[0]
    .replace(/\|/g, "\\|")
    .replace(/[{}]/g, (c) => `\\${c}`)
    .replace(/</g, "&lt;")
    .trim()
}

/** The heading slug fumadocs (github-slugger) gives "### `device.online`". */
function anchorOf(type) {
  return type.replace(/[^a-z0-9_-]+/gi, "").toLowerCase()
}

function json(value) {
  return ["```json", JSON.stringify(value, null, 2), "```"].join("\n")
}

function envelopeRegion() {
  return json(exampleOf(ENVELOPE_EXAMPLE))
}

function eventsRegion() {
  const deviceTypes = deviceRoutableTypes()
  const types = Object.keys(hooks)
  const lines = [
    "| Event | Routed by | Fires when |",
    "| --- | --- | --- |",
    ...types.map(
      (type) =>
        `| [\`${type}\`](#${anchorOf(type)}) | ${routingOf(type, deviceTypes)} | ${summaryOf(type)} |`
    ),
    "",
    "Each sample below is the `data` object of that event, exactly as the",
    "catalog (`GET /webhook-event-types`) serves it. The full body of every",
    "type, with the envelope, is in the",
    "[API reference](/api-reference/webhooks/events/device-online).",
  ]
  for (const type of types) {
    lines.push("", `### \`${type}\``, "", json(exampleOf(type).data))
  }
  return lines.join("\n")
}

const regions = { envelope: envelopeRegion(), events: eventsRegion() }

let page = await readFile(PAGE, "utf8")
for (const [name, body] of Object.entries(regions)) {
  const begin = new RegExp(`\\{/\\* BEGIN generated:${name}\\b[^]*?\\*/\\}\\n`)
  const end = `{/* END generated:${name} */}`
  const b = page.match(begin)
  const e = page.indexOf(end)
  if (!b || e === -1 || e < b.index) {
    console.error(`${PAGE}: region "${name}" markers not found`)
    process.exit(1)
  }
  const head = page.slice(0, b.index + b[0].length)
  page = `${head}\n${body}\n\n${page.slice(e)}`
}

const formatted = await prettier.format(page, {
  ...(await prettier.resolveConfig(PAGE)),
  filepath: PAGE,
})
await writeFile(PAGE, formatted)
console.log(
  `Wrote ${PAGE}: ${Object.keys(hooks).length} event types from x-webhooks ` +
    `(snapshot ${snapshot.info?.version ?? "unknown"})`
)
