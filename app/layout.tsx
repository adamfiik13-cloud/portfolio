import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import siteConfig from "@/data/site-config.json"
import PublicMotion from "@/components/layout/PublicMotion"

const displayFont = localFont({
  src: "./fonts/LeagueSpartan-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  preload: true,
})

const brandBodyFont = localFont({
  src: "./fonts/Alata-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-brand-body",
  display: "swap",
  preload: true,
})

const interfaceFont = localFont({
  src: [
    { path: "./fonts/SourceSans3-Variable.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/SourceSans3-Italic-Variable.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-ui",
  display: "swap",
  preload: false,
})

const title = siteConfig.name + " — " + siteConfig.role
const description = "Studio website, SEO, dan digital growth untuk UMKM Indonesia, dipimpin Fikri Adam. Strategi yang jelas dan kolaborasi yang dekat."

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: "%s | Adam’s Work" },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: siteConfig.founder }],
  creator: siteConfig.name,
  openGraph: {
    type: "website", locale: "id_ID", url: siteConfig.url,
    title, description, siteName: siteConfig.name,
    images: [{ url: "/assets/avatar/avatar-about-640.webp", width: 640, height: 640, alt: "Fikri Adam, pendiri Adam’s Work" }],
  },
  twitter: { card: "summary", title, description, images: ["/assets/avatar/avatar-about-640.webp"] },
  icons: { icon: { url: "/assets/brand/adams-work.svg", type: "image/svg+xml" }, apple: "/assets/avatar/avatar-circle-64.png" },
  robots: {
    index: process.env.APP_ENV !== "staging" && process.env.VERCEL_ENV !== "preview",
    follow: process.env.APP_ENV !== "staging",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={siteConfig.locale} className={`${displayFont.variable} ${brandBodyFont.variable} ${interfaceFont.variable}`}>
      <body><PublicMotion>{children}</PublicMotion></body>
    </html>
  )
}
