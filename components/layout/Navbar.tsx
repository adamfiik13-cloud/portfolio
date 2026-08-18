"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Button from "@/components/ui/Button"

const navLinks = [
  { label: "About", href: "#tentang" },
  { label: "Expertise", href: "#layanan" },
  { label: "Work", href: "#studi-kasus" },
  { label: "Experience", href: "#pengalaman" },
  { label: "Contact", href: "#kontak" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
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
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="group flex items-center gap-3"
            aria-label="Fikri Adam — Back to top"
          >
            <span className="relative block w-9 h-9 overflow-hidden rounded-full border border-white/15 group-hover:border-[#d6232f] transition-colors">
              <Image
                src="/assets/avatar/avatar-circle-64.png"
                alt="Fikri Adam"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </span>
            <span className="hidden sm:block text-sm font-semibold text-white">Fikri Adam</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm text-[#a8a8ae] hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              href="https://wa.me/6285155202123"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="text-sm px-5 py-2.5"
            >
              Start a Conversation
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-[#a8a8ae] hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
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
            className="fixed inset-0 z-30 bg-[#0b0b0d]/98 backdrop-blur-md flex flex-col pt-20 px-6 pb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1 flex-1" aria-label="Mobile navigation">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-4 py-4 text-lg font-medium text-[#a8a8ae] hover:text-white transition-colors border-b border-[#29292e] cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <div className="mt-8 space-y-3">
              <Button
                href="https://wa.me/6285155202123"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full justify-center"
              >
                Start a Conversation
              </Button>
              <Button
                href="#studi-kasus"
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleNavClick("#studi-kasus")}              >
                View Selected Work
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
