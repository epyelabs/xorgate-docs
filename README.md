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

| Path                           | What it is                                                                |
| ------------------------------ | ------------------------------------------------------------------------- |
| `content/docs/**`              | The documentation itself, MDX plus `meta.json` sidebar ordering           |
| `content/docs/meta.json`       | Top-level section order, and the reserved Workflows/AI slot               |
| `lib/source.ts`                | Content source adapter (Fumadocs `loader()`)                              |
| `lib/shared.ts`                | Site name, routes, and all build-time environment values                  |
| `lib/layout.shared.tsx`        | Shared layout options (nav title, GitHub link)                            |
| `lib/openapi.ts`               | OpenAPI server instance, document paths, and the schema id                |
| `lib/openapi-slice.ts`         | Trims the document to one page's operations before it ships to the client |
| `components/openapi-page.tsx`  | Server wrapper the generated reference pages render                       |
| `app/(docs)`                   | Docs layout and pages, served at the site root (`/`, `/getting-started`)  |
| `app/docs`                     | Legacy `/docs/**` URLs, each emitted as a forwarder to its new root path  |
| `app/api/search/route.ts`      | Emits the static Orama search index at build time                         |
| `scripts/refresh-openapi.mjs`  | Refreshes the checked-in OpenAPI snapshot                                 |
| `scripts/generate-openapi.mjs` | Derives the public document and generates the reference pages             |

## Sections

The sidebar order lives in `content/docs/meta.json`. Six sections:
Getting started, Platform concepts, API reference, Backend SDK (JS), Frontend SDK
(React), Device SDK. A seventh, Workflows/AI, is reserved in that file as a
comment and deliberately unwritten.

Getting started and API reference carry real prose today. The other four are
placeholders with a "what lives here" paragraph, filled in by later phases of the
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

## API reference generation

Two documents and one generator:

```sh
npm run refresh-openapi     # curls ${NEXT_PUBLIC_API_BASE_URL}/openapi.json into openapi/xorgate.json
npm run refresh-openapi -- ../../backend/xorgate-core-service/openapi.json   # ...or from a local file
npm run generate-openapi    # derives openapi/xorgate.public.json + writes content/docs/api-reference/**
```

`openapi/xorgate.json` is the truthful snapshot of the served document,
internal routes and all. It is checked in so builds are reproducible and work
offline. Refresh it, review the diff, and commit.

`openapi/xorgate.public.json` is derived from it at generation time: operations
flagged `x-internal` are dropped (the device installer's private routes) and
`servers` is pointed at `NEXT_PUBLIC_API_BASE_URL`. It is a build artifact and
gitignored.

`generate-openapi` runs automatically before `dev` and `build`, so the pages can
never be generated from a document the site is not serving. It writes one MDX
page per operation into a folder per tag, plus the `meta.json` sidebar files. It
only writes, never deletes:

- The hand-written `index.mdx` overview in each tag folder survives, and the
  generator splices it back to the top of each `meta.json`.
- Renaming or removing an operation leaves its old page behind. Delete it by
  hand.

The spec itself lives in the backend, at
`backend/xorgate-core-service/src/openapi/`, one module per resource. Change it
there, run `npm run openapi:emit` in that project, refresh the snapshot here,
and regenerate. A test in the backend fails if a route in the CDK route table
has no entry in the document.

Generated pages are ignored by Prettier (`.prettierignore`); the hand-written
overviews are not.

## Deploy

Two GitHub Actions workflows in `.github/workflows/`:

| Workflow          | Trigger                                 | Bucket                | Environment   |
| ----------------- | --------------------------------------- | --------------------- | ------------- |
| `deploy-dev.yml`  | push to `main`, or manual               | `docs-dev.xorgate.io` | `development` |
| `deploy-prod.yml` | release published, or manual with a tag | `docs.xorgate.io`     | `production`  |

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
