import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { source } from "@/lib/source"
import { ClientRedirect } from "@/components/client-redirect"

// Legacy URLs. The docs used to live under `/docs/**`; they are the site root
// now. This is a static export, so there is no server redirect: each old path
// is emitted as a page that forwards to the new one (meta refresh fires before
// hydration, the client component fixes the history entry, and the link is the
// no-JS fallback). Delete this route once nothing links to `/docs/` any more.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default async function LegacyDocsPage(
  props: PageProps<"/docs/[[...slug]]">
) {
  const { slug } = await props.params
  const page = source.getPage(slug)
  if (!page) notFound()

  const target = page.url.replace(/\/?$/, "/")
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <ClientRedirect href={target} />
      <p className="text-sm text-fd-muted-foreground">
        This page moved to{" "}
        <Link href={target} className="text-fd-primary underline">
          {target}
        </Link>
        .
      </p>
    </main>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}
