import type { Locale } from "../lib/commerce/rules"

export const workspaceCopy = {
  title: ["Order workspace", "Ruang kerja pesanan"], ownerOrders: ["Manage orders", "Kelola pesanan"],
  reference: ["Order reference", "Referensi pesanan"], client: ["Client", "Klien"], amount: ["Agreed total", "Total disepakati"],
  next: ["Your next step", "Langkah berikutnya"], pay: ["Pay / resume payment", "Bayar / lanjutkan pembayaran"],
  payHelp: ["Complete payment before preparing and submitting the brief. Browser payment callbacks do not verify payment.", "Selesaikan pembayaran sebelum menyiapkan dan mengirim brief. Callback pembayaran browser tidak memverifikasi pembayaran."],
  ownerPay: ["Awaiting client payment", "Menunggu pembayaran klien"],
  completeBrief: ["Complete your brief", "Lengkapi brief"], briefHelp: ["Save your answers as a draft, then submit the completed brief for owner review.", "Simpan jawaban sebagai draft, lalu kirim brief lengkap untuk diperiksa owner."],
  waitBrief: ["Awaiting client brief", "Menunggu brief klien"],
  waitReview: ["Awaiting owner review", "Menunggu pemeriksaan owner"], waitReviewHelp: ["Your submitted brief is read-only while the owner reviews it. Work has not started.", "Brief yang dikirim tidak dapat diedit selama owner memeriksanya. Pekerjaan belum dimulai."],
  review: ["Review submitted brief", "Periksa brief yang dikirim"], reviewHelp: ["Check the agreed mandatory inputs and private attachments. Technical compatibility approval is separate from brief approval.", "Periksa masukan wajib yang disepakati dan lampiran private. Persetujuan kompatibilitas teknis berbeda dari persetujuan brief."],
  amend: ["Update your brief", "Perbaiki brief"], amendHelp: ["Follow the owner's notes, update your answers, then resubmit for review.", "Ikuti catatan owner, perbaiki jawaban, lalu kirim ulang untuk diperiksa."],
  waitAmend: ["Awaiting updated client brief", "Menunggu perbaikan brief klien"],
  waitStart: ["Awaiting work start", "Menunggu pekerjaan dimulai"], waitStartHelp: ["The brief is approved. The owner starts work separately after checking verified payment and the approved brief.", "Brief disetujui. Owner memulai pekerjaan secara terpisah setelah memeriksa pembayaran terverifikasi dan brief yang disetujui."],
  start: ["Start work", "Mulai pekerjaan"], inProgress: ["Work is in progress", "Pekerjaan sedang berlangsung"],
  progressHelp: ["Keep the accepted agreement and recorded work status as your reference. This batch does not include delivery or order messaging.", "Gunakan kesepakatan yang disetujui dan status pekerjaan tercatat sebagai acuan. Batch ini belum mencakup delivery atau pesan pesanan."],
  completed: ["Order completed", "Pesanan selesai"], cancelled: ["Order cancelled", "Pesanan dibatalkan"],
  brief: ["Brief and requirements", "Brief dan kebutuhan"], revision: ["Brief revision", "Versi brief"],
  contractLanguage: ["Original contract language", "Bahasa kontrak asli"], outputLanguage: ["Selected output language", "Bahasa hasil pilihan"], outputUnknown: ["As stated in the accepted agreement", "Sesuai kesepakatan yang disetujui"],
  originalInputs: ["Requirements below come from your accepted snapshot and retain its original language.", "Kebutuhan di bawah berasal dari snapshot yang disetujui dan tetap dalam bahasa aslinya."],
  noSecrets: ["Do not enter passwords, API keys or other credentials in answers or attachments. Coordinate authorized account access through an agreed secure channel.", "Jangan masukkan password, API key, atau credentials lainnya dalam jawaban atau lampiran. Koordinasikan izin akses akun melalui kanal aman yang disepakati."],
  required: ["Required", "Wajib"], optional: ["Optional", "Opsional"], save: ["Save draft", "Simpan draft"], submit: ["Submit for review", "Kirim untuk diperiksa"],
  saving: ["Processing…", "Memproses…"], readOnly: ["Submitted and approved briefs cannot be edited by the client. The owner can request changes when needed.", "Brief yang dikirim dan disetujui tidak dapat diedit klien. Owner dapat meminta perbaikan bila diperlukan."],
  unpaidBrief: ["Brief editing and uploads become available after server-verified payment.", "Penyuntingan brief dan unggahan tersedia setelah pembayaran terverifikasi server."],
  ownerNote: ["Owner's review note", "Catatan pemeriksaan owner"], noAnswer: ["No answer saved yet.", "Belum ada jawaban tersimpan."],
  reviewTitle: ["Owner brief review", "Pemeriksaan brief oleh owner"], decision: ["Review decision", "Keputusan pemeriksaan"], chooseDecision: ["Choose a decision", "Pilih keputusan"],
  approve: ["Approve complete brief", "Setujui brief lengkap"], requestChanges: ["Request changes", "Minta perbaikan"], note: ["Review note (required for changes)", "Catatan pemeriksaan (wajib untuk perbaikan)"],
  saveReview: ["Save review decision", "Simpan keputusan pemeriksaan"], startGuard: ["Starting work requires Paid with verified payment evidence and an approved brief. The server rechecks these conditions atomically.", "Memulai pekerjaan membutuhkan status Dibayar dengan bukti pembayaran terverifikasi dan brief disetujui. Server memeriksa ulang syarat tersebut secara atomik."],
  startedAt: ["Work started", "Pekerjaan dimulai"],
  attachments: ["Private brief attachments", "Lampiran brief private"], attachmentHelp: ["Optional supporting files only; no new attachment requirement is added to your agreement. PDF, JPEG, PNG, WebP, TXT, CSV, DOCX or XLSX; maximum 10 MiB per file. Files stay private and are validated before download access. Malware scanning is not provided.", "Hanya file pendukung opsional; tidak ada kewajiban lampiran baru dalam kesepakatan. PDF, JPEG, PNG, WebP, TXT, CSV, DOCX, atau XLSX; maksimal 10 MiB per file. File tetap private dan divalidasi sebelum dapat diunduh. Pemindaian malware tidak tersedia."],
  saveBeforeUpload: ["Save your draft before uploading files. Changing the brief during an upload can make the upload stale.", "Simpan draft sebelum mengunggah file. Perubahan brief selama unggahan dapat membuat unggahan kedaluwarsa."],
  chooseFile: ["Choose a supporting file", "Pilih file pendukung"], upload: ["Upload private file", "Unggah file private"], download: ["Download", "Unduh"], remove: ["Remove attachment", "Hapus lampiran"],
  uploading: ["Uploading and validating…", "Mengunggah dan memvalidasi…"], uploaded: ["File validated and ready.", "File tervalidasi dan siap."], fileError: ["The file action could not be completed. Check format/size and reload if the brief changed; no payment status was changed.", "Tindakan file belum berhasil. Periksa format/ukuran dan muat ulang jika brief berubah; status pembayaran tidak diubah."],
  noFiles: ["No ready attachments.", "Belum ada lampiran siap."], fileUnavailable: ["Attachment unavailable", "Lampiran belum tersedia"], removed: ["Attachment removed from the brief.", "Lampiran dihapus dari brief."],
  filePending: ["Pending validation; cannot be downloaded", "Menunggu validasi; belum dapat diunduh"], fileQuarantined: ["Validation failed; cannot be downloaded", "Validasi gagal; tidak dapat diunduh"], finalize: ["Validate uploaded file", "Validasi file yang diunggah"],
  history: ["Brief and review history", "Riwayat brief dan pemeriksaan"], noHistory: ["No submissions or reviews recorded yet.", "Belum ada pengiriman atau pemeriksaan tercatat."], responseHistory: ["Answers in this revision", "Jawaban dalam versi ini"],
  ownerActor: ["Owner", "Owner"], clientActor: ["Client", "Klien"],
  saved: ["Draft saved.", "Draft tersimpan."], submitted: ["Brief submitted for owner review.", "Brief dikirim untuk pemeriksaan owner."], changes_requested: ["Changes requested. The client can update and resubmit.", "Perbaikan diminta. Klien dapat memperbaiki dan mengirim ulang."], approved: ["Brief approved. Work has not automatically started.", "Brief disetujui. Pekerjaan tidak otomatis dimulai."], started: ["Work start recorded.", "Awal pekerjaan tercatat."],
  stale: ["This brief changed in another request. Reload and review the latest revision before trying again.", "Brief berubah melalui permintaan lain. Muat ulang dan tinjau versi terbaru sebelum mencoba kembali."], invalid: ["Check required answers and your review note. No change was saved.", "Periksa jawaban wajib dan catatan pemeriksaan. Perubahan belum tersimpan."], unavailable: ["The workspace is temporarily unavailable. Reload or contact Adam's Work; your payment and agreement remain unchanged.", "Ruang kerja sementara tidak tersedia. Muat ulang atau hubungi Adam's Work; pembayaran dan kesepakatan tidak berubah."],
} as const
export function workspaceText(key: keyof typeof workspaceCopy, locale: Locale) { return workspaceCopy[key][locale === "en" ? 0 : 1] }
export type WorkspaceNextStep = "pay" | "completeBrief" | "waitBrief" | "waitReview" | "review" | "amend" | "waitAmend" | "waitStart" | "start" | "inProgress" | "completed" | "cancelled" | "ownerPay"
export function workspaceNextStep(payment: string, brief: string, work: string, asOwner = false, verified = false): WorkspaceNextStep {
  if (work === "cancelled") return "cancelled"
  if (work === "completed") return "completed"
  if (["in_progress", "delivered", "revision"].includes(work)) return "inProgress"
  if (payment !== "paid") return asOwner ? "ownerPay" : "pay"
  if (brief === "approved") return asOwner && verified ? "start" : "waitStart"
  if (brief === "submitted") return asOwner ? "review" : "waitReview"
  if (brief === "changes_requested") return asOwner ? "waitAmend" : "amend"
  return asOwner ? "waitBrief" : "completeBrief"
}
export const briefEventLabels: Record<string, readonly [string, string]> = {
  draft_saved: ["Draft saved", "Draft tersimpan"], saved: ["Draft saved", "Draft tersimpan"], submitted: ["Submitted for review", "Dikirim untuk diperiksa"],
  changes_requested: ["Changes requested", "Perbaikan diminta"], approved: ["Brief approved", "Brief disetujui"], work_started: ["Work started", "Pekerjaan dimulai"],
}
