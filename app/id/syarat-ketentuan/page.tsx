import PolicyPage from "@/components/policies/PolicyPage"
import { getPolicyMetadata } from "@/lib/policy-metadata"

export const metadata = getPolicyMetadata("id", "terms")
export default function Page() { return <PolicyPage locale="id" policyId="terms" /> }
