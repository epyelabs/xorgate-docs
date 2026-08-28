import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { XorgateWordmark } from "@/components/xorgate-logo"
import { docsRoute, gitConfig } from "./shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // Same wordmark as the landing site, drawn in the brand orange, with a
      // small "Docs" tag so it reads as the developer site, not the homepage.
      title: (
        <span className="flex items-center gap-2">
          <XorgateWordmark className="h-5 w-auto text-brand" />
          <span className="rounded-md border border-fd-border bg-fd-secondary px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-fd-secondary-foreground uppercase">
            Docs
          </span>
        </span>
      ),
      url: docsRoute,
    },
    // Omitted while the repo is private/unpushed, see `gitConfig`.
    githubUrl: gitConfig
      ? `https://github.com/${gitConfig.user}/${gitConfig.repo}`
      : undefined,
  }
}
