import { OwnerOffersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("owner", "en")
export default function Page() { return <OwnerOffersPage locale="en" /> }
