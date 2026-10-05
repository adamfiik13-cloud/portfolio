import { CheckoutPage, commerceMetadata, type CommerceSearch } from "@/components/commerce/CommercePages"
export const dynamic = "force-dynamic"
export const metadata = commerceMetadata("checkout", "en")
export default function Page({ searchParams }: { searchParams: CommerceSearch }) { return <CheckoutPage locale="en" searchParams={searchParams} /> }
