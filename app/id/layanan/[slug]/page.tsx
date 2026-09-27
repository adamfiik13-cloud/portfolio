import { notFound } from "next/navigation"
import ServiceDetail from "@/components/services/ServiceDetail"
import { catalogServices, findService } from "@/data/service-catalog"
import { getServiceMetadata } from "@/lib/service-metadata"

export const dynamicParams = false
export function generateStaticParams() { return catalogServices.map(service => ({ slug: service.slugs.id })) }
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const service = findService("id", (await params).slug)
  if (!service) notFound()
  return getServiceMetadata("id", service)
}
export default async function Page({ params }: Props) {
  const service = findService("id", (await params).slug)
  if (!service) notFound()
  return <ServiceDetail locale="id" service={service} />
}
