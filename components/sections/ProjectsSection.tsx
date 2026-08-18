"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Badge from "@/components/ui/Badge"
import ProjectModal from "@/components/ui/ProjectModal"
import projectsData from "@/data/projects.json"
import { Project } from "@/lib/types"

const projects = projectsData as Project[]
const featured = projects.filter((p) => p.featured)
const supporting = projects.filter((p) => !p.featured)

export default function ProjectsSection() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="studi-kasus"
      className="py-24 lg:py-32 bg-[#0b0b0d] relative"
      aria-label="Studi Kasus"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
            <span className="text-sm font-medium text-[#a8a8ae] tracking-wide uppercase">
              Studi Kasus
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Bukti kerja, bukan sekadar{" "}
            <span className="text-[#d6232f]">klaim</span>
          </h2>
          <p className="text-[#a8a8ae] leading-relaxed">
            Setiap proyek mencerminkan proses yang nyata — dari memahami masalah bisnis
            hingga mengeksekusi strategi dan membaca hasilnya.
          </p>
        </AnimatedSection>

        {/* Featured projects */}
        <div ref={ref} className="grid sm:grid-cols-2 gap-5 mb-5">
          {featured.map((project, i) => (
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              onClick={() => setActiveProject(project)}
              className="group relative cursor-pointer rounded-2xl bg-[#151518] border border-[#29292e] hover:border-[#d6232f]/40 overflow-hidden transition-all duration-300"
              aria-label={`Buka detail: ${project.title}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveProject(project)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/7] bg-[#202024] overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151518]/80 to-transparent" aria-hidden="true" />

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="red">{project.category}</Badge>
                </div>

                {/* Expand icon */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3
                    className="font-bold text-white text-lg leading-snug group-hover:text-[#ff4b55] transition-colors"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {project.title}
                  </h3>
                </div>

                {project.period && (
                  <p className="text-xs text-[#a8a8ae] mb-3">{project.period}</p>
                )}

                <p className="text-sm text-[#a8a8ae] leading-relaxed mb-4">
                  {project.summary}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2">
                  {project.metrics.slice(0, 3).map((metric, mi) => (
                    <span
                      key={mi}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#f3f3f4] bg-[#202024] border border-[#29292e] rounded-full px-3 py-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#d6232f]" aria-hidden="true" />
                      {metric}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#a8a8ae] group-hover:text-[#ff4b55] transition-colors">
                  Lihat detail
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Supporting projects */}
        <AnimatedSection delay={0.2}>
          <p className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-4">
            Proyek lainnya
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {supporting.map((project) => (
              <article
                key={project.slug}
                onClick={() => setActiveProject(project)}
                className="group cursor-pointer flex gap-4 p-5 rounded-2xl bg-[#151518] border border-[#29292e] hover:border-[#d6232f]/40 transition-all duration-300"
                aria-label={`Buka detail: ${project.title}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setActiveProject(project)}
              >
                {/* Thumbnail small */}
                <div className="w-16 h-16 rounded-xl bg-[#202024] overflow-hidden flex-shrink-0">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{project.category}</Badge>
                  </div>
                  <h3
                    className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-[#ff4b55] transition-colors"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#a8a8ae] line-clamp-2">{project.summary}</p>
                </div>

                <div className="flex-shrink-0 self-center text-[#a8a8ae] group-hover:text-[#d6232f] transition-colors" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </article>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  )
}
