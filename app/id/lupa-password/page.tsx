import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("forgot", "id")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="forgot" locale="id" searchParams={searchParams} /> }
