"use client"

import { usePublicLocale } from "@/components/layout/PublicLocaleProvider"

import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Badge from "@/components/ui/Badge"

export default function AboutSection() {
  const { t } = usePublicLocale()
  const skills = [
    "Meta Ads",
    "Google Ads",
    "SEO",
    "GA4 & GTM",
    t("skill.landing"),
    t("skill.consultation"),
    t("skill.testing"),
  ]

  const industries = ["F&B", t("industry.property"), t("industry.laundry"), t("industry.travel"), t("industry.fitness")]

  return (
    <section
      id="tentang"
      className="py-24 lg:py-32 bg-[#0b0b0d] relative overflow-hidden"
      aria-label={t("about.aria")}
    >
      {/* Subtle background accent */}
      <div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(214,35,47,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="public-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Avatar */}
          <AnimatedSection direction="left" className="relative flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "radial-gradient(ellipse, rgba(214,35,47,0.1) 0%, transparent 70%)",
                  transform: "scale(1.05)",
                }}
                aria-hidden="true"
              />
              <Image
                src="/assets/avatar/avatar-about-640.webp"
                alt={t("hero.avatar")}
                width={480}
                height={480}
                className="relative z-10 w-full max-w-sm lg:max-w-md rounded-3xl object-cover"
                quality={85}
              />
              <div className="absolute -left-5 top-8 z-20 -rotate-6 rounded-lg bg-[#f3f3f4] px-3 py-2 text-xs font-display font-bold text-[#0b0b0d] shadow-xl">
                {t("about.curious")}
              </div>
              {/* Floating badge */}
              <div className="absolute z-20 -bottom-5 right-2 sm:-right-4 bg-[#151518]/95 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur">
                <div className="text-2xl font-display font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>2+</div>
                <div className="text-xs text-muted">{t("about.years")}</div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right — Content */}
          <div className="space-y-8">
            {/* Label */}
            <AnimatedSection delay={0.1}>
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
                <span className="text-sm font-display font-medium text-muted tracking-wide uppercase">
                  {t("about.label")}
                </span>
              </div>
            </AnimatedSection>

            {/* Heading */}
            <AnimatedSection delay={0.15}>
              <h2
                className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("about.heading")}{" "}
                <span className="text-[#d6232f]">{t("about.accent")}</span>
              </h2>
            </AnimatedSection>

            {/* Body */}
            <AnimatedSection delay={0.2}>
              <p className="text-muted leading-relaxed">
                {t("about.body")}
              </p>
            </AnimatedSection>

            <p className="text-muted leading-relaxed">{t("about.proof")}</p>
            <p className="text-muted leading-relaxed">{t("about.access")}</p>

            {/* Industries */}
            <AnimatedSection delay={0.25}>
              <div>
                <p className="text-xs font-display font-semibold text-muted uppercase tracking-widest mb-3">
                  {t("about.industries")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind) => (
                    <Badge key={ind} variant="outline">{ind}</Badge>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Skills */}
            <AnimatedSection delay={0.3}>
              <div>
                <p className="text-xs font-display font-semibold text-muted uppercase tracking-widest mb-3">
                  {t("about.skills")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
