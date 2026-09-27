import type { PublicLocale } from "./public-content"

export const serviceCopy = {
  "label": {
    "en": "Services",
    "id": "Layanan"
  },
  "title": {
    "en": "Clear scope. Practical digital work.",
    "id": "Scope jelas. Pekerjaan digital yang praktis."
  },
  "intro": {
    "en": "Websites, SEO, tracking, and growth strategy form our core offer. Compare the scope, then discuss the right next step with Fikri.",
    "id": "Website, SEO, tracking, dan strategi pertumbuhan menjadi penawaran utama kami. Bandingkan scope, lalu diskusikan langkah yang tepat bersama Fikri."
  },
  "founder": {
    "en": "A founder-led studio with specialist collaborators.",
    "id": "Studio yang dipimpin pendiri dengan kolaborator spesialis."
  },
  "confirmation": {
    "en": "Final scope and price are confirmed after discovery.",
    "id": "Scope dan harga akhir dikonfirmasi setelah diskusi kebutuhan."
  },
  "inquiryNote": {
    "en": "This opens a WhatsApp inquiry. Online checkout and booking are not available yet.",
    "id": "Tombol ini membuka pertanyaan melalui WhatsApp. Checkout dan pemesanan daring belum tersedia."
  },
  "career": {
    "en": "Additional services for individual professionals",
    "id": "Layanan tambahan untuk profesional individu"
  },
  "details": {
    "en": "View scope",
    "id": "Lihat scope"
  },
  "back": {
    "en": "All services",
    "id": "Semua layanan"
  },
  "who": {
    "en": "Who it is for",
    "id": "Untuk siapa"
  },
  "problem": {
    "en": "Problems it helps solve",
    "id": "Masalah yang dibantu"
  },
  "scope": {
    "en": "Scope & deliverables",
    "id": "Scope & hasil kerja"
  },
  "inputs": {
    "en": "What you provide",
    "id": "Yang perlu Anda siapkan"
  },
  "excluded": {
    "en": "Not included",
    "id": "Tidak termasuk"
  },
  "unlisted": {
    "en": "Work outside the confirmed scope is not included; discuss additional requirements before proceeding.",
    "id": "Pekerjaan di luar scope yang dikonfirmasi tidak termasuk; diskusikan kebutuhan tambahan sebelum melanjutkan."
  },
  "timeline": {
    "en": "Timing",
    "id": "Waktu pengerjaan"
  },
  "timingUnknown": {
    "en": "The delivery timeline is confirmed after reviewing your requirements and availability.",
    "id": "Waktu penyelesaian dikonfirmasi setelah meninjau kebutuhan dan ketersediaan."
  },
  "sessionSuffix": {
    "en": "minutes per session; scheduling and any written deliverables are confirmed in discussion.",
    "id": "menit per sesi; jadwal dan waktu penyerahan hasil tertulis dikonfirmasi dalam diskusi."
  },
  "revisions": {
    "en": "Revisions",
    "id": "Revisi"
  },
  "revisionUnknown": {
    "en": "Revision arrangements are confirmed with the scope before work begins.",
    "id": "Ketentuan revisi dikonfirmasi bersama scope sebelum pekerjaan dimulai."
  },
  "revisionSuffix": {
    "en": "revision round(s), maximum",
    "id": "putaran revisi, maksimal"
  },
  "process": {
    "en": "How we proceed",
    "id": "Langkah pengerjaan"
  },
  "steps": {
    "en": [
      "Share your needs and relevant context.",
      "Confirm scope, price, timing, and any access requirements with Fikri.",
      "Proceed with the agreed work and review the deliverables."
    ],
    "id": [
      "Sampaikan kebutuhan dan konteks yang relevan.",
      "Konfirmasikan scope, harga, waktu, dan kebutuhan akses bersama Fikri.",
      "Lanjutkan pekerjaan sesuai kesepakatan dan tinjau hasilnya."
    ]
  },
  "faq": {
    "en": "Common questions",
    "id": "Pertanyaan umum"
  },
  "faqPrice": {
    "en": "Is this the final price?",
    "id": "Apakah ini harga akhir?"
  },
  "faqPriceAnswer": {
    "en": "Fixed prices apply to the listed scope. “Starts from” prices are starting points for variable scope. Final scope and price are confirmed after discovery.",
    "id": "Harga tetap berlaku untuk scope yang tercantum. Harga “Mulai dari” adalah titik awal untuk scope yang bervariasi. Scope dan harga akhir dikonfirmasi setelah diskusi kebutuhan."
  },
  "faqStart": {
    "en": "How do I get started?",
    "id": "Bagaimana cara memulai?"
  },
  "faqStartAnswer": {
    "en": "Use the WhatsApp button to discuss this service. It includes the service name; you can add your context before sending. No online payment or booking is made on this page.",
    "id": "Gunakan tombol WhatsApp untuk mendiskusikan layanan ini. Nama layanan sudah disertakan; Anda dapat menambahkan konteks sebelum mengirim. Tidak ada pembayaran atau pemesanan daring yang dilakukan di halaman ini."
  },
  "faqExtra": {
    "en": "What if I need something outside this scope?",
    "id": "Bagaimana jika kebutuhan saya di luar scope ini?"
  },
  "faqExtraAnswer": {
    "en": "Describe the additional requirements during discovery so scope and any additional cost can be agreed before work begins.",
    "id": "Jelaskan kebutuhan tambahan saat diskusi agar scope dan biaya tambahan dapat disepakati sebelum pekerjaan dimulai."
  },
  "service": {
    "en": "Choose This Service",
    "id": "Pilih Layanan Ini"
  },
  "consultation": {
    "en": "Book a Consultation",
    "id": "Jadwalkan Konsultasi"
  },
  "quote": {
    "en": "Request a Quote",
    "id": "Minta Penawaran"
  },
  "browse": {
    "en": "Explore services & pricing",
    "id": "Jelajahi layanan & harga"
  },
  "price": {
    "en": "Price",
    "id": "Harga"
  }
} as const

export function getServiceCopy(locale: PublicLocale) {
  return <K extends keyof typeof serviceCopy>(key: K): (typeof serviceCopy)[K][PublicLocale] => serviceCopy[key][locale] as (typeof serviceCopy)[K][PublicLocale]
}
