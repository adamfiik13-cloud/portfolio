"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import AnimatedSection from "@/components/ui/AnimatedSection"

const steps = [
  {
    number: "01",
    title: "Memahami masalah",
    description:
      "Memetakan tujuan bisnis, target audiens, penawaran, channel yang tersedia, dan hambatan dalam perjalanan pelanggan.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v4l2 2"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Menyusun hipotesis",
    description:
      "Menentukan pesan, channel, creative, landing page, dan ukuran keberhasilan yang perlu diuji sebelum eksekusi penuh.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3h6"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><path d="M9 21h6"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Menjalankan dan mengukur",
    description:
      "Mengeksekusi strategi dengan setup campaign dan tracking yang sesuai, lalu memonitor respons pasar secara berkala.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Mempelajari dan mengoptimalkan",
    description:
      "Mengubah data menjadi insight, prioritas perbaikan, dan keputusan untuk eksperimen berikutnya. Tujuannya bukan sekadar angka — tetapi pembelajaran yang bisa dijalankan.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
      </svg>
    ),
  },
]

export default function ProcessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="proses"
      className="py-24 lg:py-32 bg-[#0b0b0d] relative overflow-hidden"
      aria-label="Cara Kerja"
    >
      {/* Subtle bg accent */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(ellipse, rgba(214,35,47,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
            <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
              Cara Kerja
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Pendekatan yang berbasis{" "}
            <span className="text-[#d6232f]">data dan keputusan</span>
          </h2>
          <p className="text-[#a8a8ae] leading-relaxed">
            Setiap kampanye dimulai dari pertanyaan yang tepat — bukan dari asumsi.
            Proses ini memastikan setiap langkah dapat dievaluasi dan dikembangkan.
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative"
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-7 left-full w-5 h-px bg-[#29292e] z-10"
                  aria-hidden="true"
                />
              )}

              <div className="p-6 rounded-2xl bg-[#151518] border border-[#29292e] h-full">
                {/* Number + Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#d6232f]/10 border border-[#d6232f]/20 flex items-center justify-center text-[#d6232f]">
                    {step.icon}
                  </div>
                  <span
                    className="text-3xl font-black text-[#29292e]"
                    style={{ fontFamily: "var(--font-manrope)" }}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                </div>

                <h3
                  className="font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-[#a8a8ae] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <AnimatedSection delay={0.3} className="mt-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-[#a8a8ae] leading-relaxed italic">
              &ldquo;Tujuan saya bukan hanya mendapatkan data, tetapi membantu bisnis mengetahui{" "}
              <span className="text-white not-italic font-medium">
                apa yang perlu dilakukan setelah melihat data tersebut.
              </span>&rdquo;
            </p>
          </div>
        </AnimatedSection>

        {/* Tools marquee */}
        <AnimatedSection delay={0.2} className="mt-16">
          <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-5 text-center">
            Tools yang digunakan
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-3 animate-marquee whitespace-nowrap">
              {[
                "Meta Ads Manager", "Google Ads", "Google Analytics 4", "Google Tag Manager",
                "Google Search Console", "Looker Studio", "Semrush", "Screaming Frog",
                "SEO Minion", "WordPress", "Canva", "Leadpages",
                // repeat for seamless loop
                "Meta Ads Manager", "Google Ads", "Google Analytics 4", "Google Tag Manager",
                "Google Search Console", "Looker Studio", "Semrush", "Screaming Frog",
                "SEO Minion", "WordPress", "Canva", "Leadpages",
              ].map((tool, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[#a8a8ae] bg-[#151518] border border-[#29292e] flex-shrink-0"
                >
                  <span className="w-1 h-1 rounded-full bg-[#d6232f]" aria-hidden="true" />
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
