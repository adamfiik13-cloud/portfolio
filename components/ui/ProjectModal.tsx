"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Project } from "@/lib/types"
import { projectsDetail } from "@/lib/projects-detail"
import Badge from "./Badge"
import Button from "./Button"

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const detail = project ? projectsDetail[project.slug] : null

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [project])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#151518] sm:rounded-2xl border border-[#29292e] shadow-2xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#151518]/95 backdrop-blur border-b border-[#29292e]">
                <Badge variant="red">{project.category}</Badge>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a8a8ae] hover:text-white hover:bg-[#202024] transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Thumbnail */}
                <div className="rounded-xl overflow-hidden bg-[#202024] aspect-[16/7] flex items-center justify-center">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    width={640}
                    height={280}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Period */}
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                    {project.title}
                  </h2>
                  {project.period && (
                    <p className="mt-1 text-sm text-[#a8a8ae]">{project.period} · {detail?.industry}</p>
                  )}
                  {!project.period && detail?.industry && (
                    <p className="mt-1 text-sm text-[#a8a8ae]">{detail.industry}</p>
                  )}
                </div>

                {/* Summary */}
                <p className="text-[#a8a8ae] leading-relaxed">{project.summary}</p>

                {/* Metrics */}
                <div>
                  <h3 className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-3">
                    Key outcomes
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {project.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#202024] border border-[#29292e]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d6232f] flex-shrink-0" />
                        <span className="text-sm text-[#f3f3f4] font-medium">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge */}
                {detail?.challenge && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-2">
                      Challenge
                    </h3>
                    <p className="text-[#a8a8ae] text-sm leading-relaxed">{detail.challenge}</p>
                  </div>
                )}

                {/* Contributions */}
                {detail?.contributions && detail.contributions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-3">
                      Contribution
                    </h3>
                    <ul className="space-y-2">
                      {detail.contributions.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#a8a8ae]">
                          <span className="mt-2 w-1 h-1 rounded-full bg-[#d6232f] flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Insight */}
                {detail?.insight && (
                  <div className="px-4 py-4 rounded-xl border-l-2 border-[#d6232f] bg-[#d6232f]/5">
                    <p className="text-sm text-[#f3f3f4] italic leading-relaxed">
                      &ldquo;{detail.insight}&rdquo;
                    </p>
                  </div>
                )}

                {/* Business Impact */}
                {detail?.businessImpact && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#a8a8ae] uppercase tracking-widest mb-2">
                      Business impact
                    </h3>
                    <p className="text-sm text-[#a8a8ae] leading-relaxed">{detail.businessImpact}</p>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-2 border-t border-[#29292e]">
                  <Button
                    href="https://wa.me/6285155202123"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    className="w-full justify-center"
                  >
                    Discuss a Similar Project
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.535 4.122 1.558 5.916L.057 23.882a.5.5 0 0 0 .61.61l5.966-1.501A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.634-.485-5.19-1.405l-.372-.219-3.853.97.99-3.774-.24-.391A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
