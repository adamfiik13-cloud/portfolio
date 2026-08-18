export interface Project {
  slug: string
  title: string
  displayTitle?: string
  service?: string
  category: string
  period: string
  thumbnail: string
  summary: string
  metrics: string[]
  featured: boolean
  industry?: string
  challenge?: string
  contributions?: string[]
  results?: string[]
  businessImpact?: string
  insight?: string
}

export interface Service {
  id: string
  title: string
  description: string
}

export interface Stat {
  value: string
  label: string
}

export interface SiteConfig {
  name: string
  role: string
  experience: string
  location: string
  email: string
  whatsappDisplay: string
  whatsappUrl: string
  linkedinLabel: string
  linkedinUrl: string
  instagramUrl?: string
  headline: string
  summary: string
  primaryCta: string
  secondaryCta: string
  navigation: string[]
  stats: Stat[]
}
