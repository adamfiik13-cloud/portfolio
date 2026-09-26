// Local-only specimen server. Does not expose other repository files or mutate data.
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const files = new Map([
  ["/", ["../docs/typography-checkpoint.html", "text/html; charset=utf-8"]],
  ...["LeagueSpartan-Variable.woff2", "Alata-Regular.woff2", "SourceSans3-Variable.woff2", "SourceSans3-Italic-Variable.woff2"].map((name) => [`/app/fonts/${name}`, [`../app/fonts/${name}`, "font/woff2"]]),
])
createServer(async (request, response) => {
  const entry = files.get(new URL(request.url, "http://127.0.0.1").pathname)
  if (!entry || !["GET", "HEAD"].includes(request.method)) {
    response.writeHead(404).end("Not found")
    return
  }
  try {
    const data = await readFile(fileURLToPath(new URL(entry[0], import.meta.url)))
    response.writeHead(200, { "Content-Type": entry[1], "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" })
    response.end(request.method === "HEAD" ? undefined : data)
  } catch {
    response.writeHead(500).end("Specimen asset unavailable")
  }
}).listen(4174, "127.0.0.1", () => console.log("Typography specimen: http://127.0.0.1:4174"))
