"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Button from "@/components/ui/Button"
import CounterNumber from "@/components/ui/CounterNumber"
import siteConfig from "@/data/site-config.json"

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0b0b0d]"
      aria-label="Hero"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <Image
          src="/assets/backgrounds/hero-grid.svg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          aria-hidden="true"
        />
      </div>

      {/* Red glow top-left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(214,35,47,0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full pt-24 pb-16 lg:pt-0 lg:pb-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-screen lg:min-h-0 lg:py-32">

          {/* Left — Text */}
          <div className="order-2 lg:order-1">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
              <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
                {siteConfig.role}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {siteConfig.headline.split(". ").map((part, i, arr) => (
                <span key={i}>
                  {i === 1 ? (
                    <span className="text-[#d6232f]">{part}</span>
                  ) : (
                    part
                  )}
                  {i < arr.length - 1 ? ". " : "."}
                </span>
              ))}
            </motion.h1>

            {/* Summary */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base sm:text-lg text-[#a8a8ae] leading-relaxed max-w-xl mb-8"
            >
              {siteConfig.summary}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Button
                href="https://wa.me/6285155202123"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
              >
                Diskusikan Proyek
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.535 4.122 1.558 5.916L.057 23.882a.5.5 0 0 0 .61.61l5.966-1.501A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.634-.485-5.19-1.405l-.372-.219-3.853.97.99-3.774-.24-.391A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </Button>
              <Button
                href="#studi-kasus"
                variant="secondary"
              onClick={(e) => {
                  e?.preventDefault()
                  document.querySelector("#studi-kasus")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Lihat Studi Kasus
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {siteConfig.stats.map((stat, i) => (
                <div key={i} className="group">
                  <div
                    className="text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    <CounterNumber value={stat.value} />
                  </div>
                  <div className="text-xs text-[#a8a8ae] leading-tight">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Avatar */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <div className="relative w-72 sm:w-80 lg:w-96 xl:w-[440px]">
              {/* Glow behind avatar */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(214,35,47,0.15) 0%, transparent 70%)",
                  transform: "scale(1.1)",
                }}
                aria-hidden="true"
              />
              <Image
                src="/assets/avatar/avatar-hero-768.webp"
                alt="Ilustrasi cartoon Fikri Adam, Digital Marketing Specialist"
                width={440}
                height={660}
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                priority
                quality={90}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-hidden="true"
      >
        <span className="text-xs text-[#a8a8ae] tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-0.5 h-8 bg-gradient-to-b from-[#d6232f] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
