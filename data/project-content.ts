import projects from "./projects.json"
import indonesian from "./projects-id.json"
import { projectsDetail } from "@/lib/projects-detail"
import type { Project } from "@/lib/types"
import type { PublicLocale } from "./public-content"

// Existing slugs are stable entity IDs; thumbnails, numeric evidence and featured status are shared.
export function getPublicProjects(locale: PublicLocale): Project[] {
  const translations: Record<string, Partial<Project>> = indonesian
  return projects.map(project => {
    const detail = projectsDetail[project.slug]
    if (locale === "en") return { ...project, ...detail }
    const translation = translations[project.slug]
    if (!translation) throw new Error("Missing Indonesian project: " + project.slug)
    return { ...project, ...translation }
  })
}
