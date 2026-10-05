import { OffersPage, commerceMetadata } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("offers", "id")
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OffersPage locale="id" id={(await params).id} /> }
