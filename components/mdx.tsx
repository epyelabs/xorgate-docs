import defaultMdxComponents from "fumadocs-ui/mdx"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"
import type { MDXComponents } from "mdx/types"
import { ApiBaseUrl, AwsRegion } from "@/components/env"

/**
 * Components every MDX page can use without importing. `defaultMdxComponents`
 * already covers Callout, Card/Cards, and code blocks; the rest are registered
 * here so pages stay import-free.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    ApiBaseUrl,
    AwsRegion,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
