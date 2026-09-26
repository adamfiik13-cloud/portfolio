import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

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

export const metadata: Metadata = {
  metadataBase: new URL("https://fikriadam.vercel.app"),
  title: "Fikri Adam — Digital Marketing Strategist",
  description:
    "Clear strategy, measurable execution, and practical insights for digital growth.",
  keywords: [
    "Digital Marketing Specialist",
    "Meta Ads",
    "Google Ads",
    "SEO",
    "GA4",
    "Google Tag Manager",
    "Landing Page",
    "Marketing Consultation",
    "Fikri Adam",
    "Indonesia",
  ],
  authors: [{ name: "Fikri Adam" }],
  creator: "Fikri Adam",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://fikriadam.vercel.app",
    title: "Fikri Adam — Digital Marketing Specialist",
    description: "Clear strategy. Measured execution. Useful learning.",
    siteName: "Fikri Adam Portfolio",
    images: [
      {
        url: "/assets/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fikri Adam — Digital Marketing Strategist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fikri Adam — Digital Marketing Specialist",
    description: "Clear strategy. Measured execution. Useful learning.",
    images: ["/assets/brand/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/assets/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/brand/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${brandBodyFont.variable} ${interfaceFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
