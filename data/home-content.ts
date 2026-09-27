import base from "./site-config.json"
import type { PublicLocale } from "./public-content"

// Stable message IDs are shared across locales; edit copy here, not in visual components.
export const messages = {
  "hero.label": {
    "en": "Introduction",
    "id": "Pengantar"
  },
  "nav.skip": {
    "en": "Skip to main content",
    "id": "Lewati ke konten utama"
  },
  "nav.language": {
    "en": "Language",
    "id": "Bahasa"
  },
  "nav.main": {
    "en": "Main navigation",
    "id": "Navigasi utama"
  },
  "nav.mobile": {
    "en": "Mobile navigation",
    "id": "Navigasi mobile"
  },
  "nav.close": {
    "en": "Close menu",
    "id": "Tutup menu"
  },
  "nav.open": {
    "en": "Open menu",
    "id": "Buka menu"
  },
  "nav.top": {
    "en": "Adam’s Work — Back to top",
    "id": "Adam’s Work — Kembali ke atas"
  },
  "hero.think": {
    "en": "Think · Test · Learn",
    "id": "Pikirkan · Uji · Pelajari"
  },
  "hero.global": {
    "en": "Also working with international teams entering or growing in Indonesia.",
    "id": "Kami juga terbuka untuk bekerja bersama tim internasional yang ingin masuk atau berkembang di Indonesia."
  },
  "hero.founder": {
    "en": "Led by Fikri Adam · Strategy and quality of work",
    "id": "Dipimpin Fikri Adam · Strategi dan kualitas pekerjaan"
  },
  "hero.experience": {
    "en": "Experience of Fikri Adam, founder of Adam’s Work",
    "id": "Pengalaman Fikri Adam, pendiri Adam’s Work"
  },
  "hero.avatar": {
    "en": "Cartoon portrait of Fikri Adam, Digital Marketing Strategist",
    "id": "Potret kartun Fikri Adam, ahli strategi pemasaran digital"
  },
  "hero.scroll": {
    "en": "Scroll",
    "id": "Gulir"
  },
  "about.aria": {
    "en": "About Adam’s Work and its founder",
    "id": "Tentang Adam’s Work dan pendirinya"
  },
  "about.curious": {
    "en": "Curious by default.",
    "id": "Selalu ingin tahu."
  },
  "about.years": {
    "en": "years delivering client projects",
    "id": "tahun mengerjakan proyek klien"
  },
  "about.label": {
    "en": "About Adam’s Work",
    "id": "Tentang Adam’s Work"
  },
  "about.heading": {
    "en": "Clear strategy.",
    "id": "Strategi yang jelas."
  },
  "about.accent": {
    "en": "Close collaboration.",
    "id": "Kolaborasi yang dekat."
  },
  "about.body": {
    "en": "Adam’s Work is led by Fikri Adam, who remains directly involved in every project — from defining the strategy to reviewing the final work. Specialist collaborators may support delivery when the scope requires it, but strategy, communication, and quality accountability stay with Fikri.",
    "id": "Adam’s Work dipimpin oleh Fikri Adam, yang tetap terlibat langsung dalam setiap proyek — mulai dari menyusun strategi hingga meninjau hasil akhir. Kolaborator spesialis dapat mendukung proses pengerjaan sesuai kebutuhan, tetapi strategi, komunikasi, dan tanggung jawab kualitas tetap berada pada Fikri."
  },
  "about.proof": {
    "en": "Fikri spent two years as a Team Lead at RevoU, mentoring more than 50 digital marketing students and guiding 10+ paid-media market tests. He has applied that structured, test-and-learn approach across client projects in property, travel, F&B, laundry, and fitness.",
    "id": "Selama dua tahun sebagai Team Lead di RevoU, Fikri membimbing lebih dari 50 student digital marketing dan mendampingi 10+ market test paid media. Pendekatan yang terstruktur dan berbasis pengujian tersebut kemudian diterapkan dalam proyek klien di industri properti, travel, F&B, laundry, dan fitness."
  },
  "about.industries": {
    "en": "Industry experience",
    "id": "Pengalaman industri"
  },
  "about.skills": {
    "en": "Expertise",
    "id": "Keahlian"
  },
  "skill.landing": {
    "en": "Landing Page",
    "id": "Halaman arahan"
  },
  "skill.consultation": {
    "en": "Marketing Consultation",
    "id": "Konsultasi pemasaran"
  },
  "skill.testing": {
    "en": "Creative Testing",
    "id": "Pengujian materi kreatif"
  },
  "industry.property": {
    "en": "Property",
    "id": "Properti"
  },
  "industry.travel": {
    "en": "Travel",
    "id": "Pariwisata"
  },
  "industry.fitness": {
    "en": "Fitness",
    "id": "Kebugaran"
  },
  "industry.laundry": {
    "en": "Laundry",
    "id": "Penatu"
  },
  "services.aria": {
    "en": "Adam’s Work services",
    "id": "Layanan Adam’s Work"
  },
  "services.label": {
    "en": "Services",
    "id": "Layanan"
  },
  "services.heading": {
    "en": "Build the foundation. Strengthen how people find you.",
    "id": "Bangun fondasinya. Perkuat cara pelanggan menemukan bisnis Anda."
  },
  "services.accent": {
    "en": "Improve what happens next.",
    "id": "Tingkatkan apa yang terjadi setelahnya."
  },
  "services.body": {
    "en": "Our strongest published results are in website and organic growth. We also support paid campaigns, analytics, marketplace strategy, and practical consulting when they contribute to the same measurable business goal.",
    "id": "Bukti terkuat kami saat ini berasal dari pengembangan website dan pertumbuhan organik. Kami juga mendukung paid campaign, analytics, strategi marketplace, dan konsultasi praktis ketika semuanya berkontribusi pada tujuan bisnis yang sama."
  },
  "process.aria": {
    "en": "Approach",
    "id": "Pendekatan"
  },
  "process.label": {
    "en": "How we work",
    "id": "Cara kerja"
  },
  "process.accent": {
    "en": "scope, and success measures.",
    "id": "ruang lingkup, dan ukuran keberhasilan."
  },
  "process.body": {
    "en": "Understand the goals, agree on a direction, do the work, then review the results together.",
    "id": "Pahami tujuan, sepakati arah, jalankan pekerjaan, lalu tinjau hasilnya bersama."
  },
  "process.understand": {
    "en": "Understand",
    "id": "Pahami"
  },
  "process.understandBody": {
    "en": "Understand the business goals, audience, needs, and constraints.",
    "id": "Pahami tujuan bisnis, audiens, kebutuhan, dan batasannya."
  },
  "process.plan": {
    "en": "Plan",
    "id": "Rencanakan"
  },
  "process.planBody": {
    "en": "Agree on priorities, scope, and how to evaluate results.",
    "id": "Sepakati prioritas, ruang lingkup, dan cara menilai hasil."
  },
  "process.execute": {
    "en": "Execute",
    "id": "Kerjakan"
  },
  "process.executeBody": {
    "en": "Work on the agreed priorities with clear communication.",
    "id": "Kerjakan prioritas yang disepakati dengan komunikasi yang jelas."
  },
  "process.review": {
    "en": "Review",
    "id": "Tinjau"
  },
  "process.reviewBody": {
    "en": "Discuss results and lessons to decide the next steps.",
    "id": "Bahas hasil dan pembelajaran untuk menentukan langkah berikutnya."
  },
  "process.quote": {
    "en": "",
    "id": ""
  },
  "process.quoteAccent": {
    "en": "",
    "id": ""
  },
  "process.tools": {
    "en": "Tools in practice",
    "id": "Alat yang digunakan"
  },
  "contact.aria": {
    "en": "Contact",
    "id": "Kontak"
  },
  "contact.label": {
    "en": "Start a conversation",
    "id": "Mulai percakapan"
  },
  "contact.heading": {
    "en": "Tell us what you’re trying to grow.",
    "id": "Ceritakan apa yang ingin Anda kembangkan."
  },
  "contact.accent": {
    "en": "We’ll tell you honestly if we’re a fit.",
    "id": "Kami akan menyampaikan dengan jujur apakah kami adalah partner yang tepat."
  },
  "contact.body": {
    "en": "Message us on WhatsApp for a quick conversation, or use email for a more formal enquiry. We aim to respond within one business day.",
    "id": "Hubungi kami melalui WhatsApp untuk percakapan singkat, atau gunakan email untuk kebutuhan yang lebih formal. Kami berusaha merespons dalam satu hari kerja."
  },
  "contact.email": {
    "en": "Send an Email",
    "id": "Kirim Email"
  },
  "contact.avatar": {
    "en": "Cartoon portrait of Fikri Adam",
    "id": "Potret kartun Fikri Adam"
  },
  "contact.availability": {
    "en": "Open to selected projects",
    "id": "Terbuka untuk proyek terpilih"
  },
  "footer.contact": {
    "en": "Studio contact",
    "id": "Kontak studio"
  },
  "projects.label": {
    "en": "Selected work",
    "id": "Karya pilihan"
  },
  "projects.heading": {
    "en": "Real work.",
    "id": "Pekerjaan nyata."
  },
  "projects.accent": {
    "en": "Real lessons.",
    "id": "Pembelajaran nyata."
  },
  "projects.body": {
    "en": "Selected work by Fikri Adam that forms the studio’s experience. Each project’s context, contributions, and results are presented as they are.",
    "id": "Pilihan pekerjaan Fikri Adam yang menjadi fondasi pengalaman studio. Konteks, kontribusi, dan hasil setiap proyek tetap disajikan apa adanya."
  },
  "projects.view": {
    "en": "View case study",
    "id": "Lihat studi kasus"
  },
  "projects.more": {
    "en": "More work",
    "id": "Karya lainnya"
  },
  "projects.open": {
    "en": "Open details",
    "id": "Buka detail"
  },
  "modal.close": {
    "en": "Close",
    "id": "Tutup"
  },
  "modal.outcomes": {
    "en": "Key outcomes",
    "id": "Hasil utama"
  },
  "modal.challenge": {
    "en": "Challenge",
    "id": "Tantangan"
  },
  "modal.contribution": {
    "en": "Contribution",
    "id": "Kontribusi"
  },
  "modal.impact": {
    "en": "Business impact",
    "id": "Dampak bisnis"
  },
  "modal.cta": {
    "en": "Discuss a Similar Project",
    "id": "Diskusikan Proyek Serupa"
  },
  "experience.aria": {
    "en": "Experience",
    "id": "Pengalaman"
  },
  "experience.label": {
    "en": "Founder’s experience",
    "id": "Pengalaman pendiri"
  },
  "experience.heading": {
    "en": "Built from",
    "id": "Dibangun dari"
  },
  "experience.accent": {
    "en": "hands-on practice.",
    "id": "praktik langsung."
  },
  "experience.body": {
    "en": "Fikri Adam’s experience before and behind Adam’s Work: from market testing to client campaigns.",
    "id": "Pengalaman Fikri Adam sebelum dan di balik Adam’s Work: dari pengujian pasar hingga kampanye klien."
  },
  "experience.highlight": {
    "en": "RevoU highlight",
    "id": "Sorotan RevoU"
  },
  "experience.role": {
    "en": "Team Lead · Digital Marketing",
    "id": "Pemimpin Tim · Pemasaran Digital"
  },
  "experience.lesson": {
    "en": "Turning lessons into confident action.",
    "id": "Mengubah pembelajaran menjadi tindakan yang percaya diri."
  },
  "experience.years": {
    "en": "years as a RevoU Team Lead",
    "id": "tahun sebagai Team Lead RevoU"
  },
  "experience.students": {
    "en": "students mentored",
    "id": "student dibimbing"
  },
  "experience.tests": {
    "en": "paid-media market tests guided",
    "id": "market test paid media didampingi"
  },
  "experience.moments": {
    "en": "RevoU team moments",
    "id": "Momen tim RevoU"
  },
  "experience.portrait": {
    "en": "Fikri Adam in a RevoU branded portrait",
    "id": "Potret Fikri Adam dengan identitas RevoU"
  },
  "experience.orientation": {
    "en": "RevoU digital marketing orientation team",
    "id": "Tim orientasi pemasaran digital RevoU"
  },
  "experience.session": {
    "en": "RevoU team learning session",
    "id": "Sesi belajar tim RevoU"
  },
  "experience.education": {
    "en": "Education",
    "id": "Pendidikan"
  },
  "experience.current": {
    "en": "2024 — Present",
    "id": "2024 — Sekarang"
  },
  "experience.specialist": {
    "en": "Digital Marketing Specialist",
    "id": "Spesialis Pemasaran Digital"
  },
  "experience.freelance": {
    "en": "Freelance",
    "id": "Lepas"
  },
  "experience.groperti": {
    "en": "GroPerti — SEO & organic growth",
    "id": "GroPerti — SEO & pertumbuhan organik"
  },
  "experience.fte": {
    "en": "FTE Renon — Meta Ads performance",
    "id": "FTE Renon — performa Meta Ads"
  },
  "experience.conscious": {
    "en": "ConsciousTravel — website, ads & SEO",
    "id": "ConsciousTravel — website, iklan & SEO"
  },
  "experience.lead": {
    "en": "Team Lead, Digital Marketing Course",
    "id": "Pemimpin Tim, Kursus Pemasaran Digital"
  },
  "experience.mentored": {
    "en": "Mentored 50+ digital marketing students",
    "id": "Mendampingi 50+ peserta pemasaran digital"
  },
  "experience.guided": {
    "en": "Guided 10+ market tests across Meta and Google Ads",
    "id": "Membimbing 10+ uji pasar melalui Meta dan Google Ads"
  },
  "experience.led": {
    "en": "Led learning teams for 2 years",
    "id": "Memimpin tim belajar selama 2 tahun"
  },
  "experience.intern": {
    "en": "Content Writer Intern",
    "id": "Magang Penulis Konten"
  },
  "experience.outreach": {
    "en": "Content placement and SEO outreach",
    "id": "Penempatan konten dan penjangkauan SEO"
  },
  "experience.research": {
    "en": "Researched 700–900 websites per week",
    "id": "Meriset 700–900 website per minggu"
  },
  "hero.eyebrow": {
    "en": "Founder-led digital growth studio",
    "id": "Founder-led digital growth studio"
  },
  "about.access": {
    "en": "You get direct access to the person responsible for the strategy, supported by the right specialists when the project requires them.",
    "id": "Anda mendapatkan akses langsung kepada orang yang bertanggung jawab atas strategi, dengan dukungan spesialis yang tepat ketika proyek membutuhkannya."
  },
  "process.heading": {
    "en": "Execution starts only after we agree on the goal,",
    "id": "Eksekusi dimulai setelah kita menyepakati tujuan,"
  },
  "contact.whatsapp": {
    "en": "Message on WhatsApp",
    "id": "Hubungi via WhatsApp"
  }
} as const
export type MessageId = keyof typeof messages

