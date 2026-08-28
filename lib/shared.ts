export const appName = "Xorgate Docs"
export const docsRoute = "/"
export const docsImageRoute = "/og/docs"
export const docsContentRoute = "/llms.mdx/docs"

/**
 * Build-time configuration. Every value here is injected from the environment
 * so the same source builds against dev and prod (GitHub Environment
 * variables drive `.env`, see `.github/workflows/deploy-*.yml`). The fallbacks
 * are the current dev values so `npm run dev` works with no `.env` at all.
 */

/** Public origin this site is served from. Only used for absolute OG URLs. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.xorgate.io"

/**
 * xorgate-core-service base URL. Used by prose examples today and, from
 * Phase 2 on, as the target of the OpenAPI reference's "try it" playground.
 * That playground calls the API straight from the browser, so this origin has
 * to be in the core-service CORS allowlist (`lib/stacks/api-stack.ts`).
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-dev.xorgate.io"

/** AWS region the platform runs in. Used in examples (IoT/KVS endpoints). */
export const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1"

/**
 * GitHub repository backing this site. Drives the nav GitHub icon and the
 * per-page "Edit on GitHub" link.
 *
 * The repo is PRIVATE today, so those links 404 for anyone who is not a member
 * of the org. Set this back to `null` (which hides both links) if the docs site
 * goes public before the repo does.
 */
export const gitConfig: { user: string; repo: string; branch: string } | null =
  {
    user: "epyelabs",
    repo: "xorgate-docs",
    branch: "main",
  }
