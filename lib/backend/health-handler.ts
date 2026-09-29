import { timingSafeEqual } from "node:crypto"

interface HealthDependencies {
  secret: string | undefined
  check: () => Promise<boolean>
  reportFailure: () => Promise<void>
}

export async function handleHealth(request: Request, dependencies: HealthDependencies) {
  const respond = (status: number, ok: boolean) => Response.json({ ok }, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } })
  if (!dependencies.secret || dependencies.secret.length < 32) return respond(503, false)
  const actual = Buffer.from(request.headers.get("authorization") ?? "")
  const expected = Buffer.from("Bearer " + dependencies.secret)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return respond(401, false)
  try {
    if (await dependencies.check()) return respond(200, true)
  } catch { /* Never return/log provider details, URLs, keys, or request headers. */ }
  try { await dependencies.reportFailure() } catch { /* Monitoring must not alter failure handling. */ }
  return respond(503, false)
}
