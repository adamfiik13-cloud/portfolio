import { readFile } from "node:fs/promises"
import path from "node:path"

export const dynamic = "force-dynamic"

const fonts = new Set([
  "LeagueSpartan-Variable.woff2",
  "Alata-Regular.woff2",
  "SourceSans3-Variable.woff2",
  "SourceSans3-Italic-Variable.woff2",
])

// Review-only surface: available locally and in Vercel Preview, never Production.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset?: string[] }> },
) {
  if (process.env.VERCEL && process.env.VERCEL_ENV !== "preview") {
    return new Response("Not found", { status: 404 })
  }
  const { asset = [] } = await params
  const headers = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" }
  if (asset.length === 0) {
    const html = await readFile(path.join(process.cwd(), "docs/typography-checkpoint.html"), "utf8")
    return new Response(html.replaceAll("/app/fonts/", "/typography-checkpoint/fonts/"), {
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    })
  }
  if (asset.length === 2 && asset[0] === "fonts" && fonts.has(asset[1])) {
    const font = await readFile(path.join(process.cwd(), "app/fonts", asset[1]))
    return new Response(font, { headers: { ...headers, "Content-Type": "font/woff2" } })
  }
  return new Response("Not found", { status: 404, headers })
}
