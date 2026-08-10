import { openapi } from "@/lib/openapi"
import { sliceDocument } from "@/lib/openapi-slice"
import { OpenAPIPageClient } from "./openapi-page.client"
import type { ComponentProps } from "react"

type ClientProps = ComponentProps<typeof OpenAPIPageClient>
type Props = Omit<ClientProps, "payload" | "preloaded"> & {
  /** Schema id, as written by the generator into each page. */
  document: string
}

/**
 * What the generated MDX pages render. They call `<OpenAPIPage document="..."
 * operations={[...]} />`, and this resolves that schema id to the parsed
 * document before handing it to the client UI.
 *
 * Server component, so the resolution happens at build time. Nothing here runs
 * in the browser except the UI itself, which is why the document is sliced down
 * to the page's own operations first (see `lib/openapi-slice.ts`).
 */
export async function OpenAPIPage({ document, ...props }: Props) {
  const { bundled } = await openapi.getSchema(document)
  const sliced = sliceDocument(
    bundled as unknown as Record<string, unknown>,
    props.operations ?? []
  )

  return (
    <OpenAPIPageClient
      {...props}
      payload={{ bundled: sliced as typeof bundled }}
    />
  )
}
