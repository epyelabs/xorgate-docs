import Link from "next/link"

const sections = [
  {
    href: "/docs/getting-started",
    title: "Getting started",
    body: "What xorgate is, the tenancy model, how auth works, and a quickstart that takes a device from unboxed to streaming telemetry.",
  },
  {
    href: "/docs/platform-concepts",
    title: "Platform concepts",
    body: "Devices and device models, io_capabilities, the telemetry model, media sessions and segments, live versus recorded planes.",
  },
  {
    href: "/docs/api-reference",
    title: "API reference",
    body: "Every REST endpoint of xorgate-core-service, with schemas, examples, and a browser playground.",
  },
  {
    href: "/docs/backend-sdk",
    title: "Backend SDK (JS)",
    body: "Server-to-server client for Node and edge runtimes: resources, pagination, errors.",
  },
  {
    href: "/docs/frontend-sdk",
    title: "Frontend SDK (React)",
    body: "Headless React hooks and players for live video, live telemetry, history, and replay.",
  },
  {
    href: "/docs/device-sdk",
    title: "Device SDK",
    body: "Installing and provisioning the device agent, the MQTT cloud contract, the CLI, and media pipelines.",
  },
]

export default function HomePage() {
  return (
    <main className="container mx-auto flex flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-3 text-3xl font-bold">
        Xorgate developer documentation
      </h1>
      <p className="mb-10 max-w-2xl text-fd-muted-foreground">
        Xorgate is the connective layer between rugged sensing hardware in the
        field and intelligent cloud workflows. These docs cover the REST API,
        the backend and frontend SDKs, and the device agent.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-fd-border bg-fd-card p-4 transition-colors hover:bg-fd-accent"
          >
            <h2 className="mb-1 font-semibold">{section.title}</h2>
            <p className="text-sm text-fd-muted-foreground">{section.body}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
