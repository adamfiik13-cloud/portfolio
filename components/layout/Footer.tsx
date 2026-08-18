import Image from "next/image"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#29292e] bg-[#0b0b0d]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <Image
              src="/assets/avatar/avatar-circle-64.png"
              alt="Fikri Adam"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full opacity-80"
            />
            <span className="text-sm text-[#a8a8ae]">Fikri Adam</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[#a8a8ae]">
            <a
              href="https://wa.me/6285155202123"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 inline-flex items-center hover:text-white transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:adam.fikri13@gmail.com"
              className="min-h-11 inline-flex items-center hover:text-white transition-colors"
            >
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/fikri-adam/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 inline-flex items-center hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/adamfiik/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 inline-flex items-center hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#a8a8ae]/50">
            &copy; {year} Fikri Adam
          </p>
        </div>
      </div>
    </footer>
  )
}
