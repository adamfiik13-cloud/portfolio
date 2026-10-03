import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("reset", "en")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="reset" locale="en" searchParams={searchParams} /> }
