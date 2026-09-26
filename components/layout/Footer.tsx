import BrandSignature from "@/components/ui/BrandSignature"
import siteConfig from "@/data/site-config.json"

export default function Footer() {
  return (
    <footer className="border-t border-line bg-black">
      <div className="public-container py-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <BrandSignature />
            <p className="text-sm text-muted" lang="en">{siteConfig.role}</p>
            <p className="text-sm text-muted" lang="en">{siteConfig.tagline}</p>
            <p className="text-xs text-muted">Dipimpin {siteConfig.founder} · Strategi dan kualitas pekerjaan</p>
          </div>
          <nav aria-label="Kontak studio" className="flex flex-wrap gap-x-6 text-sm text-muted">
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={"mailto:" + siteConfig.email}>Email</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn Fikri</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
          </nav>
        </div>
        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} {siteConfig.name}</p>
      </div>
    </footer>
  )
}
