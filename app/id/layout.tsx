import SiteDocument from "@/components/layout/SiteDocument"
import { getPublicMetadata } from "@/lib/public-metadata"

export const metadata = getPublicMetadata("id")

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="id">{children}</SiteDocument>
}
