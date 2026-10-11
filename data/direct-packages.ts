import { catalogServices } from "./service-catalog"
import type { PublicLocale } from "./public-content"
import type { TransactionTerms } from "../lib/commerce/rules"

type Localized<T> = Record<PublicLocale, T>
export const DIRECT_PACKAGE_VERSION = "phase5-2026-10-11"
export interface PackageBriefField {
  id: string
  label: Localized<string>
  instruction: Localized<string>
  required: boolean
}
export interface DirectPackage {
  serviceId: string
  specificationVersion: string
  scope: Localized<string[]>
  tools: Localized<string[]>
  outputs: Localized<string[]>
  illustrations: Localized<string[]>
  exclusions: Localized<string[]>
  duration: Localized<string>
  revisions: Localized<string>
  briefFields: PackageBriefField[]
  technicalConditions: Localized<string[]>
  schedulingNote: Localized<string> | null
  compatibilityApproval: boolean
}
const local = <T,>(en: T, id: T): Localized<T> => ({ en, id })
const field = (id: string, en: string, idLabel: string, enInstruction: string, idInstruction: string, required = true): PackageBriefField =>
  ({ id, label: local(en, idLabel), instruction: local(enInstruction, idInstruction), required })
const scheduling = local(
  "Scheduling is manual. Purchase does not reserve a calendar slot. Propose three session times in WITA; the studio confirms availability. Existing rescheduling and no-show rules apply.",
  "Penjadwalan dilakukan manual. Pembelian tidak langsung memesan slot kalender. Ajukan tiga pilihan waktu dalam WITA; studio akan mengonfirmasi ketersediaan. Aturan penjadwalan ulang dan ketidakhadiran yang berlaku tetap digunakan.",
)
const clarification = local(
  "One consolidated clarification submission, up to three questions, within seven calendar days after receiving the written output.",
  "Satu pengajuan klarifikasi terpadu, maksimal tiga pertanyaan, dalam tujuh hari kalender setelah menerima hasil tertulis.",
)
const sessionFields = [
  field("business_context", "Business context", "Konteks bisnis", "Describe the one business and its current situation.", "Jelaskan satu bisnis dan kondisinya saat ini."),
  field("chosen_object", "Chosen channel or object", "Kanal atau objek pilihan", "Identify the business problem, marketing channel or marketplace store to discuss.", "Tentukan masalah bisnis, kanal pemasaran, atau toko marketplace yang akan dibahas."),
  field("goal", "Goal", "Tujuan", "Describe the outcome you want from this session.", "Jelaskan tujuan yang ingin dicapai melalui sesi ini."),
  field("main_challenge", "Main challenge", "Tantangan utama", "State the main issue and questions to prioritize.", "Sampaikan masalah dan pertanyaan utama yang perlu diprioritaskan."),
  field("relevant_information", "Relevant information", "Informasi relevan", "Prepare relevant performance information or screenshots without passwords or keys.", "Siapkan informasi kinerja atau tangkapan layar yang relevan tanpa password atau key."),
  field("session_times", "Three proposed session times", "Tiga pilihan waktu sesi", "Propose three dates and times in WITA; availability is confirmed manually.", "Ajukan tiga tanggal dan waktu dalam WITA; ketersediaan dikonfirmasi manual."),
]
const seoFields = [
  field("website_url", "Website URL", "URL website", "Provide the public website address.", "Sampaikan alamat publik website."),
  field("audience_location", "Audience and location", "Audiens dan lokasi", "Describe the target audience and relevant locations.", "Jelaskan audiens sasaran dan lokasi yang relevan."),
  field("main_services", "Main services", "Layanan utama", "List the business services or offers to prioritize.", "Cantumkan layanan atau penawaran bisnis yang diprioritaskan."),
  field("priority_pages", "Five priority pages", "Lima halaman prioritas", "List five priority pages, or explain if fewer pages exist.", "Cantumkan lima halaman prioritas, atau jelaskan jika jumlah halaman lebih sedikit."),
  field("analytics_availability", "GSC / GA4 availability", "Ketersediaan GSC / GA4", "State whether data and authorized access are available. Analytics access improves the audit but is not mandatory.", "Jelaskan ketersediaan data dan izin akses. Akses analitik membantu audit, tetapi tidak wajib."),
]
const trackingFields = [
  field("website_platform", "Website URL and platform", "URL dan platform website", "Provide the URL and platform; do not assume every website supports this setup.", "Sampaikan URL dan platform; tidak semua website mendukung konfigurasi ini."),
  field("measurement_goal", "Measurement goal", "Tujuan pengukuran", "Describe the activity you need to measure.", "Jelaskan aktivitas yang perlu diukur."),
  field("selected_events", "Selected events", "Event pilihan", "List events within the package limit and the existing actions they represent.", "Cantumkan event dalam batas paket beserta aktivitas yang sudah tersedia."),
  field("event_success", "Success definition per event", "Definisi keberhasilan setiap event", "Specify the action or condition that should trigger each event.", "Tentukan aktivitas atau kondisi pemicu setiap event."),
  field("access_readiness", "Authorized access readiness", "Kesiapan izin akses", "Confirm access readiness for the website, GA4 and GTM. Use secure access invitations, not passwords or API keys in the brief.", "Konfirmasikan kesiapan akses website, GA4, dan GTM. Gunakan undangan akses yang aman, bukan password atau API key dalam brief."),
  field("existing_consent", "Existing consent implementation", "Implementasi persetujuan yang ada", "Describe the existing consent setup and how it controls tracking.", "Jelaskan pengaturan persetujuan yang ada dan cara pengaturan tersebut mengendalikan tracking."),
]
const cvFields = [
  field("current_cv", "Current CV", "CV saat ini", "Prepare one CV, maximum two pages, in PDF or DOCX. Secure submission is coordinated separately; there is no brief-upload interface yet.", "Siapkan satu CV, maksimal dua halaman, dalam PDF atau DOCX. Pengiriman aman dikoordinasikan terpisah; antarmuka unggah brief belum tersedia."),
  field("output_language", "Output language", "Bahasa hasil", "Choose English or Indonesian; one language is included, not a translation service.", "Pilih English atau Indonesia; satu bahasa termasuk, bukan layanan penerjemahan."),
  field("target_role", "Target role or job reference", "Posisi sasaran atau referensi lowongan", "Identify one target position and provide the relevant job reference.", "Tentukan satu posisi sasaran dan sampaikan referensi lowongan yang relevan."),
]
const trackingConditions = local(
  ["Requires a website permitting authorized browser-side tag installation, usable existing event actions, and an existing consent implementation. Unsupported platforms or requirements need an inquiry before purchase.", "Access must cover one website, one GA4 property and one GTM container. Account ownership remains with the customer."],
  ["Membutuhkan website yang mengizinkan pemasangan tag browser dengan akses sah, aktivitas event yang sudah tersedia, serta implementasi persetujuan yang ada. Platform atau kebutuhan yang tidak didukung harus dibahas sebelum pembelian.", "Akses mencakup satu website, satu property GA4, dan satu container GTM. Kepemilikan akun tetap pada klien."],
)

