import { AuthPage, authMetadata, type AuthSearch } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("register", "id")
export default function Page({ searchParams }: { searchParams: AuthSearch }) { return <AuthPage kind="register" locale="id" searchParams={searchParams} /> }
