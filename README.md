# xorgate-docs

The xorgate developer documentation site (`docs.xorgate.io`). A **Next.js App
Router + [Fumadocs](https://fumadocs.dev)** project, built as a **static export**
and served from S3 behind CloudFront.

Standalone project: it does not import from, or build with, `xorgate-web`.

## Develop

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into out/
npm run start        # serve out/ locally, the closest thing to production
npm run lint
npm run typecheck
npm run format
```

Copy `.env.example` to `.env.local` if you want to point the site at a different
API. Without it, the dev values in `lib/shared.ts` apply.

## Layout

| Path | What it is |
| --- | --- |
| `content/docs/**` | The documentation itself, MDX plus `meta.json` sidebar ordering |
| `content/docs/meta.json` | Top-level section order, and the reserved Workflows/AI slot |
| `lib/source.ts` | Content source adapter (Fumadocs `loader()`) |
| `lib/shared.ts` | Site name, routes, and all build-time environment values |
| `lib/layout.shared.tsx` | Shared layout options (nav title, GitHub link) |
| `lib/openapi.ts` | Stub. Where the OpenAPI reference generator gets wired up |
| `app/(home)` | Landing page |
| `app/docs` | Docs layout and pages |
| `app/api/search/route.ts` | Emits the static Orama search index at build time |
| `scripts/refresh-openapi.mjs` | Refreshes the checked-in OpenAPI snapshot |

## Sections

The sidebar order lives in `content/docs/meta.json`. Six sections:
Getting started, Platform concepts, API reference, Backend SDK (JS), Frontend SDK
(React), Device SDK. A seventh, Workflows/AI, is reserved in that file as a
comment and deliberately unwritten.

Only Getting started carries real prose today. The other five are placeholders
with a "what lives here" paragraph, filled in by later phases of the
[SDK and API plan](../../plans/xorgate-sdk-and-api/README.md).

## Static export, and what it costs

`next.config.mjs` sets `output: 'export'`, so there is no Node server anywhere in
the serving path. Consequences worth knowing before adding a feature:

- **`trailingSlash: true`.** Every page is emitted as `path/index.html`, which is
  what an S3 website endpoint resolves. If the distribution ever drops the
  trailing slash instead, pair this with a CloudFront Function that rewrites
  `/path` to `/path/index.html`.
- **`images.unoptimized: true`.** There is no image optimizer. `next/image` works,
  it just passes the source through.
- **Search is client-side.** The Orama index is generated at build time into
  `out/api/search` and downloaded by the browser. No search server, and no
  incremental index: **new content only appears in search after a rebuild.**
- **No API routes, no server actions, no `fumadocs-openapi` `createProxy`.** The
  API reference playground calls the API straight from the browser, which is why
  the docs origin has to be in the core-service CORS allowlist
  (`backend/xorgate-core-service/lib/stacks/api-stack.ts`). If a server feature
  ever becomes genuinely necessary, the fallback is OpenNext on Lambda plus
  CloudFront.
- **Content is baked in.** Refreshing the OpenAPI snapshot, or editing any page,
  requires a rebuild and a re-sync. Nothing updates in place.

## OpenAPI snapshot

```sh
npm run refresh-openapi     # curls ${NEXT_PUBLIC_API_BASE_URL}/openapi.json into openapi/xorgate.json
```

The snapshot is checked in so builds are reproducible and work offline. Refresh
it, review the diff, and commit. Reference pages are not generated from it yet:
see `lib/openapi.ts` for what wiring that up involves.

## Deploy

Two GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Bucket | Environment |
| --- | --- | --- | --- |
| `deploy-dev.yml` | push to `main`, or manual | `docs-dev.xorgate.io` | `development` |
| `deploy-prod.yml` | release published, or manual with a tag | `docs.xorgate.io` | `production` |

Both build the export and sync `out/` to their bucket. Set a `DOCS_BUCKET`
environment variable only to override the default baked into each workflow.

The CloudFront distributions and DNS are managed outside this repo, and
**invalidation is manual**: a deploy puts new objects in the bucket, but the
distribution keeps serving the old ones until you invalidate it. Nothing in
these workflows touches CloudFront, so the machine user needs no CloudFront
permissions. Setup (secrets, environment variables, and the IAM policy) is
documented in `deploy-prod.yml`'s header.

Cache strategy: only `_next/static/**` is content-hashed and cached forever.
Every HTML page, `llms.txt`, the OG images and the search index are unhashed and
sync with `no-cache`.

### Backend dependency

The API-reference playground calls the API directly from the browser, so the
docs origins live in the core-service CORS allowlist
(`backend/xorgate-core-service/lib/stacks/api-stack.ts`). Both
`docs.xorgate.io` and `docs-dev.xorgate.io`, their S3 website endpoints, and
`http://localhost:3000` are already there. **The change takes effect on the next
core-service deploy.** Add the CloudFront distribution domains too if the site
is reached that way before DNS points at it.
