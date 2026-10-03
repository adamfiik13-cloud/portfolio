import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("confirm", "en")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="confirm" locale="en" searchParams={searchParams} /> }