// Owner-approved Phase 5 specifications. Locale changes display copy, never price or eligibility.
export const directPackages: DirectPackage[] = [
  {
    serviceId: "digital-business-consultation", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One business and one main problem.", "One 60-minute online consultation."], ["Satu bisnis dan satu masalah utama.", "Satu konsultasi online selama 60 menit."]),
    tools: local(["Google Meet"], ["Google Meet"]),
    outputs: local(["One PDF containing the discussion summary, priorities and next actions."], ["Satu PDF berisi ringkasan diskusi, prioritas, dan langkah berikutnya."]),
    illustrations: local(["Illustrative structure: business context → discussion summary → priorities → next actions. This is a structure example, not client evidence."], ["Struktur ilustratif: konteks bisnis → ringkasan diskusi → prioritas → langkah berikutnya. Ini contoh struktur, bukan bukti hasil klien."]),
    exclusions: local(["Execution and additional sessions."], ["Pelaksanaan pekerjaan dan sesi tambahan."]),
    duration: local("60-minute session; summary within two business days after the session.", "Sesi 60 menit; ringkasan dalam dua hari kerja setelah sesi."),
    revisions: clarification, briefFields: sessionFields, technicalConditions: local([], []), schedulingNote: scheduling,
  },
  {
    serviceId: "marketing-marketplace-audit", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One marketing channel OR one marketplace store.", "One 60-minute online audit session using customer-provided account and performance information."], ["Satu kanal pemasaran ATAU satu toko marketplace.", "Satu sesi audit online selama 60 menit menggunakan informasi akun dan kinerja yang disediakan klien."]),
    tools: local(["Google Meet", "Customer-provided account and performance information"], ["Google Meet", "Informasi akun dan kinerja yang disediakan klien"]),
    outputs: local(["One PDF containing findings, improvement priorities and an action plan."], ["Satu PDF berisi temuan, prioritas perbaikan, dan rencana tindakan."]),
    illustrations: local(["Illustrative structure: chosen channel/store → findings → priority improvements → action plan. No client results are implied."], ["Struktur ilustratif: kanal/toko pilihan → temuan → prioritas perbaikan → rencana tindakan. Tidak menyiratkan hasil klien."]),
    exclusions: local(["Campaign or store implementation."], ["Implementasi campaign atau toko."]),
    duration: local("60-minute session; notes within two business days after the session.", "Sesi 60 menit; catatan dalam dua hari kerja setelah sesi."),
    revisions: clarification, briefFields: sessionFields, technicalConditions: local([], []), schedulingNote: scheduling,
  },
  {
    serviceId: "tracking-basic", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One website, one GA4 property and one GTM container.", "Up to three agreed events."], ["Satu website, satu property GA4, dan satu container GTM.", "Maksimal tiga event yang disepakati."]),
    tools: local(["Google Analytics 4 (GA4)", "Google Tag Manager (GTM)"], ["Google Analytics 4 (GA4)", "Google Tag Manager (GTM)"]),
    outputs: local(["Installed configuration and agreed event definitions.", "Testing evidence and a short checking guide."], ["Konfigurasi terpasang dan definisi event yang disepakati.", "Bukti pengujian dan panduan pemeriksaan singkat."]),
    illustrations: local(["Illustrative handover: event name → trigger definition → testing evidence → checking instructions. The events are agreed for your website."], ["Ilustrasi handover: nama event → definisi pemicu → bukti pengujian → petunjuk pemeriksaan. Event disepakati sesuai website Anda."]),
    exclusions: local(["Events or technical requirements beyond the approved scope."], ["Event atau kebutuhan teknis di luar cakupan yang disetujui."]),
    duration: local("3–5 business days.", "3–5 hari kerja."),
    revisions: local("One in-scope adjustment round.", "Satu ronde penyesuaian dalam cakupan."),
    briefFields: trackingFields, technicalConditions: trackingConditions, schedulingNote: null,
  },
  {
    serviceId: "business-website", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One WordPress website in one language, up to five pages: Home, About, Services, Portfolio/Gallery and Contact.", "Equivalent page substitutions are allowed without increasing quantity or complexity.", "Responsive layout, simple content editor and contact links.", "Basic SEO: page metadata, heading structure, sitemap and robots.", "Basic analytics: page-visit measurement through GA4/GTM; custom events excluded."], ["Satu website WordPress dalam satu bahasa, maksimal lima halaman: Beranda, Tentang, Layanan, Portofolio/Galeri, dan Kontak.", "Penggantian halaman yang setara diperbolehkan tanpa menambah jumlah atau kompleksitas.", "Layout responsif, editor konten sederhana, dan tautan kontak.", "SEO dasar: metadata halaman, struktur heading, sitemap, dan robots.", "Analitik dasar: pengukuran kunjungan halaman melalui GA4/GTM; event khusus tidak termasuk."]),
    tools: local(["WordPress", "GA4 and GTM for basic page-visit measurement"], ["WordPress", "GA4 dan GTM untuk pengukuran kunjungan halaman dasar"]),
    outputs: local(["Published website on customer-owned compatible hosting.", "Administrator access and a text/image editing guide."], ["Website dipublikasikan pada hosting kompatibel milik klien.", "Akses administrator dan panduan penyuntingan teks/gambar."]),
    illustrations: local(["Illustrative site structure: Home / About / Services / Portfolio or Gallery / Contact. Equivalent substitutions stay within five pages and the same complexity."], ["Ilustrasi struktur website: Beranda / Tentang / Layanan / Portofolio atau Galeri / Kontak. Penggantian setara tetap dalam lima halaman dengan kompleksitas yang sama."]),
    exclusions: local(["Domain, hosting, full content writing, premium assets and custom integrations.", "Next.js business websites require an inquiry/custom offer."], ["Domain, hosting, penulisan seluruh konten, aset premium, dan integrasi khusus.", "Website bisnis Next.js memerlukan inquiry/penawaran khusus."]),
    duration: local("10–15 business days.", "10–15 hari kerja."),
    revisions: local("Two in-scope revision rounds.", "Dua ronde revisi dalam cakupan."),
    briefFields: [
      field("business_goal", "Business goal", "Tujuan bisnis", "Explain the purpose of this website.", "Jelaskan tujuan website ini."),
      field("selected_pages", "Selected pages", "Halaman pilihan", "Confirm up to five default or equivalent pages without additional complexity.", "Konfirmasikan maksimal lima halaman bawaan atau pengganti setara tanpa kompleksitas tambahan."),
      field("final_text", "Final text", "Teks final", "Prepare the final page copy in the selected output language.", "Siapkan teks final halaman dalam bahasa hasil yang dipilih."),
      field("brand_images", "Authorized brand assets and images", "Aset merek dan gambar berizin", "Prepare assets you own or are authorized to use.", "Siapkan aset milik Anda atau yang penggunaannya diizinkan."),
      field("public_contacts", "Public contact details", "Kontak publik", "Confirm contact information approved for publication.", "Konfirmasikan informasi kontak yang boleh dipublikasikan."),
      field("domain", "Customer-owned domain", "Domain milik klien", "Confirm your domain and authorized access readiness without sharing credentials in the brief.", "Konfirmasikan domain dan kesiapan izin akses tanpa membagikan credentials dalam brief."),
      field("hosting_readiness", "Compatible hosting readiness", "Kesiapan hosting kompatibel", "Confirm customer-owned hosting supports WordPress and authorized deployment access is available.", "Konfirmasikan hosting milik klien mendukung WordPress dan izin akses deployment tersedia."),
    ],
    technicalConditions: local(["Requires compatible customer-owned WordPress hosting and an available domain. Domain/hosting purchases and subscriptions are not included.", "Next.js, custom integrations or increased complexity require inquiry/custom-offer work."], ["Membutuhkan hosting WordPress kompatibel milik klien dan domain yang tersedia. Pembelian domain/hosting dan langganan tidak termasuk.", "Next.js, integrasi khusus, atau peningkatan kompleksitas memerlukan inquiry/penawaran khusus."]),
    schedulingNote: null,
  },
  {
    serviceId: "seo-audit-roadmap", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One website, up to 30 priority URLs and ten keyword themes.", "Review indexing, sitemap/robots, metadata, headings, internal linking and content opportunities."], ["Satu website, maksimal 30 URL prioritas dan sepuluh tema kata kunci.", "Tinjau indexing, sitemap/robots, metadata, heading, internal linking, dan peluang konten."]),
    tools: local(["Browser and sitemap", "Google Search Console (GSC) / GA4 where available"], ["Browser dan sitemap", "Google Search Console (GSC) / GA4 jika tersedia"]),
    outputs: local(["One PDF report plus a prioritized action spreadsheet.", "Explanation of unavailable data and assessment limitations."], ["Satu laporan PDF beserta spreadsheet tindakan berprioritas.", "Penjelasan data yang tidak tersedia dan batas penilaian."]),
    illustrations: local(["Illustrative structure: reviewed URL/topic → finding → priority → recommended action. The report states data limitations."], ["Struktur ilustratif: URL/topik ditinjau → temuan → prioritas → tindakan yang disarankan. Laporan menjelaskan batas data."]),
    exclusions: local(["Implementation of audit recommendations."], ["Implementasi rekomendasi audit."]),
    duration: local("Five business days.", "Lima hari kerja."),
    revisions: local("One report correction/clarification round.", "Satu ronde koreksi/klarifikasi laporan."),
    briefFields: seoFields, technicalConditions: local(["GSC/GA4 access improves the assessment but is not mandatory; unavailable data and limitations are documented."], ["Akses GSC/GA4 membantu penilaian, tetapi tidak wajib; data yang tidak tersedia dan keterbatasan dicatat."]), schedulingNote: null,
  },
  {
    serviceId: "seo-foundation", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: true,
    scope: local(["One compatible WordPress website OR Next.js website with available source/deployment access.", "Up to five target pages.", "Brief audit, sitemap/robots, titles/descriptions, headings and basic internal linking."], ["Satu website WordPress kompatibel ATAU website Next.js dengan akses source/deployment tersedia.", "Maksimal lima halaman sasaran.", "Audit singkat, sitemap/robots, judul/deskripsi, heading, dan internal linking dasar."]),
    tools: local(["WordPress or Next.js website/source/deployment access", "Browser, sitemap and GSC/GA4 where available"], ["Akses website/source/deployment WordPress atau Next.js", "Browser, sitemap, serta GSC/GA4 jika tersedia"]),
    outputs: local(["Implemented changes and a per-page change list.", "Before/after checking evidence."], ["Perubahan diterapkan beserta daftar perubahan per halaman.", "Bukti pemeriksaan sebelum/sesudah."]),
    illustrations: local(["Illustrative change list: target page → approved change → implementation → before/after check. This is a handover structure, not a ranking claim."], ["Ilustrasi daftar perubahan: halaman sasaran → perubahan disetujui → implementasi → pemeriksaan sebelum/sesudah. Ini struktur handover, bukan klaim ranking."]),
    exclusions: local(["Major development, migrations, broad content writing, link building and unsupported platforms."], ["Pengembangan besar, migrasi, penulisan konten menyeluruh, link building, dan platform yang tidak didukung."]),
    duration: local("7–10 business days.", "7–10 hari kerja."),
    revisions: local("One in-scope correction round.", "Satu ronde koreksi dalam cakupan."),
    briefFields: [...seoFields,
      field("target_pages", "Five target pages", "Lima halaman sasaran", "Confirm the pages authorized for the changes, up to five.", "Konfirmasikan halaman yang boleh diubah, maksimal lima."),
      field("platform", "Website platform", "Platform website", "Identify WordPress or Next.js and relevant technical constraints.", "Tentukan WordPress atau Next.js beserta batas teknis yang relevan."),
      field("authorized_access", "Authorized website/source/deployment access", "Izin akses website/source/deployment", "Confirm secure access readiness without passwords or API keys in this brief.", "Konfirmasikan kesiapan akses aman tanpa password atau API key dalam brief."),
      field("change_approval", "Change approval", "Persetujuan perubahan", "Confirm who can approve the proposed changes.", "Konfirmasikan siapa yang dapat menyetujui perubahan yang diusulkan."),
    ],
    technicalConditions: local(["Owner-controlled compatibility approval is required before payment; a customer declaration alone is not a technical check.", "Only compatible WordPress or Next.js with authorized source/deployment access is supported. Unsupported requirements use inquiry/custom offer."], ["Persetujuan kompatibilitas oleh owner wajib sebelum pembayaran; pernyataan klien saja bukan pemeriksaan teknis.", "Hanya WordPress atau Next.js kompatibel dengan izin akses source/deployment yang didukung. Kebutuhan yang tidak didukung menggunakan inquiry/penawaran khusus."]), schedulingNote: null,
  },
  {
    serviceId: "ads-tracking", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One website, one GA4 property and one GTM container, up to eight agreed events.", "Meta Pixel OR Google Ads tracking, not both.", "Browser-side tracking."], ["Satu website, satu property GA4, dan satu container GTM, maksimal delapan event yang disepakati.", "Meta Pixel ATAU tracking Google Ads, bukan keduanya.", "Tracking melalui browser."]),
    tools: local(["GA4 and GTM", "Meta Pixel OR Google Ads"], ["GA4 dan GTM", "Meta Pixel ATAU Google Ads"]),
    outputs: local(["Event definitions, configuration and test evidence.", "Handover guide."], ["Definisi event, konfigurasi, dan bukti pengujian.", "Panduan handover."]),
    illustrations: local(["Illustrative handover: event → agreed browser action → selected advertising platform → testing evidence. Your selected events define the actual setup."], ["Ilustrasi handover: event → aktivitas browser disepakati → platform iklan pilihan → bukti pengujian. Event pilihan Anda menentukan konfigurasi aktual."]),
    exclusions: local(["Advertising management, server-side tracking/CAPI and custom integrations."], ["Pengelolaan iklan, tracking server/CAPI, dan integrasi khusus."]),
    duration: local("5–7 business days.", "5–7 hari kerja."),
    revisions: local("One in-scope adjustment round.", "Satu ronde penyesuaian dalam cakupan."),
    briefFields: [...trackingFields, field("advertising_platform", "Meta OR Google Ads", "Meta ATAU Google Ads", "Choose one advertising platform and confirm authorized access readiness.", "Pilih satu platform iklan dan konfirmasikan kesiapan izin akses.")],
    technicalConditions: trackingConditions, schedulingNote: null,
  },
  {
    serviceId: "career-consultation", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One career direction or target position.", "One 45-minute online consultation; clarification during the session."], ["Satu arah karier atau posisi sasaran.", "Satu konsultasi online selama 45 menit; klarifikasi dilakukan selama sesi."]),
    tools: local(["Google Meet"], ["Google Meet"]),
    outputs: local(["The 45-minute consultation session."], ["Sesi konsultasi 45 menit."]),
    illustrations: local(["Illustrative discussion structure: current situation → target position → priority questions → next actions. No written report is included."], ["Struktur diskusi ilustratif: kondisi saat ini → posisi sasaran → pertanyaan prioritas → langkah berikutnya. Laporan tertulis tidak termasuk."]),
    exclusions: local(["Written reports, recordings, CV writing and extra sessions."], ["Laporan tertulis, rekaman, penulisan CV, dan sesi tambahan."]),
    duration: local("One 45-minute session.", "Satu sesi 45 menit."),
    revisions: local("Clarification takes place during the session; additional sessions are excluded.", "Klarifikasi dilakukan selama sesi; sesi tambahan tidak termasuk."),
    briefFields: [
      field("target_position", "Target position or direction", "Posisi atau arah sasaran", "Identify one career direction or target position.", "Tentukan satu arah karier atau posisi sasaran."),
      field("current_situation", "Current situation", "Kondisi saat ini", "Describe your current career situation.", "Jelaskan kondisi karier Anda saat ini."),
      field("main_questions", "Main questions", "Pertanyaan utama", "List the questions to prioritize during 45 minutes.", "Cantumkan pertanyaan yang diprioritaskan selama 45 menit."),
      field("relevant_cv", "CV, if relevant", "CV, jika relevan", "Prepare your CV if useful to the discussion; secure submission is coordinated separately.", "Siapkan CV jika diperlukan untuk diskusi; pengiriman aman dikoordinasikan terpisah.", false),
      sessionFields[5],
    ],
    technicalConditions: local([], []), schedulingNote: scheduling,
  },
  {
    serviceId: "cv-review", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One CV, maximum two pages, one language and one target position.", "Review structure, experience clarity, relevance and wording."], ["Satu CV, maksimal dua halaman, satu bahasa, dan satu posisi sasaran.", "Review struktur, kejelasan pengalaman, relevansi, dan pilihan kata."]),
    tools: local(["Customer CV in PDF or DOCX"], ["CV klien dalam PDF atau DOCX"]),
    outputs: local(["One feedback document with practical improvements and example wording for priority sections."], ["Satu dokumen feedback berisi perbaikan praktis dan contoh pilihan kata untuk bagian prioritas."]),
    illustrations: local(["Illustrative feedback structure: CV section → issue → practical improvement → example wording. Examples must use the customer's facts."], ["Struktur feedback ilustratif: bagian CV → masalah → perbaikan praktis → contoh pilihan kata. Contoh harus menggunakan fakta klien."]),
    exclusions: local(["Complete rewriting, visual design, translation, LinkedIn and cover letters."], ["Penulisan ulang lengkap, desain visual, penerjemahan, LinkedIn, dan surat lamaran."]),
    duration: local("2–3 business days.", "2–3 hari kerja."), revisions: clarification,
    briefFields: cvFields, technicalConditions: local([], []), schedulingNote: null,
  },
  {
    serviceId: "cv-rewrite-optimization", specificationVersion: DIRECT_PACKAGE_VERSION, compatibilityApproval: false,
    scope: local(["One CV, maximum two pages, one language and one target position.", "Rewrite and improve structure using the customer's factual information."], ["Satu CV, maksimal dua halaman, satu bahasa, dan satu posisi sasaran.", "Tulis ulang dan perbaiki struktur menggunakan informasi faktual klien."]),
    tools: local(["Customer-provided factual career information"], ["Informasi karier faktual yang disediakan klien"]),
    outputs: local(["One CV version in DOCX and PDF with simple formatting."], ["Satu versi CV dalam DOCX dan PDF dengan format sederhana."]),
    illustrations: local(["Illustrative structure: profile → experience → education → relevant skills. Contents depend on supplied factual history; achievements are never invented."], ["Struktur ilustratif: profil → pengalaman → pendidikan → keterampilan relevan. Isi mengikuti riwayat faktual yang diberikan; pencapaian tidak dibuat-buat."]),
    exclusions: local(["Visual design, translation, LinkedIn, cover letters and invented achievements."], ["Desain visual, penerjemahan, LinkedIn, surat lamaran, dan pencapaian yang dibuat-buat."]),
    duration: local("3–5 business days.", "3–5 hari kerja."),
    revisions: local("One revision round based on previously supplied information.", "Satu ronde revisi berdasarkan informasi yang sebelumnya diberikan."),
    briefFields: [...cvFields, field("factual_history", "Factual history, responsibilities and achievements", "Riwayat, tanggung jawab, dan pencapaian faktual", "Provide sufficient factual details for the rewrite. Do not include invented achievements.", "Sampaikan fakta yang cukup untuk penulisan ulang. Jangan menyertakan pencapaian yang dibuat-buat.")],
    technicalConditions: local([], []), schedulingNote: null,
  },
]

