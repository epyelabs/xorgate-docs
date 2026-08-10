import { apiBaseUrl, awsRegion } from "@/lib/shared"

/**
 * Build-time environment values, usable straight from MDX prose so no page
 * hardcodes an endpoint. Registered in `components/mdx.tsx`.
 *
 *   The dev API lives at <ApiBaseUrl />.
 */

export function ApiBaseUrl() {
  return <code>{apiBaseUrl}</code>
}

export function AwsRegion() {
  return <code>{awsRegion}</code>
}
