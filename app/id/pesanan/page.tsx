import { OrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("orders", "id")
export default function Page() { return <OrdersPage locale="id" /> }
