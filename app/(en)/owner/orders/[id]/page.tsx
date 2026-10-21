import { OwnerOrdersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("ownerOrders", "en")
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OwnerOrdersPage locale="en" id={(await params).id} /> }
