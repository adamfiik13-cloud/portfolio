import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://fikriadam.vercel.app"),
  title: "Fikri Adam — Digital Marketing Specialist",
  description:
    "Saya membantu bisnis menemukan audiens, pesan, dan jalur konversi yang paling relevan melalui strategi digital yang dapat diuji dan dievaluasi berdasarkan data.",
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
    description:
      "Strategi yang jelas. Eksekusi yang terukur. Pembelajaran yang dapat ditindaklanjuti.",
    siteName: "Fikri Adam Portfolio",
    images: [
      {
        url: "/assets/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fikri Adam — Digital Marketing Specialist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fikri Adam — Digital Marketing Specialist",
    description:
      "Strategi yang jelas. Eksekusi yang terukur. Pembelajaran yang dapat ditindaklanjuti.",
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
    <html lang="id" className={`${inter.variable} ${manrope.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