export const directPackageRules = {
  exclusions: local(
    ["Domain, hosting, premium assets/plugins, subscriptions, third-party services and advertising budgets unless expressly included."],
    ["Domain, hosting, aset/plugin premium, langganan, layanan pihak ketiga, dan anggaran iklan kecuali secara eksplisit termasuk."],
  ),
  timing: local("Business-day estimates exclude Indonesian public holidays and time waiting for materials, access, feedback or approval.", "Estimasi hari kerja tidak menghitung libur nasional Indonesia serta waktu menunggu materi, akses, feedback, atau persetujuan."),
  revisions: local("One revision round means one consolidated feedback submission. Existing cancellation, refund, rescheduling and no-show policies remain applicable.", "Satu ronde revisi berarti satu pengajuan feedback terpadu. Kebijakan pembatalan, refund, penjadwalan ulang, dan ketidakhadiran yang berlaku tetap digunakan."),
  workStart: local("Payment is 100% upfront. Work starts only after verified payment AND an admin-approved complete brief. Brief submission/admin approval is coordinated separately; its interface is not yet available.", "Pembayaran 100% di muka. Pekerjaan dimulai hanya setelah pembayaran terverifikasi DAN brief lengkap disetujui admin. Pengiriman brief/persetujuan admin dikoordinasikan terpisah; antarmukanya belum tersedia."),
  ownership: local("The customer owns their domain, hosting, website, analytics and advertising accounts. Do not send passwords or API keys through ordinary brief fields.", "Klien memiliki domain, hosting, website, akun analitik, dan akun iklannya. Jangan mengirim password atau API key melalui isian brief biasa."),
  guarantee: local("No guarantee of ranking, revenue, conversion or employment.", "Tidak ada jaminan ranking, pendapatan, konversi, atau penerimaan kerja."),
  costs: local("The checkout total is the stated package price, paid 100% upfront. Gateway fees are absorbed by Adam’s Work with no customer surcharge. Adam’s Work is not yet PKP; no PPN is added and the commercial invoice is not a Faktur Pajak. Excluded third-party costs require separate customer approval; no additional purchase or charge without approval.", "Total checkout adalah harga paket yang tercantum, dibayar 100% di muka. Biaya gateway ditanggung Adam’s Work tanpa tambahan biaya kepada klien. Adam’s Work belum PKP; tidak ada penambahan PPN dan invoice komersial bukan Faktur Pajak. Biaya pihak ketiga yang dikecualikan memerlukan persetujuan klien terpisah; tidak ada pembelian atau biaya tambahan tanpa persetujuan."),
  outputLanguage: local("Deliverables use one selected language: English or Indonesian. A bilingual interface does not include bilingual deliverables.", "Hasil kerja menggunakan satu bahasa pilihan: English atau Indonesia. Antarmuka bilingual tidak mencakup hasil kerja bilingual."),
}

