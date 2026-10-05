import { OrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("orders", "en")
export default function Page() { return <OrdersPage locale="en" /> }
