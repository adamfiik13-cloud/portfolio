"use client"

import AnimatedSection from "@/components/ui/AnimatedSection"
import Badge from "@/components/ui/Badge"

const experiences = [
  {
    period: "2024 — Present",
    role: "Digital Marketing Specialist",
    company: "Freelance",
    type: "current",
    highlights: [
      "GroPerti — SEO & organic growth",
      "FTE Renon — Meta Ads performance",
      "ConsciousTravel — website, ads & SEO",
    ],
  },
  {
    period: "2022 – 2024",
    role: "Team Lead, Digital Marketing Course",
    company: "RevoU",
    type: "featured",
    highlights: [
      "Mentored 50+ digital marketing students",
      "Guided 10+ market tests across Meta and Google Ads",
      "Led the team for two years",
    ],
  },
  {
    period: "Aug — Oct 2022",
    role: "Digital Marketing (Project)",
    company: "Katanya Bento by Sagala",
    type: "default",
    highlights: [
      "Meta Ads performance marketing",
      "Up to +90% reach and +20% conversion rate",
    ],
  },
  {
    period: "Jul — Nov 2022",
    role: "Content Writer Intern",
    company: "iPrice Group",
    type: "default",
    highlights: [
      "Content placement and SEO outreach",
      "Researched 700–900 websites per week",
    ],
  },
  {
    period: "Jan — Apr 2022",
    role: "Full Stack Digital Marketing",
    company: "RevoU – Batch 8",
    type: "default",
    highlights: [
      "CampingJam project: 33 leads, 991 monthly users",
      "Performance marketing, SEO, CRM, analytics",
    ],
  },
  {
    period: "2019 – 2021",
    role: "Association Chair",
    company: "HIMMATETA INSTIPER",
    type: "default",
    highlights: [
      "Led ~30 committee members and 100 members",
      "Leadership & team management",
    ],
  },
]

export default function ExperienceSection() {
  return (
    <section
      id="pengalaman"
      className="py-24 lg:py-32 bg-[#151518] relative"
      aria-label="Experience"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-20">

          {/* Left — heading */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
                <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
                  Experience
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Built through{" "}
                <span className="text-[#d6232f]">real practice.</span>
              </h2>
              <p className="text-[#a8a8ae] leading-relaxed mb-8">
                From market tests to client campaigns, each role sharpened how I frame marketing problems.
              </p>
            </AnimatedSection>

            {/* RevoU highlight card */}
            <AnimatedSection delay={0.15}>
              <div className="p-5 rounded-2xl bg-[#0b0b0d] border border-[#d6232f]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#d6232f]/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d6232f" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#d6232f] uppercase tracking-wide">Highlight</p>
                    <p className="text-sm font-semibold text-white">RevoU — Team Lead</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: "2", l: "years" },
                    { v: "50+", l: "students" },
                    { v: "10+", l: "market test" },
                  ].map((s) => (
                    <div key={s.l} className="text-center">
                      <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{s.v}</div>
                      <div className="text-[10px] text-[#a8a8ae]">{s.l}</div>
                    </div>
                  ))}
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
                <AnimatedSection key={i} delay={i * 0.08}>
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
                            className="font-semibold text-white mb-0.5"
                            style={{ fontFamily: "var(--font-playfair)" }}
                          >
                            {exp.role}
                          </h3>
                          <p className="text-sm text-[#a8a8ae]">{exp.company}</p>
                        </div>
                        <Badge variant={exp.type === "current" ? "red" : "outline"} className="flex-shrink-0">
                          {exp.period}
                        </Badge>
                      </div>

                      <ul className="space-y-1.5">
                        {exp.highlights.map((h, hi) => (
                          <li key={hi} className="flex items-start gap-2.5 text-sm text-[#a8a8ae]">
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
            <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-6">Education</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b0b0d] border border-[#29292e]">
                <p className="text-sm font-semibold text-white mb-1">RevoU</p>
                <p className="text-xs text-[#a8a8ae] mb-2">Full Stack Digital Marketing · Batch 8</p>
                <p className="text-xs text-[#a8a8ae]/60">Jan — Apr 2022</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b0b0d] border border-[#29292e]">
                <p className="text-sm font-semibold text-white mb-1">Institut Pertanian STIPER Yogyakarta</p>
                <p className="text-xs text-[#a8a8ae] mb-2">BSc Agricultural Technology · GPA 3.24</p>
                <p className="text-xs text-[#a8a8ae]/60">2014 – 2021</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
