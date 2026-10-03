import "server-only"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseConfig } from "./config"

// Called only by the Auth/account Proxy matcher. Public marketing is unaffected.
export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseConfig()
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookieOptions: { secure: process.env.APP_ENV !== "local", sameSite: "lax" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data, error } = await supabase.auth.getClaims()
  response.headers.set("Cache-Control", "private, no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  return { response, claims: error ? null : data?.claims ?? null }
}
