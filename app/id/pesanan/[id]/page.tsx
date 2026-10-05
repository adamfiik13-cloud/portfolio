import { OrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("orders", "id")
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OrdersPage locale="id" id={(await params).id} /> }
