import { assertProjectIsolation } from '../lib/backend/environment.ts'
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing configuration')
  assertProjectIsolation(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env)
  console.log('Supabase target isolation: pass (values withheld)')
} catch {
  console.error('Supabase target isolation: failed. Check environment and distinct project refs; no values printed.')
  process.exit(1)
}
