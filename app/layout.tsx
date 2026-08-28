import { Figtree } from "next/font/google"
import type { Metadata } from "next"
import { Provider } from "@/components/provider"
import { appName, siteUrl } from "@/lib/shared"
import "./global.css"

// Same typeface as the landing site (xorgate-landing/app/layout.tsx), exposed
// as --font-sans and picked up by global.css. Self-hosted at build time.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  // Absolute base for the generated OG images (`app/og/docs/**`).
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s | ${appName}` },
  description:
    "Developer documentation for xorgate, the Physical AI and Edge IoT platform: REST API, backend and frontend SDKs, and the device agent.",
}

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
