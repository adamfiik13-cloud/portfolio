import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/session"
import { authOrigin } from "@/lib/auth/rules"

// Scope session refresh to Auth/account only; public marketing remains static.
export async function proxy(request: NextRequest) {
  let response: NextResponse
  try { authOrigin(process.env); response = (await updateSession(request)).response } catch { response = NextResponse.next({ request }) }
  response.headers.set("Cache-Control", "private, no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}
export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/reset-password", "/account", "/auth/:path*", "/id/masuk", "/id/daftar", "/id/lupa-password", "/id/atur-ulang-password", "/id/akun", "/id/auth/:path*"],
}
