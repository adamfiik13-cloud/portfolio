import { OwnerOrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("ownerOrders", "id")
export default function Page() { return <OwnerOrdersPage locale="id" /> }
