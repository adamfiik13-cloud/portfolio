"use client"

import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Badge from "@/components/ui/Badge"

const skills = [
  "Meta Ads",
  "Google Ads",
  "SEO",
  "GA4 & GTM",
  "Landing Page",
  "Marketing Consultation",
  "Creative Testing",
  "Keyword Research",
  "Technical SEO",
  "Campaign Strategy",
  "Performance Reporting",
  "Conversion Optimization",
]

const industries = ["F&B", "Properti", "Laundry", "Travel", "Fitness"]

export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="py-24 lg:py-32 bg-[#0b0b0d] relative overflow-hidden"
      aria-label="Tentang Fikri Adam"
    >
      {/* Subtle background accent */}
      <div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(214,35,47,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-6">
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
                src="/assets/avatar/avatar-profile-640.webp"
                alt="Ilustrasi cartoon Fikri Adam, Digital Marketing Specialist"
                width={480}
                height={480}
                className="relative z-10 w-full max-w-sm lg:max-w-md rounded-3xl object-cover"
                quality={85}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#151518] border border-[#29292e] rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-manrope)" }}>4+</div>
                <div className="text-xs text-[#a8a8ae]">tahun pengalaman</div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right — Content */}
          <div className="space-y-8">
            {/* Label */}
            <AnimatedSection delay={0.1}>
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
                <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
                  Tentang Saya
                </span>
              </div>
            </AnimatedSection>

            {/* Heading */}
            <AnimatedSection delay={0.15}>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Digital marketing adalah proses belajar dari{" "}
                <span className="text-[#d6232f]">respons pasar</span>, bukan sekadar menjalankan iklan.
              </h2>
            </AnimatedSection>

            {/* Body */}
            <AnimatedSection delay={0.2}>
              <p className="text-[#a8a8ae] leading-relaxed">
                Digital marketing bukan hanya tentang membuat iklan tayang atau mendapatkan traffic.
                Bagi saya, digital marketing adalah proses memahami masalah bisnis, menyusun hipotesis,
                menjalankan strategi, membaca respons pasar, lalu mengubah pembelajaran tersebut menjadi
                keputusan yang lebih baik.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.25}>
              <p className="text-[#a8a8ae] leading-relaxed">
                Pengalaman saya mencakup berbagai industri — F&B, properti, laundry, travel, dan fitness.
                Selain menjalankan kampanye, saya juga pernah membimbing lebih dari{" "}
                <span className="text-white font-medium">50 student Digital Marketing</span> di RevoU
                selama dua tahun sebagai Team Lead.
              </p>
            </AnimatedSection>

            {/* Industries */}
            <AnimatedSection delay={0.3}>
              <div>
                <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-3">
                  Industri yang pernah ditangani
                </p>
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind) => (
                    <Badge key={ind} variant="outline">{ind}</Badge>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Skills */}
            <AnimatedSection delay={0.35}>
              <div>
                <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-3">
                  Keahlian
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