export function findDirectPackage(serviceId: string) {
  return directPackages.find(item => item.serviceId === serviceId) ?? null
}

export function directPackageTerms(serviceId: string, contractLocale: PublicLocale, outputLanguage: PublicLocale): TransactionTerms | null {
  if (!["en", "id"].includes(contractLocale) || !["en", "id"].includes(outputLanguage)) return null
  const spec = findDirectPackage(serviceId), service = catalogServices.find(item => item.id === serviceId)
  if (!spec || !service || service.price.kind !== "fixed" || service.price.interval !== "once") return null
  const languageLabel = contractLocale === "en" ? (outputLanguage === "en" ? "English" : "Indonesian") : (outputLanguage === "en" ? "English" : "Indonesia")
  return {
    service_id: service.id, package_id: service.id + ":standard", service_name: service.name[contractLocale], amount_idr: service.price.amount, currency: "IDR",
    scope: [...spec.scope[contractLocale], directPackageRules.outputLanguage[contractLocale], contractLocale === "en" ? "Selected output language: " + languageLabel : "Bahasa hasil pilihan: " + languageLabel],
    deliverables: [...spec.outputs[contractLocale]], exclusions: [...spec.exclusions[contractLocale], ...directPackageRules.exclusions[contractLocale]],
    requirements: [...spec.briefFields.map(item => item.label[contractLocale] + (item.required ? "" : contractLocale === "en" ? " (if relevant)" : " (jika relevan)") + ": " + item.instruction[contractLocale]), directPackageRules.workStart[contractLocale], directPackageRules.ownership[contractLocale]],
    estimated_duration: spec.duration[contractLocale] + " " + directPackageRules.timing[contractLocale],
    revision_rule: { description: spec.revisions[contractLocale] + " " + directPackageRules.revisions[contractLocale] },
    milestones: [{ label: contractLocale === "en" ? "Complete approved package work and handover (work allocation, not an installment)" : "Seluruh pekerjaan paket dan handover yang disetujui (pembagian pekerjaan, bukan cicilan)", amount_idr: service.price.amount }],
    cost_disclosure: directPackageRules.costs[contractLocale],
    specification_version: DIRECT_PACKAGE_VERSION, output_language: outputLanguage, tools: [...spec.tools[contractLocale]],
    brief_fields: spec.briefFields.map(item => ({ id: item.id, label: item.label[contractLocale], instruction: item.instruction[contractLocale], required: item.required })),
    technical_conditions: [...spec.technicalConditions[contractLocale], directPackageRules.guarantee[contractLocale]],
    ...(spec.schedulingNote ? { scheduling_note: spec.schedulingNote[contractLocale] } : {}),
  }
}
