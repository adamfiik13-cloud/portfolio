import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import ServicesSection from "@/components/sections/ServicesSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import ExperienceSection from "@/components/sections/ExperienceSection"
import ProcessSection from "@/components/sections/ProcessSection"
import ContactSection from "@/components/sections/ContactSection"

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ExperienceSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
