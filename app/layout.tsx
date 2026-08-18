import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
