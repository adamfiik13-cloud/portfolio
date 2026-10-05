import type { PolicyContent, PolicyId } from "./config"

export const policiesId: Record<PolicyId, PolicyContent> = {
  "terms": {
    "sections": [
      {
        "id": "terms-1",
        "title": "Identitas dan penerimaan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} adalah nama layanan yang dioperasikan secara independen oleh {{operator}}, berdomisili di {{domicile}} (selanjutnya disebut \"{{brand}}\", \"kami\", atau \"penyedia layanan\")."
          },
          {
            "type": "paragraph",
            "text": "Dengan membuat akun, menyetujui penawaran, membuat pesanan, atau menggunakan layanan berbayar, klien menyatakan telah membaca dan menyetujui versi Ketentuan Layanan, Kebijakan Layanan, Kebijakan Pembayaran/Pembatalan/Refund, Kebijakan Privasi, dan Ketentuan Transaksi yang ditampilkan sebelum pembayaran."
          },
          {
            "type": "paragraph",
            "text": "Penggunaan website untuk melihat informasi tidak dengan sendirinya membentuk pesanan berbayar. Hubungan transaksi terjadi setelah klien menyetujui ringkasan pesanan dan Ketentuan Transaksi yang berlaku."
          }
        ]
      },
      {
        "id": "terms-2",
        "title": "Layanan dan informasi penawaran",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} menyediakan layanan website, SEO, tracking dan analytics, digital advertising, strategi bisnis/marketplace, konsultasi, dan layanan karier sebagaimana dijelaskan dalam katalog."
          },
          {
            "type": "paragraph",
            "text": "Setiap halaman layanan menjelaskan harga atau harga mulai, ruang lingkup, output, kebutuhan klien, pengecualian, serta call to action. Informasi final untuk suatu transaksi terdapat pada Transaction Terms snapshot atau custom offer yang disetujui."
          },
          {
            "type": "paragraph",
            "text": "Label \"Mulai dari\" menunjukkan bahwa harga final ditentukan setelah kebutuhan dan ruang lingkup dibahas. Harga di katalog tidak mencakup pekerjaan, lisensi, budget iklan, domain, hosting, aset premium, tool pihak ketiga, pajak, atau biaya lain kecuali dinyatakan jelas."
          },
          {
            "type": "paragraph",
            "text": "{{brand}} dapat memperbarui katalog dan harga untuk transaksi mendatang. Perubahan tidak berlaku surut terhadap pesanan yang sudah dibayar."
          }
        ]
      },
      {
        "id": "terms-3",
        "title": "Akun dan informasi klien",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien wajib memberikan informasi yang benar, mutakhir, dan memiliki kewenangan untuk melakukan transaksi. Klien bertanggung jawab menjaga keamanan akun dan segera memberitahu kami apabila mengetahui akses tanpa izin."
          },
          {
            "type": "paragraph",
            "text": "Klien tidak boleh menggunakan identitas pihak lain, menyalahgunakan sistem, mengunggah materi yang melanggar hukum, atau memberikan akses yang tidak berhak diberikan."
          }
        ]
      },
      {
        "id": "terms-4",
        "title": "Persetujuan elektronik",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Saat checkout online tersedia, sebelum pembayaran sistem akan menampilkan ringkasan pesanan, harga, ruang lingkup, output, estimasi, revisi, pengecualian, kebijakan pembatalan/refund, dan tautan kebijakan lengkap."
          },
          {
            "type": "paragraph",
            "text": "Dalam alur tersebut, klien harus mencentang kotak persetujuan yang tidak dicentang secara default. Sistem akan menyimpan versi dokumen, waktu persetujuan, bahasa, identitas akun, order snapshot, dan bukti teknis yang wajar."
          },
          {
            "type": "paragraph",
            "text": "Persetujuan marketing terpisah, bersifat opsional, dan bukan syarat membeli layanan."
          }
        ]
      },
      {
        "id": "terms-5",
        "title": "Pembayaran",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Kecuali ditetapkan lain dalam custom offer, pembayaran dilakukan 100% di muka dalam Rupiah sebelum pekerjaan dimulai. Pembayaran online kelak dapat diproses melalui Midtrans atau penyedia lain yang ditampilkan secara resmi oleh {{brand}}. Integrasi pembayaran online belum aktif."
          },
          {
            "type": "paragraph",
            "text": "{{brand}} tidak menyimpan data kartu lengkap. Status pembayaran harus diverifikasi melalui penyedia pembayaran. Pada alur online kelak, konfirmasi server atau webhook penyedia menjadi acuan, bukan hanya screenshot atau halaman sukses pada perangkat klien."
          },
          {
            "type": "paragraph",
            "text": "Biaya pihak ketiga, budget iklan, domain, hosting, lisensi, dan aset berbayar tidak termasuk kecuali tercantum dalam pesanan. Pajak atau biaya yang berlaku akan diinformasikan sebelum pembayaran apabila relevan."
          },
          {
            "type": "paragraph",
            "text": "Pembayaran ganda atau pembayaran yang terbukti salah diproses sesuai Kebijakan Refund dan kemampuan metode pembayaran terkait."
          }
        ]
      },
      {
        "id": "terms-6",
        "title": "Tidak ada jaminan hasil bisnis",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Kami berusaha memberikan layanan dengan kehati-hatian dan kompetensi yang wajar sesuai ruang lingkup. Namun, kami tidak menjamin ranking, traffic, impression, lead, conversion, ROAS, revenue, penjualan, penerimaan kerja, gaji, atau hasil bisnis tertentu."
          },
          {
            "type": "paragraph",
            "text": "Hasil dipengaruhi antara lain oleh pasar, kompetitor, platform, budget, penawaran, harga, kualitas materi, website, proses sales, respons pelanggan, algoritma, kebijakan platform, dan pelaksanaan rekomendasi oleh klien."
          }
        ]
      },
      {
        "id": "terms-7",
        "title": "Kewajiban klien",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien wajib:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "memberikan brief, materi, akses, dan persetujuan secara tepat waktu;",
              "memastikan hak penggunaan atas logo, copy, gambar, video, data, database, akun, dan aset yang diberikan;",
              "memeriksa akurasi informasi bisnis, harga, klaim, kebijakan, dan konten;",
              "menjaga keamanan kredensial dan memberikan tingkat akses minimum yang diperlukan;",
              "melakukan pembayaran tambahan sebelum pekerjaan di luar scope dimulai;",
              "mematuhi kebijakan platform pihak ketiga dan hukum yang berlaku."
            ]
          },
          {
            "type": "paragraph",
            "text": "Keterlambatan atau ketidaklengkapan dari klien dapat menghentikan timeline tanpa dianggap sebagai keterlambatan {{brand}}."
          }
        ]
      },
      {
        "id": "terms-8",
        "title": "Hak kekayaan intelektual",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Setelah seluruh pembayaran terkait dilunasi, klien memperoleh hak penggunaan atas hasil final yang secara khusus dibuat dan diserahkan untuk pesanan tersebut, sejauh tidak dibatasi oleh lisensi pihak ketiga."
          },
          {
            "type": "paragraph",
            "text": "Hak atas metode, pengetahuan, proses, framework, template reusable, komponen generik, library, kode utilitas, internal tools, prompt, sistem kerja, dan material yang sudah dimiliki sebelum proyek tetap pada {{brand}} atau pemilik lisensinya."
          },
          {
            "type": "paragraph",
            "text": "Source file atau editable file hanya termasuk apabila tertulis dalam Transaction Terms. Aset pihak ketiga tetap mengikuti lisensi pemiliknya."
          },
          {
            "type": "paragraph",
            "text": "Klien menjamin bahwa materi yang diberikan tidak melanggar hak pihak lain dan bertanggung jawab atas klaim akibat materi tersebut."
          }
        ]
      },
      {
        "id": "terms-9",
        "title": "Kerahasiaan dan portfolio",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Masing-masing pihak wajib melindungi informasi nonpublik yang diterima untuk menjalankan proyek. Informasi boleh dibagikan kepada specialist collaborator atau penyedia yang benar-benar memerlukannya dan terikat kewajiban kerahasiaan yang relevan."
          },
          {
            "type": "paragraph",
            "text": "Setelah proyek atau hasilnya dipublikasikan, {{brand}} dapat menyebut nama proyek, jenis pekerjaan, visual publik, dan hasil yang telah disetujui sebagai portfolio. Klien dapat meminta opt-out atau ketentuan white-label sebelum pekerjaan dimulai. Kami tidak akan mempublikasikan data rahasia, kredensial, biaya internal, atau data personal klien."
          }
        ]
      },
      {
        "id": "terms-10",
        "title": "Layanan pihak ketiga",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Layanan dapat bergantung pada Vercel, hosting, domain registrar, Google, Meta, analytics, Midtrans, email, storage, atau platform lain. Kami tidak mengendalikan uptime, review, suspend, perubahan API, perubahan harga, atau kebijakan mereka."
          },
          {
            "type": "paragraph",
            "text": "Kami akan mengambil langkah wajar dalam scope untuk mengatasi masalah, tetapi kegagalan murni pihak ketiga tidak otomatis menjadi pelanggaran oleh {{brand}}."
          }
        ]
      },
      {
        "id": "terms-11",
        "title": "Komunikasi elektronik",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien menyetujui komunikasi transaksional melalui email, dashboard, atau kanal resmi yang tercantum pada pesanan. Komunikasi transaksional mencakup pembayaran, brief, progres, permintaan persetujuan, keamanan, revisi, dan hasil."
          },
          {
            "type": "paragraph",
            "text": "Email pemasaran hanya dikirim berdasarkan pilihan terpisah atau dasar lain yang sah, dan dapat dihentikan tanpa memengaruhi layanan aktif."
          }
        ]
      },
      {
        "id": "terms-12",
        "title": "Larangan penggunaan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien tidak boleh menggunakan website atau layanan untuk penipuan, spam, pelanggaran hak pihak lain, malware, eksploitasi sistem, aktivitas ilegal, atau konten yang bertentangan dengan hukum. Kami dapat menunda atau menolak pekerjaan yang berisiko melanggar hukum atau kebijakan platform, dengan penyelesaian biaya berdasarkan pekerjaan yang sudah dilakukan dan biaya non-refundable."
          }
        ]
      },
      {
        "id": "terms-13",
        "title": "Batas tanggung jawab",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Tidak ada klausul yang membatasi hak konsumen atau tanggung jawab yang tidak boleh dibatasi berdasarkan hukum Indonesia."
          },
          {
            "type": "paragraph",
            "text": "Sejauh diizinkan hukum, {{brand}} tidak bertanggung jawab atas kerugian tidak langsung, kehilangan peluang, kehilangan keuntungan yang diharapkan, perubahan algoritma, tindakan pihak ketiga, keputusan platform, atau kerugian akibat informasi/akses yang salah dari klien."
          },
          {
            "type": "paragraph",
            "text": "Tanggung jawab terkait layanan tertentu, sejauh diizinkan hukum, dibatasi pada nilai yang benar-benar dibayar untuk pesanan yang menimbulkan klaim. Batas ini tidak berlaku terhadap kesengajaan, penipuan, pelanggaran kerahasiaan yang terbukti, atau kewajiban lain yang tidak dapat dibatasi secara sah."
          }
        ]
      },
      {
        "id": "terms-14",
        "title": "Pengaduan dan sengketa",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Keluhan dapat dikirim ke {{email}} dengan nomor pesanan dan uraian masalah. Kami akan mengonfirmasi penerimaan dan berusaha menyelesaikan secara musyawarah."
          },
          {
            "type": "paragraph",
            "text": "Ketentuan ini tunduk pada hukum Republik Indonesia. Jika musyawarah gagal, para pihak dapat menggunakan mekanisme penyelesaian sengketa konsumen atau forum lain yang berwenang sesuai hukum. Klausul ini tidak menghapus hak konsumen untuk menggunakan mekanisme yang disediakan peraturan."
          }
        ]
      },
      {
        "id": "terms-15",
        "title": "Perubahan ketentuan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Versi dan tanggal berlaku ditampilkan pada setiap kebijakan. Perubahan berlaku untuk transaksi baru setelah tanggal berlaku. Perubahan material terhadap order aktif memerlukan persetujuan atau addendum dan tidak diterapkan sepihak."
          }
        ]
      },
      {
        "id": "terms-16",
        "title": "Kontak",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} - {{operator}} {{domicile}} Email: {{email}} Website: {{website}}"
          }
        ]
      },
      {
        "id": "terms-hierarchy",
        "title": "Urutan dokumen",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Jika dokumen saling bertentangan, urutan berikut berlaku:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Custom offer atau addendum yang ditandatangani atau disetujui secara elektronik.",
              "Snapshot Ketentuan Transaksi yang melekat pada pesanan terkait.",
              "Versi Kebijakan Layanan dan Kebijakan Pembayaran, Pembatalan, dan Refund yang diterima untuk pesanan tersebut.",
              "Syarat dan Ketentuan Layanan umum ini.",
              "Konten pemasaran umum pada website."
            ]
          },
          {
            "type": "paragraph",
            "text": "Pembaruan website atau kebijakan tidak mengubah pesanan yang sudah dibayar, kecuali kedua pihak secara tegas menyetujui addendum."
          }
        ]
      }
    ]
  },
  "service": {
    "sections": [
      {
        "id": "service-1",
        "title": "Kapan pekerjaan dimulai",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Durasi mulai dihitung setelah seluruh kondisi berikut terpenuhi:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "pembayaran terverifikasi;",
              "mandatory brief dan materi diterima;",
              "akses yang dibutuhkan tersedia;",
              "brief dinyatakan lengkap dan disetujui {{brand}};",
              "untuk ads, campaign dinyatakan siap diluncurkan."
            ]
          }
        ]
      },
      {
        "id": "service-2",
        "title": "Hari kerja dan estimasi",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Hari kerja adalah Senin-Jumat, tidak termasuk hari libur nasional Indonesia. Estimasi bukan jaminan tanggal mutlak. Waktu menunggu materi, akses, feedback, persetujuan, review platform, atau tindakan pihak ketiga tidak dihitung."
          },
          {
            "type": "paragraph",
            "text": "Estimasi standar:"
          },
          {
            "type": "table",
            "headers": [
              "Layanan",
              "Estimasi operasional"
            ],
            "rows": [
              [
                "Landing Page Starter",
                "5-7 hari kerja"
              ],
              [
                "Business Website",
                "10-15 hari kerja"
              ],
              [
                "Custom Website",
                "Sesuai proposal"
              ],
              [
                "SEO Audit & Roadmap",
                "5 hari kerja"
              ],
              [
                "SEO Foundation",
                "7-10 hari kerja"
              ],
              [
                "SEO Growth",
                "Siklus 30 hari, minimum rekomendasi 3 bulan"
              ],
              [
                "Tracking Basic",
                "3-5 hari kerja"
              ],
              [
                "Ads Tracking",
                "5-7 hari kerja"
              ],
              [
                "Advanced Tracking",
                "Mulai 7-14 hari kerja atau sesuai proposal"
              ],
              [
                "Meta/Google Ads",
                "Siklus pengelolaan 30 hari"
              ],
              [
                "Integrated Ads",
                "Sesuai proposal/siklus"
              ],
              [
                "Digital Business Consultation",
                "Sesi 60 menit"
              ],
              [
                "Marketing/Marketplace Audit",
                "Sesi 60 menit + catatan maksimal 2 hari kerja"
              ],
              [
                "Marketplace Growth Plan",
                "5-7 hari kerja"
              ],
              [
                "Career Consultation",
                "Sesi 45 menit"
              ],
              [
                "CV Review",
                "2-3 hari kerja"
              ],
              [
                "CV Rewrite & Optimization",
                "3-5 hari kerja"
              ]
            ]
          }
        ]
      },
      {
        "id": "service-3",
        "title": "Revisi",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Satu ronde revisi adalah satu kumpulan feedback terhadap satu versi yang dikirim sekaligus. Feedback tambahan setelah pengerjaan revisi dimulai dapat dihitung sebagai ronde berikutnya."
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Landing Page Starter: 2 ronde.",
              "Business Website: 2 ronde.",
              "Tracking Basic dan Ads Tracking: 1 ronde untuk penyesuaian dalam scope.",
              "SEO Audit/Foundation, Marketplace Growth Plan, dan CV Rewrite: 1 ronde atau koreksi sesuai scope.",
              "Konsultasi, CV Review, dan layanan monthly optimization menggunakan model klarifikasi/review prioritas, bukan revisi tanpa batas.",
              "Custom Website dan Advanced/Integrated services mengikuti proposal."
            ]
          },
          {
            "type": "paragraph",
            "text": "Perubahan tujuan, struktur, fitur, platform, integrasi, audience, atau materi utama dapat menjadi scope tambahan. Revisi tambahan dibuat sebagai penawaran tambahan dan dikerjakan setelah disetujui serta dibayar."
          }
        ]
      },
      {
        "id": "service-4",
        "title": "Masa review dan selesai otomatis",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien memiliki 5 hari kerja sejak hasil atau versi review disampaikan untuk menyetujui atau mengirim satu kumpulan feedback. Kami mengirim pengingat sebelum batas waktu berakhir."
          },
          {
            "type": "paragraph",
            "text": "Jika tidak ada respons, hasil dianggap diterima dan pesanan dapat berstatus selesai. Feedback yang dikirim tepat waktu tetap diproses. Penyelesaian otomatis tidak menghapus kewajiban memperbaiki kesalahan teknis yang terbukti berasal dari implementasi kami dalam scope."
          }
        ]
      },
      {
        "id": "service-5",
        "title": "Ketidakaktifan klien",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Timeline dijeda ketika klien belum memberikan materi, akses, feedback, atau persetujuan. Setelah dua pengingat dan 14 hari tanpa respons, proyek dapat diarsipkan. Reaktivasi mengikuti kapasitas, jadwal, kondisi teknis, dan biaya tambahan yang diinformasikan terlebih dahulu jika diperlukan."
          }
        ]
      },
      {
        "id": "service-6",
        "title": "Konsultasi",
        "blocks": [
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Reschedule tanpa biaya jika diminta minimal 6 jam sebelum sesi.",
              "Perubahan kurang dari 6 jam atau no-show mendapat satu kesempatan reschedule.",
              "Jika kembali no-show atau terlambat membatalkan, sesi dianggap selesai tanpa refund.",
              "Jika {{brand}} membatalkan, klien dapat memilih jadwal baru atau refund penuh.",
              "Keterlambatan klien tidak otomatis memperpanjang sesi.",
              "Klarifikasi singkat bukan sesi konsultasi tambahan."
            ]
          }
        ]
      },
      {
        "id": "service-7",
        "title": "Handover dan support",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Handover mencakup output yang tertulis dalam Transaction Terms. Maintenance, update berkala, hosting management, support tanpa batas, dan perubahan setelah selesai tidak termasuk kecuali dinyatakan jelas."
          }
        ]
      }
    ]
  },
  "refund": {
    "sections": [
      {
        "id": "refund-1",
        "title": "Pembayaran",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Pembayaran standar adalah 100% di muka. Pekerjaan tambahan dibayar sebelum dikerjakan. Custom offer dapat menetapkan skema lain secara tertulis."
          }
        ]
      },
      {
        "id": "refund-2",
        "title": "Refund penuh",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Refund penuh tersedia apabila:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "{{brand}} membatalkan sebelum pekerjaan dimulai;",
              "pembayaran ganda terverifikasi;",
              "pembayaran berhasil tetapi pesanan tidak dapat disediakan karena kesalahan {{brand}} dan tidak ada solusi pengganti yang disetujui;",
              "diwajibkan oleh hukum atau keputusan penyelesaian sengketa yang berlaku."
            ]
          },
          {
            "type": "paragraph",
            "text": "Biaya payment gateway yang tidak dikembalikan oleh penyedia hanya dapat dikurangkan apabila diperbolehkan hukum dan telah diungkap sebelum transaksi."
          }
        ]
      },
      {
        "id": "refund-3",
        "title": "Pembatalan sebelum pekerjaan dimulai",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Jika klien membatalkan sebelum brief disetujui dan sebelum pekerjaan dimulai, pembayaran dapat dikembalikan setelah dikurangi biaya pihak ketiga atau biaya payment gateway yang nyata, non-refundable, diperbolehkan hukum, dan dapat dibuktikan."
          }
        ]
      },
      {
        "id": "refund-4",
        "title": "Pembatalan setelah pekerjaan dimulai",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Refund tidak otomatis ditolak. Nilainya dihitung berdasarkan:"
          },
          {
            "type": "paragraph",
            "text": "pembayaran diterima - milestone selesai - pekerjaan parsial yang dapat dibuktikan - biaya pihak ketiga/non-refundable = refund tersedia"
          },
          {
            "type": "paragraph",
            "text": "Bukti dapat berupa discovery, meeting, research, audit, struktur, sitemap, wireframe, draft, setup, konfigurasi, implementasi, testing, report, atau pembelian pihak ketiga. Nilai milestone harus dicatat dalam order snapshot atau custom offer."
          }
        ]
      },
      {
        "id": "refund-5",
        "title": "Tidak sesuai scope atau cacat",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Jika jasa tidak sesuai Transaction Terms atau memiliki kesalahan dalam scope, klien harus memberi kesempatan yang wajar untuk koreksi, penggantian, penyelesaian ulang, atau solusi lain. Jika tidak dapat diperbaiki secara wajar, refund penuh atau sebagian dinilai berdasarkan bagian yang terdampak dan hukum yang berlaku."
          },
          {
            "type": "paragraph",
            "text": "Kegagalan mencapai hasil bisnis yang tidak dijamin bukan dengan sendirinya dasar refund apabila layanan dan output diberikan sesuai scope."
          }
        ]
      },
      {
        "id": "refund-6",
        "title": "Proses refund",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Permintaan dikirim melalui kanal resmi dengan nomor pesanan, alasan, dan bukti relevan. Kami mengonfirmasi penerimaan, menilai progres, lalu menyampaikan keputusan dan perhitungan."
          },
          {
            "type": "paragraph",
            "text": "Waktu dana kembali bergantung pada metode pembayaran, bank, dan proses penyedia pembayaran yang digunakan. Status refund pesanan dipisahkan dari status pembayaran dan status pekerjaan."
          }
        ]
      },
      {
        "id": "refund-7",
        "title": "Chargeback dan sengketa pembayaran",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Klien disarankan menghubungi {{brand}} terlebih dahulu. Kami dapat memberikan bukti order, persetujuan Terms, komunikasi, progres, dan hasil kepada penyedia pembayaran sesuai hukum dan Kebijakan Privasi."
          }
        ]
      }
    ]
  },
  "privacy": {
    "sections": [
      {
        "id": "privacy-1",
        "title": "Pengendali data",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Pengendali data untuk layanan {{brand}} adalah {{operator}}, trading as {{brand}}, {{domicile}}. Pertanyaan privasi dapat dikirim ke {{email}}."
          }
        ]
      },
      {
        "id": "privacy-2",
        "title": "Data yang diproses",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Kami dapat memproses:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "identitas dan kontak;",
              "akun dan autentikasi;",
              "informasi bisnis, brief, materi, file, dan komunikasi;",
              "data pesanan, penawaran, invoice, pembayaran, refund, dan acceptance;",
              "data penggunaan, perangkat, log keamanan, IP, user agent, analytics, dan cookies;",
              "akses akun/platform yang diberikan untuk menyelesaikan pekerjaan;",
              "catatan support, pengaduan, dan sengketa."
            ]
          },
          {
            "type": "paragraph",
            "text": "Kami tidak bermaksud meminta data sensitif yang tidak diperlukan. Klien harus menghapus atau menyamarkan data pihak ketiga yang tidak relevan sebelum mengunggah file."
          }
        ]
      },
      {
        "id": "privacy-3",
        "title": "Tujuan dan dasar pemrosesan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Data diproses untuk:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "menyiapkan penawaran dan melaksanakan kontrak;",
              "memverifikasi pembayaran dan mencegah fraud;",
              "menyediakan akun, order, komunikasi, revisi, dan hasil;",
              "memenuhi kewajiban hukum, pajak, audit, dan penyelesaian sengketa;",
              "menjaga keamanan dan keandalan sistem;",
              "meningkatkan website menggunakan data teragregasi;",
              "mengirim marketing hanya berdasarkan persetujuan atau dasar sah yang relevan."
            ]
          }
        ]
      },
      {
        "id": "privacy-4",
        "title": "Pihak penerima",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Sesuai layanan dan fitur yang digunakan, data dapat dibagikan secukupnya kepada penyedia hosting/cloud, database, autentikasi, storage, email, analytics, monitoring, penyedia pembayaran, bank/metode pembayaran, kolaborator spesialis, konsultan profesional, atau otoritas berdasarkan permintaan yang sah. Pembayaran online kelak dapat menggunakan Midtrans atau penyedia lain yang ditampilkan secara resmi; integrasi ini belum aktif."
          },
          {
            "type": "paragraph",
            "text": "Setiap penyedia hanya menerima data yang relevan dengan fungsinya. Penyedia yang digunakan bergantung pada layanan dan fitur yang tersedia."
          }
        ]
      },
      {
        "id": "privacy-5",
        "title": "Transfer dan penyimpanan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Penyedia dapat memproses data pada infrastruktur di luar Indonesia. Lokasi pemrosesan dan mekanisme transfer lintas batas harus ditinjau sesuai ketentuan pelindungan data pribadi yang berlaku sebelum digunakan untuk pemrosesan terkait."
          },
          {
            "type": "paragraph",
            "text": "Data disimpan selama diperlukan untuk pesanan, layanan, kewajiban hukum, keamanan, pajak, pembukuan, atau sengketa. Lama penyimpanan bergantung pada tujuan pemrosesan dan kewajiban yang berlaku. Setelah masa retensi, data dihapus, dianonimkan, atau diagregasi secara aman."
          }
        ]
      },
      {
        "id": "privacy-6",
        "title": "Keamanan",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Kontrol keamanan disesuaikan dengan sistem dan data yang diproses. Sesuai fungsi yang digunakan, kontrol ini mencakup pembatasan akses dan hak akses minimum, enkripsi transport, pengelolaan kredensial, serta otorisasi server-side, penyimpanan privat, pencatatan aktivitas, dan backup untuk sistem terkait. Tidak ada sistem yang bebas risiko."
          },
          {
            "type": "paragraph",
            "text": "Jika terjadi kegagalan pelindungan data yang memenuhi ambang pemberitahuan hukum, kami akan memberikan pemberitahuan sesuai batas dan isi yang diwajibkan peraturan."
          }
        ]
      },
      {
        "id": "privacy-7",
        "title": "Hak pengguna",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Sesuai hukum yang berlaku, pengguna dapat meminta informasi, akses, koreksi, pembaruan, penghentian/penghapusan, penarikan persetujuan, keberatan, atau hak lain terkait pemrosesan data. Beberapa permintaan dapat dibatasi oleh kewajiban hukum, pencegahan fraud, pembukuan, atau sengketa."
          },
          {
            "type": "paragraph",
            "text": "Kami dapat memverifikasi identitas sebelum memenuhi permintaan."
          }
        ]
      },
      {
        "id": "privacy-8",
        "title": "Cookies dan analytics",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Cookies fungsional untuk login, keamanan, dan sesi tetap terpisah dari analitik opsional. Cookies tersebut tidak dikendalikan oleh pilihan analitik. Analitik opsional tidak diperlukan untuk menggunakan website."
          },
          {
            "type": "paragraph",
            "text": "Kami menggunakan Google Tag Manager sebagai infrastruktur pengelolaan tag untuk Google Analytics 4 (GA4) yang bersifat opsional. Container hanya dimuat setelah persetujuan analitik secara tegas pada rute publik yang disetujui. Pengumpulan GA4 hanya ditujukan untuk website publik production, guna memahami penggunaan halaman publik serta meningkatkan website dan layanan; staging digunakan untuk pemeriksaan container dan persetujuan tanpa pengukuran GA4."
          },
          {
            "type": "paragraph",
            "text": "Analitik opsional dapat memproses URL atau path halaman publik, informasi perujuk, informasi browser dan perangkat, perkiraan lokasi dari Google, serta interaksi atau keterlibatan pada website publik. Payload event halaman yang disetujui hanya menggunakan path publik dalam daftar yang diizinkan, judul publik statis, bahasa, dan kategori konten; query string dan fragmen dihapus. Pengumpulan informasi perujuk dinonaktifkan pada rancangan tag awal. Rute autentikasi dan akun dikecualikan. Kami tidak bermaksud mengumpulkan kata sandi, isi email, pesan pesanan privat, file unggahan, maupun token autentikasi dan pemulihan melalui analitik."
          },
          {
            "type": "paragraph",
            "text": "Browser Anda hanya menyimpan granted atau denied pada preferensi localStorage berversi adamswork.analytics-consent.v1. Preferensi ini tidak disimpan dalam akun, profil, atau database dan tidak memuat informasi pribadi. Anda dapat menerima atau menolak analitik opsional, membuka kembali Pengaturan cookie pada footer, serta menarik persetujuan kapan saja. Penarikan persetujuan mengirim pembaruan consent denied, menghentikan analitik berikutnya, menghapus cookies GA pihak pertama yang dapat diakses sejauh aman dilakukan, dan memuat ulang halaman untuk menghentikan tag yang sudah dimuat tanpa mengubah cookies autentikasi."
          },
          {
            "type": "paragraph",
            "text": "Retensi data tingkat event dan pengguna GA4 untuk eksplorasi diatur selama 14 bulan, dengan reset saat aktivitas baru dinonaktifkan. Pengaturan ini tidak menjelaskan retensi setiap laporan teragregasi. Google Signals, pengumpulan data yang diberikan pengguna, penautan Google Ads, dan personalisasi iklan tidak diaktifkan saat peluncuran; persetujuan penyimpanan dan personalisasi iklan tetap denied. Google memproses informasi menurut ketentuan privasinya sendiri."
          },
          {
            "type": "link",
            "href": "https://policies.google.com/privacy?hl=id",
            "label": "Kebijakan Privasi Google"
          }
        ]
      },
      {
        "id": "privacy-9",
        "title": "Anak",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Layanan tidak ditujukan untuk anak yang tidak memiliki kapasitas memberikan persetujuan atau membuat kontrak tanpa wali. Jika data anak teridentifikasi tanpa dasar yang sah, hubungi kami untuk penanganan."
          }
        ]
      },
      {
        "id": "privacy-10",
        "title": "Perubahan dan kontak",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Perubahan kebijakan ditampilkan dengan versi dan tanggal berlaku. Perubahan material disampaikan secara layak. Kontak: {{email}}."
          }
        ]
      }
    ]
  }
}
