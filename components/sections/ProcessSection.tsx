"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import AnimatedSection from "@/components/ui/AnimatedSection"

const steps = [
  {
    title: "Frame",
    description: "Define the business question, audience, and constraint.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v4l2 2"/>
      </svg>
    ),
  },
  {
    title: "Hypothesise",
    description: "Choose the message, channel, and signal worth testing.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3h6"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><path d="M9 21h6"/>
      </svg>
    ),
  },
  {
    title: "Test",
    description: "Run a focused experiment with reliable measurement.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: "Decide",
    description: "Turn the signal into the next practical move.",
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
      aria-label="Approach"
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
              Approach
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Think clearly.{" "}
            <span className="text-[#d6232f]">Move deliberately.</span>
          </h2>
          <p className="text-[#a8a8ae] leading-relaxed">
            Every useful campaign starts with a better question.
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative"
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-12 left-full w-5 h-px bg-[#29292e] z-10"
                  aria-hidden="true"
                />
              )}

              <div className="p-7 lg:p-8 rounded-2xl bg-[#151518] border border-[#29292e] h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#d6232f]/10 border border-[#d6232f]/20 flex items-center justify-center text-[#ff4b55] [&_svg]:w-6 [&_svg]:h-6">
                    {step.icon}
                  </div>
                </div>

                <h3
                  className="font-bold text-white text-xl mb-3"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-[#a8a8ae] leading-relaxed max-w-[22ch]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <AnimatedSection delay={0.3} className="mt-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-[#a8a8ae] leading-relaxed italic">
              &ldquo;Data matters when it reveals{" "}
              <span className="text-white not-italic font-medium">
                what to do next.
              </span>&rdquo;
            </p>
          </div>
        </AnimatedSection>

        {/* Tools marquee */}
        <AnimatedSection delay={0.2} className="mt-16">
          <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-5 text-center">
            Tools in practice
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
