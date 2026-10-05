import { OwnerOffersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("owner", "id")
export default function Page() { return <OwnerOffersPage locale="id" /> }
