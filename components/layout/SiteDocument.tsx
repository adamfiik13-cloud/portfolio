import localFont from "next/font/local"
import "@/app/globals.css"
import type { PublicLocale } from "@/data/public-content"
import PublicMotion from "@/components/layout/PublicMotion"

const displayFont = localFont({
  src: "../../app/fonts/LeagueSpartan-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  preload: true,
})

const brandBodyFont = localFont({
  src: "../../app/fonts/Alata-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-brand-body",
  display: "swap",
  preload: true,
})

const interfaceFont = localFont({
  src: [
    { path: "../../app/fonts/SourceSans3-Variable.woff2", weight: "200 900", style: "normal" },
    { path: "../../app/fonts/SourceSans3-Italic-Variable.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-ui",
  display: "swap",
  preload: false,
})

export default function SiteDocument({
  children, locale,
}: Readonly<{
  children: React.ReactNode
  locale: PublicLocale
}>) {
  return (
    <html lang={locale} className={`${displayFont.variable} ${brandBodyFont.variable} ${interfaceFont.variable}`}>
      <body><PublicMotion>{children}</PublicMotion></body>
    </html>
  )
}
