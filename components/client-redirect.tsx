"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Replaces the current history entry once React is up (see app/docs). */
export function ClientRedirect({ href }: { href: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(href)
  }, [router, href])
  return null
}
