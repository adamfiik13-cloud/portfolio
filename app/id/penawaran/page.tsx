import { OffersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("offers", "id")
export default function Page() { return <OffersPage locale="id" /> }
