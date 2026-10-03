import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { authLocale, authOrigin, verifiedUser } from "@/lib/auth/rules"
import { authPaths } from "@/data/auth-content"

export async function GET(request: NextRequest) {
  const locale = authLocale(request.nextUrl.searchParams.get("locale"))
  let destination: string = authPaths.login[locale] + "?notice=invalidLink"
  try {
    const origin = authOrigin(process.env)
    const code = request.nextUrl.searchParams.get("code")
    if (code && code.length <= 2048) {
      const client = await createClient()
      const exchanged = await client.auth.exchangeCodeForSession(code)
      const identity = await client.auth.getUser()
      if (!exchanged.error && !identity.error && verifiedUser(identity.data.user)) destination = authPaths.account[locale]
      else await client.auth.signOut({ scope: "local" })
    }
    const response = NextResponse.redirect(new URL(destination, origin), 303)
    response.headers.set("Cache-Control", "private, no-store")
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
    response.headers.set("Referrer-Policy", "no-referrer")
    return response
  } catch {
    return NextResponse.redirect(new URL(destination, request.url), 303)
  }
}
