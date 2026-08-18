"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import AnimatedSection from "@/components/ui/AnimatedSection"
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
      className="py-24 lg:py-32 bg-[#f3f0e9] text-[#111114] relative overflow-hidden"
      aria-label="Selected work"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f]" />
            <span className="text-sm font-semibold text-[#5d5a55] tracking-wide uppercase">
              Selected work
            </span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-[#111114] leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Evidence over{" "}
            <span className="text-[#d6232f]">assumption.</span>
          </h2>
          <p className="text-[#625f59] leading-relaxed">
            Clear problems. Measured actions. Useful outcomes.
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
              className="group relative cursor-pointer rounded-3xl bg-white border border-[#d9d4ca] hover:border-[#d6232f]/40 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,26,22,0.12)] overflow-hidden transition-all duration-300"
              aria-label={`Open details: ${project.title}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveProject(project)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] bg-[#111114] overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#111114] shadow-sm backdrop-blur">
                    {project.category}
                  </span>
                </div>

                {/* Expand icon */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-7">
                <div className="mb-4">
                  <h3
                    className="font-bold text-[#111114] text-2xl leading-none group-hover:text-[#d6232f] transition-colors"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {project.displayTitle ?? project.title}
                  </h3>
                  {project.service && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b302f]">
                      {project.service}
                    </p>
                  )}
                </div>

                {project.period && (
                  <p className="text-xs text-[#77736c] mb-3">{project.period}</p>
                )}

                <p className="text-sm text-[#625f59] leading-relaxed mb-5">
                  {project.summary}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2">
                  {project.metrics.slice(0, 3).map((metric, mi) => (
                    <span
                      key={mi}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34312d] bg-[#f3f0e9] border border-[#ded8ce] rounded-full px-3 py-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#d6232f]" aria-hidden="true" />
                      {metric}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#34312d] group-hover:text-[#d6232f] transition-colors">
                  View case study
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
          <p className="text-xs font-semibold text-[#625f59] uppercase tracking-widest mb-4">
            More work
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {supporting.map((project) => (
              <article
                key={project.slug}
                onClick={() => setActiveProject(project)}
                className="group cursor-pointer flex gap-5 p-5 rounded-2xl bg-white border border-[#d9d4ca] hover:border-[#d6232f]/40 hover:shadow-[0_16px_36px_rgba(31,26,22,0.08)] transition-all duration-300"
                aria-label={`Open details: ${project.title}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setActiveProject(project)}
              >
                {/* Thumbnail small */}
                <div className="w-24 h-20 rounded-xl bg-[#111114] overflow-hidden flex-shrink-0">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    width={192}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-[#111114] text-lg leading-none mb-1 group-hover:text-[#d6232f] transition-colors"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {project.displayTitle ?? project.title}
                  </h3>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b302f] mb-2">{project.service}</p>
                  <p className="text-xs text-[#625f59] line-clamp-2">{project.summary}</p>
                </div>

                <div className="flex-shrink-0 self-center text-[#77736c] group-hover:text-[#d6232f] transition-colors" aria-hidden="true">
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
