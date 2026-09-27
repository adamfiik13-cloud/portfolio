import ServiceCatalog from "@/components/services/ServiceCatalog"
import { getServiceMetadata } from "@/lib/service-metadata"
export const metadata = getServiceMetadata("id")
export default function Page() { return <ServiceCatalog locale="id" /> }
