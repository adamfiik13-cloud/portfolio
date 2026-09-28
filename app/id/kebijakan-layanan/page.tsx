import PolicyPage from "@/components/policies/PolicyPage"
import { getPolicyMetadata } from "@/lib/policy-metadata"

export const metadata = getPolicyMetadata("id", "service")
export default function Page() { return <PolicyPage locale="id" policyId="service" /> }
