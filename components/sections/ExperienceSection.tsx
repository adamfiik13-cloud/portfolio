"use client"

import { usePublicLocale } from "@/components/layout/PublicLocaleProvider"

import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Badge from "@/components/ui/Badge"

export default function ExperienceSection() {
  const { t } = usePublicLocale()
  const experiences = [
    {
      id: "freelance",
      period: t("experience.current"),
      role: t("experience.specialist"),
      company: t("experience.freelance"),
      type: "current",
      highlights: [
        t("experience.groperti"),
        t("experience.fte"),
        t("experience.conscious"),
      ],
    },
    {
      id: "revou",
      period: "2022 – 2024",
      role: t("experience.lead"),
      company: "RevoU",
      type: "featured",
      highlights: [
        t("experience.mentored"),
        t("experience.guided"),
        t("experience.led"),
      ],
    },
    {
      id: "iprice",
      period: "Jul — Nov 2022",
      role: t("experience.intern"),
      company: "iPrice Group",
      type: "default",
      highlights: [
        t("experience.outreach"),
        t("experience.research"),
      ],
    },
  ]

  return (
    <section
      id="pengalaman"
      className="py-24 lg:py-32 bg-[#151518] relative"
      aria-label={t("experience.aria")}
    >
      <div className="public-container">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-20">

          {/* Left — heading */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
                <span className="text-sm font-display font-medium text-muted tracking-wide uppercase">
                  {t("experience.label")}
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("experience.heading")}{" "}
                <span className="text-[#d6232f]">{t("experience.accent")}</span>
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                {t("experience.body")}
              </p>
            </AnimatedSection>

            {/* RevoU editorial feature */}
            <AnimatedSection delay={0.15}>
              <div className="overflow-hidden rounded-[1.5rem] bg-[#ffdf20] text-[#111113] shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
                <div className="flex px-4 pt-4 sm:hidden">
                  <div className="flex items-center gap-2 rounded-full bg-[#111113]/90 py-1.5 pl-1.5 pr-3 text-white">
                    <Image src="/assets/revou/revou-logo.jpg" alt="" width={28} height={28} className="rounded-full" />
                    <span className="text-[10px] font-display font-bold uppercase tracking-[0.16em]">{t("experience.highlight")}</span>
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src="/assets/revou/fikri-revou.png"
                    alt={t("experience.portrait")}
                    fill
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="object-cover object-[50%_32%] transition-transform duration-700 hover:scale-[1.025]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#ffdf20] to-transparent" aria-hidden="true" />
                  <div className="absolute left-4 top-4 hidden items-center gap-2 rounded-full bg-[#111113]/90 py-1.5 pl-1.5 pr-3 text-white backdrop-blur-sm sm:flex">
                    <Image src="/assets/revou/revou-logo.jpg" alt="" width={28} height={28} className="rounded-full" />
                    <span className="text-[10px] font-display font-bold uppercase tracking-[0.16em]">{t("experience.highlight")}</span>
                  </div>
                </div>

                <div className="relative -mt-8 px-5 pb-5">
                  <p className="mb-1 text-xs font-display font-bold uppercase tracking-[0.16em] text-[#111113]/80">{t("experience.role")}</p>
                  <p className="mb-5 text-xl font-display font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {t("experience.lesson")}
                  </p>

                  <div className="mb-5 grid grid-cols-3 gap-2 border-y border-[#111113]/15 py-4">
                  {[
                    { v: "2+", l: t("experience.years") },
                    { v: "50+", l: t("experience.students") },
                    { v: "10+", l: t("experience.tests") },
                  ].map((s) => (
                    <div key={s.l} className="text-center">
                      <div className="text-xl font-display font-bold" style={{ fontFamily: "var(--font-display)" }}>{s.v}</div>
                      <div className="text-[10px] font-display font-medium text-[#111113]/80">{s.l}</div>
                    </div>
                  ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2" aria-label={t("experience.moments")}>
                    {[
                      ["/assets/revou/team-orientation.png", t("experience.orientation")],
                      ["/assets/revou/team-session.png", t("experience.session")],
                    ].map(([src, alt]) => (
                      <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#111113]/10">
                        <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right — Timeline */}
          <div className="relative">
            {/* Line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[#29292e]" aria-hidden="true" />

            <div className="space-y-8">
              {experiences.map((exp, i) => (
                <AnimatedSection key={exp.id} delay={i * 0.08}>
                  <div className="relative pl-10">
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        exp.type === "featured"
                          ? "border-[#d6232f] bg-[#d6232f]/10"
                          : exp.type === "current"
                          ? "border-[#d6232f] bg-[#d6232f]"
                          : "border-[#29292e] bg-[#151518]"
                      }`}
                      aria-hidden="true"
                    >
                      {exp.type === "current" && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                      {exp.type === "featured" && (
                        <span className="w-2 h-2 rounded-full bg-[#d6232f]" />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-colors ${
                        exp.type === "featured"
                          ? "bg-[#0b0b0d] border-[#d6232f]/20"
                          : "bg-[#0b0b0d] border-[#29292e]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start gap-3 justify-between mb-3">
                        <div>
                          <h3
                            className="font-display font-semibold text-white mb-0.5"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {exp.role}
                          </h3>
                          <p className="text-sm text-muted">{exp.company}</p>
                        </div>
                        <Badge variant={exp.type === "current" ? "red" : "outline"} className="flex-shrink-0">
                          {exp.period}
                        </Badge>
                      </div>

                      <ul className="space-y-1.5">
                        {exp.highlights.map((h, hi) => (
                          <li key={hi} className="flex items-start gap-2.5 text-sm text-muted">
                            <span className="mt-2 w-1 h-1 rounded-full bg-[#d6232f]/60 flex-shrink-0" aria-hidden="true" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        {/* Education */}
        <AnimatedSection delay={0.2} className="mt-16">
          <div className="pt-10 border-t border-[#29292e]">
            <p className="text-xs font-display font-semibold text-muted uppercase tracking-widest mb-6">{t("experience.education")}</p>
            <div className="max-w-xl">
              <div className="p-5 rounded-2xl bg-[#0b0b0d] border border-[#29292e]">
                <p className="text-sm font-display font-semibold text-white mb-1">RevoU</p>
                <p className="text-xs text-muted mb-2">Full Stack Digital Marketing · Batch 8</p>
                <p className="text-xs text-muted">Jan — Apr 2022</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
