"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BrandSignature from "@/components/ui/BrandSignature"
import Button from "@/components/ui/Button"
import LanguageSwitcher from "./LanguageSwitcher"
import { usePublicLocale } from "./PublicLocaleProvider"
import HeaderAccountLink from "./HeaderAccountLink"


export default function Navbar() {
  const { siteConfig, t, locale, isHome, homePath } = usePublicLocale()
  const navLinks = siteConfig.navigation.map(link => ({ ...link, href: link.href === "#layanan" ? (locale === "en" ? "/services" : "/id/layanan") : isHome ? link.href : homePath + link.href }))
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      window.history.replaceState(null, "", href)
      el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b0b0d]/90 backdrop-blur-md border-b border-[#29292e]"
            : "bg-transparent"
        }`}
      >
        <div className="public-container h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="min-w-0 max-[400px]:[&_a]:gap-1.5 max-[400px]:[&_img]:w-7 max-[400px]:[&_img]:h-7 max-[400px]:[&_span]:text-sm"><BrandSignature /></div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label={t("nav.main")}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={event => { setMenuOpen(false); if (link.href.startsWith("#")) { event.preventDefault(); handleNavClick(link.href) } }}
                className="min-h-11 px-4 py-2 text-sm text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Button
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="text-sm px-5 py-2.5"
            >
              {siteConfig.primaryCta}
            </Button>
          </div>

          <div className="flex shrink-0 items-center"><HeaderAccountLink locale={locale} onNavigate={() => setMenuOpen(false)} /><LanguageSwitcher /></div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden w-11 h-11 shrink-0 flex items-center justify-center text-muted hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t("nav.close") : t("nav.open")}
            aria-expanded={menuOpen}
          >
            <div className="w-5 space-y-1.5">
              <motion.span
                className="block h-0.5 bg-current rounded"
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 bg-current rounded"
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 bg-current rounded"
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-[#0b0b0d]/98 backdrop-blur-md flex flex-col overflow-y-auto pt-20 px-6 pb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1 flex-1 shrink-0" aria-label={t("nav.mobile")}>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={event => { setMenuOpen(false); if (link.href.startsWith("#")) { event.preventDefault(); handleNavClick(link.href) } }}
                  className="text-left px-4 py-4 text-lg font-brand-body text-muted hover:text-white transition-colors border-b border-[#29292e] cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="mt-8 space-y-3">
              <HeaderAccountLink locale={locale} expanded onNavigate={() => setMenuOpen(false)} />
              <Button
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full justify-center"
              >
                {siteConfig.primaryCta}
              </Button>
              <Button
                href={isHome ? "#studi-kasus" : homePath + "#studi-kasus"}
                variant="secondary"
                className="w-full justify-center"
                onClick={event => { if (isHome) { event?.preventDefault(); handleNavClick("#studi-kasus") } }}              >
                {siteConfig.secondaryCta}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
