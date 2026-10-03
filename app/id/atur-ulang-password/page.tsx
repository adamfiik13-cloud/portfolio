import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("reset", "id")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="reset" locale="id" searchParams={searchParams} /> }
