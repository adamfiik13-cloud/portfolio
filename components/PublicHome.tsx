"use client"

import { PublicLocaleProvider, usePublicLocale } from "@/components/layout/PublicLocaleProvider"
import type { PublicLocale } from "@/data/public-content"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import ServicesSection from "@/components/sections/ServicesSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import ExperienceSection from "@/components/sections/ExperienceSection"
import ProcessSection from "@/components/sections/ProcessSection"
import ContactSection from "@/components/sections/ContactSection"

function HomeSections() {
  const { t } = usePublicLocale()
  return (
    <>
      <a href="#main-content" className="skip-link">{t("nav.skip")}</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <ProcessSection />
        <AboutSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

export default function PublicHome({ locale }: { locale: PublicLocale }) {
  return <PublicLocaleProvider locale={locale}><HomeSections /></PublicLocaleProvider>
}
