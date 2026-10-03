import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("login", "en")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="login" locale="en" searchParams={searchParams} /> }
