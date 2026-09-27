import ServiceCatalog from "@/components/services/ServiceCatalog"
import { getServiceMetadata } from "@/lib/service-metadata"
export const metadata = getServiceMetadata("en")
export default function Page() { return <ServiceCatalog locale="en" /> }
