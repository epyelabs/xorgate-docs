import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { Provider } from "@/components/provider"
import { appName, siteUrl } from "@/lib/shared"
import "./global.css"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  // Absolute base for the generated OG images (`app/og/docs/**`).
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s | ${appName}` },
  description:
    "Developer documentation for xorgate, the Physical AI and Edge IoT platform: REST API, backend and frontend SDKs, and the device agent.",
}

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