const siteCopy = {
  en: {
    headline: "Your website should do more than look good. It should help your business grow.",
    summary: "Adam’s Work helps growing businesses in Indonesia connect websites, search, analytics, and practical marketing strategy around clear, measurable goals.",
    primaryCta: "Discuss Your Project", secondaryCta: "View Our Work",
    founderRole: base.founderRole,
    navigation: ["Services", "Work", "About", "How We Work", "Contact"],
    statLabels: ["years delivering client projects", "years as a RevoU Team Lead", "students mentored", "paid-media market tests guided", "industries served"],
    description: "Indonesia-based web, SEO and digital growth studio for growing businesses and global companies entering or operating in Indonesia. Led by Fikri Adam.",
  },
  id: {
    headline: "Website Anda seharusnya bukan hanya terlihat bagus. Website harus membantu bisnis berkembang.",
    summary: "Adam’s Work membantu bisnis berkembang di Indonesia menghubungkan website, pencarian organik, analytics, dan strategi marketing praktis dengan tujuan yang jelas dan terukur.",
    primaryCta: base.primaryCta, secondaryCta: "Lihat Hasil Kerja",
    founderRole: "Pendiri, Ahli Strategi & Penanggung Jawab Kualitas",
    navigation: base.navigation.map(item => item.label),
    statLabels: ["tahun mengerjakan proyek klien", "tahun sebagai Team Lead RevoU", "student dibimbing", "market test paid media didampingi", "industri dilayani"],
    description: "Studio website, SEO, dan digital growth untuk UMKM Indonesia, dipimpin Fikri Adam. Strategi yang jelas dan kolaborasi yang dekat.",
  },
} as const

export function getSiteContent(locale: PublicLocale) {
  const copy = siteCopy[locale]
  return { ...base, ...copy, locale,
    navigation: base.navigation.map((item, index) => ({ ...item, label: copy.navigation[index] })),
    stats: ["2+", "2", "50+", "10+", "5"].map((value, index) => ({ value, label: copy.statLabels[index] })),
  }
}
