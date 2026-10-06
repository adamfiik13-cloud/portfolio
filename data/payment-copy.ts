export const paymentCopy = {
  en: {
    notice: "Real online payments remain unavailable. Sandbox testing is available only on eligible staging orders.",
    title: "Sandbox payment — testing only", intro: "Pay the full agreed order amount using Midtrans Sandbox. Do not use real payment credentials. Payment does not start work; an admin-approved complete brief is also required.",
    pay: "Pay / resume Sandbox payment", check: "Check payment status", busy: "Checking…", unavailable: "Sandbox payment is unavailable. Try checking the status later; do not create another order.",
    uncertain: "The payment attempt is being created or its result is uncertain. Check its status before retrying. An unresolved attempt may need operator review.",
    unselected: "No provider status is available yet. Before selecting a payment method, this is expected and does not mean payment failed.",
    verified: "The server has verified payment. Work still requires an admin-approved complete brief.", checked: "Payment status checked against Midtrans. Review the updated order status.",
    callback: "The payment popup closed or returned a result. Check payment status for server verification.",
  },
  id: {
    notice: "Pembayaran online asli tetap belum tersedia. Pengujian Sandbox hanya tersedia pada pesanan staging yang memenuhi syarat.",
    title: "Pembayaran Sandbox — hanya pengujian", intro: "Bayar seluruh nilai pesanan yang disepakati melalui Midtrans Sandbox. Jangan gunakan kredensial pembayaran asli. Pembayaran tidak memulai pekerjaan; brief lengkap yang disetujui admin juga diperlukan.",
    pay: "Bayar / lanjutkan pembayaran Sandbox", check: "Periksa status pembayaran", busy: "Memeriksa…", unavailable: "Pembayaran Sandbox tidak tersedia. Periksa status kembali nanti; jangan membuat pesanan baru.",
    uncertain: "Percobaan pembayaran sedang dibuat atau hasilnya belum pasti. Periksa status sebelum mencoba kembali. Percobaan yang belum terselesaikan mungkin memerlukan pemeriksaan operator.",
    unselected: "Status penyedia belum tersedia. Sebelum memilih metode pembayaran, kondisi ini wajar dan tidak berarti pembayaran gagal.",
    verified: "Server telah memverifikasi pembayaran. Pekerjaan tetap memerlukan brief lengkap yang disetujui admin.", checked: "Status pembayaran diperiksa melalui Midtrans. Lihat status pesanan yang diperbarui.",
    callback: "Popup pembayaran ditutup atau mengembalikan hasil. Periksa status pembayaran untuk verifikasi server.",
  },
} as const
