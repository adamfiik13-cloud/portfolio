import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import { messages } from "@/data/home-content"
import type { PublicLocale } from "@/data/public-content"

export default function ServiceShell({ locale, paths, children }: { locale: PublicLocale; paths: Record<PublicLocale, string>; children: React.ReactNode }) {
  return <PublicLocaleProvider locale={locale} paths={paths}>
    <a href="#main-content" className="skip-link">{messages["nav.skip"][locale]}</a>
    <Navbar />
    <main id="main-content" tabIndex={-1} className="public-container pt-32 pb-24">{children}</main>
    <Footer />
  </PublicLocaleProvider>
}
