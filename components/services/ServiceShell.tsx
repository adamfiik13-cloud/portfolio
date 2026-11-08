import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ServiceLocaleProvider from "./ServiceLocaleProvider"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import { messages } from "@/data/home-content"
import type { PublicLocale } from "@/data/public-content"
import "./services.css"

export default function ServiceShell({ locale, paths, children, preserveIntent = false, light = false }: { locale: PublicLocale; paths: Record<PublicLocale, string>; children: React.ReactNode; preserveIntent?: boolean; light?: boolean }) {
  const content = <>
    <a href="#main-content" className="skip-link">{messages["nav.skip"][locale]}</a>
    <Navbar />
    <main id="main-content" tabIndex={-1} className="public-container pt-32 pb-24">{children}</main>
    <Footer />
  </>
  return light ? <ServiceLocaleProvider locale={locale} paths={paths} preserveIntent={preserveIntent}><div className="services-theme">{content}</div></ServiceLocaleProvider> : <PublicLocaleProvider locale={locale} paths={paths}>{content}</PublicLocaleProvider>
}
