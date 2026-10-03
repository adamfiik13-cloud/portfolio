import { AccountPage, authMetadata } from "@/components/auth/AuthPage"
export const dynamic = "force-dynamic"
export const metadata = authMetadata("account", "id")
export default function Page() { return <AccountPage locale="id" /> }
