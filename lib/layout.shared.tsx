import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { appName, gitConfig } from "./shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // Text mark only, no logo work yet (Phase 1 branding is deliberately minimal).
      title: appName,
    },
    // Omitted while the repo is private/unpushed, see `gitConfig`.
    githubUrl: gitConfig
      ? `https://github.com/${gitConfig.user}/${gitConfig.repo}`
      : undefined,
  }
}
