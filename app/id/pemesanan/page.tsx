import { CheckoutPage, commerceMetadata, type CommerceSearch } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("checkout", "id")
export default function Page({ searchParams }: { searchParams: CommerceSearch }) { return <CheckoutPage locale="id" searchParams={searchParams} /> }
