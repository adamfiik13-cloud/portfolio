import { OrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("orders", "en")
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OrdersPage locale="en" id={(await params).id} /> }
