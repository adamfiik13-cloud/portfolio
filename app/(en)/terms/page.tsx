import PolicyPage from "@/components/policies/PolicyPage"
import { getPolicyMetadata } from "@/lib/policy-metadata"

export const metadata = getPolicyMetadata("en", "terms")
export default function Page() { return <PolicyPage locale="en" policyId="terms" /> }
