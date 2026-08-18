"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import AnimatedSection from "@/components/ui/AnimatedSection"
import services from "@/data/services.json"

const serviceIcons: Record<string, React.ReactNode> = {
  "meta-ads": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14H9V10h2v6zm0-8H9V6h2v2zm4 8h-2v-4h2v4zm0-6h-2v-2h2v2z"/>
    </svg>
  ),
  "google-ads": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
    </svg>
  ),
  "seo": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      <path d="M11 8v6M8 11h6"/>
    </svg>
  ),
  "analytics": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  "website": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  ),
  "consultation": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

export default function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="layanan"
      className="py-24 lg:py-32 bg-[#151518] relative overflow-hidden"
      aria-label="Expertise"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
            <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
              Expertise
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Connected thinking.{" "}
            <span className="text-[#d6232f]">Focused execution.</span>
          </h2>
          <p className="text-[#a8a8ae] leading-relaxed">
            The right channels, aligned around one business goal.
          </p>
        </AnimatedSection>

        {/* Services grid */}
        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="group relative p-6 rounded-2xl bg-[#0b0b0d] border border-[#29292e] hover:border-[#d6232f]/40 transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse at top left, rgba(214,35,47,0.06) 0%, transparent 60%)" }}
                aria-hidden="true"
              />

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#202024] border border-[#29292e] flex items-center justify-center text-[#d6232f] mb-4 group-hover:bg-[#d6232f]/10 transition-colors">
                {serviceIcons[service.id]}
              </div>

              {/* Title */}
              <h3
                className="font-semibold text-white mb-2 text-base"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#a8a8ae] leading-relaxed">
                {service.description}
              </p>

              {/* Connector line bottom */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#d6232f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
