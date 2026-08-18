"use client"

import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Button from "@/components/ui/Button"

const contactLinks = [
  {
    label: "WhatsApp",
    value: "+62 851-5520-2123",
    href: "https://wa.me/6285155202123",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.535 4.122 1.558 5.916L.057 23.882a.5.5 0 0 0 .61.61l5.966-1.501A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.634-.485-5.19-1.405l-.372-.219-3.853.97.99-3.774-.24-.391A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: "Email",
    value: "adam.fikri13@gmail.com",
    href: "mailto:adam.fikri13@gmail.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    value: "Fikri Adam",
    href: "https://www.linkedin.com/in/fikri-adam/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    value: "@adamfiik",
    href: "https://www.instagram.com/adamfiik/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
]

export default function ContactSection() {
  return (
    <section
      id="kontak"
      className="py-24 lg:py-32 bg-[#151518] relative overflow-hidden"
      aria-label="Kontak"
    >
      {/* Red glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(214,35,47,0.12) 0%, transparent 60%)" }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — CTA */}
          <div>
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
                <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
                  Kontak
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Mari ubah tujuan pemasaran menjadi{" "}
                <span className="text-[#d6232f]">langkah yang bisa dijalankan.</span>
              </h2>
              <p className="text-[#a8a8ae] leading-relaxed mb-8 max-w-lg">
                Diskusikan kebutuhan Meta Ads, Google Ads, SEO, GA4/GTM, website,
                landing page, atau strategi pemasaran Anda.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15} className="flex flex-wrap gap-3">
              <Button
                href="https://wa.me/6285155202123"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="text-base px-7 py-3.5"
              >
                Diskusikan Proyek
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.535 4.122 1.558 5.916L.057 23.882a.5.5 0 0 0 .61.61l5.966-1.501A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.634-.485-5.19-1.405l-.372-.219-3.853.97.99-3.774-.24-.391A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </Button>
              <Button
                href="mailto:adam.fikri13@gmail.com"
                variant="secondary"
                className="text-base px-7 py-3.5"
              >
                Kirim Email
              </Button>
            </AnimatedSection>
          </div>

          {/* Right — Contact cards + avatar */}
          <div className="space-y-4">
            {/* Avatar card */}
            <AnimatedSection delay={0.1} direction="right">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#0b0b0d] border border-[#29292e]">
                <Image
                  src="/assets/avatar/avatar-circle-256.webp"
                  alt="Ilustrasi cartoon Fikri Adam"
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#29292e]"
                />
                <div>
                  <p className="font-semibold text-white" style={{ fontFamily: "var(--font-manrope)" }}>
                    Fikri Adam
                  </p>
                  <p className="text-sm text-[#a8a8ae]">Digital Marketing Specialist</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                    <span className="text-xs text-green-400">Tersedia untuk proyek baru</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Contact links */}
            {contactLinks.map((link, i) => (
              <AnimatedSection key={link.label} delay={0.15 + i * 0.08} direction="right">
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0b0b0d] border border-[#29292e] hover:border-[#d6232f]/40 transition-all duration-300"
                  aria-label={`${link.label}: ${link.value}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#202024] border border-[#29292e] flex items-center justify-center text-[#a8a8ae] group-hover:text-[#d6232f] group-hover:bg-[#d6232f]/10 group-hover:border-[#d6232f]/20 transition-all flex-shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#a8a8ae] mb-0.5">{link.label}</p>
                    <p className="text-sm font-medium text-white truncate">{link.value}</p>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-[#29292e] group-hover:text-[#d6232f] transition-colors flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
