import "server-only"
import { createClient } from "@/lib/supabase/server"
import { authOrigin, verifiedUser } from "./rules"

export async function authContext() {
  try {
    authOrigin(process.env)
    const client = await createClient()
    const { data, error } = await client.auth.getUser()
    return { client, user: !error && verifiedUser(data.user) ? data.user : null, configured: true }
  } catch {
    return { client: null, user: null, configured: false }
  }
}
