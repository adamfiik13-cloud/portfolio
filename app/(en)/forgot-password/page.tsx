import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("forgot", "en")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="forgot" locale="en" searchParams={searchParams} /> }
