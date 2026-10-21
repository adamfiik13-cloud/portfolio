import { OwnerOrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("ownerOrders", "en")
export default function Page() { return <OwnerOrdersPage locale="en" /> }
