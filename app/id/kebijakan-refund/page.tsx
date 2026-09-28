import PolicyPage from "@/components/policies/PolicyPage"
import { getPolicyMetadata } from "@/lib/policy-metadata"

export const metadata = getPolicyMetadata("id", "refund")
export default function Page() { return <PolicyPage locale="id" policyId="refund" /> }
