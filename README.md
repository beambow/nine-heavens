# NINE HEAVENS — Cultivation Gacha

Versi donghua/cultivation cinematic untuk GitHub Pages.

## Upload
Upload seluruh isi folder ini ke repository GitHub. Pastikan `index.html` berada di root repository.

GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## Fitur V2
- Cinematic cultivation landing page
- Seven cultivation realms
- Chinese realm names
- Animated celestial formation
- Rotating runes / spiritual altar
- Moon, mountains, nebula dan starfield
- Ritual summon fullscreen
- Lightning flash dan energy beams
- Cinematic rarity reveal
- Particle explosion
- Rarity-specific colors & glow
- Sound effect sintetis
- Gacha x1 / x10
- Pity 50
- Recent awakenings
- Responsive mobile
- Tanpa backend / Node.js

## Catatan
Website ini menggunakan Google Fonts untuk Cinzel. Jika ingin benar-benar offline, font tersebut bisa diganti dengan font lokal.


## V3 Cinematic
- 4-stage summon sequence
- Spirit dragons / energy trails
- Heaven decree text
- Multi-stage formation acceleration
- Heaven impact and whiteout
- Special Divine result screen
- Skip button

## V4 Donghua Edition
- Gunung 3 lapis + kabut + bulan bercahaya dengan efek parallax mengikuti kursor
- Partikel qi, kelopak bunga, dan bintang jatuh di latar
- Judul dengan efek tinta & kilau emas, kaligrafi kuas (Ma Shan Zheng)
- Kartu realm 3D tilt dengan aura mengikuti kursor
- Summon sinematik: letterbox, pusaran qi, dua naga roh, pilar cahaya, gelombang kejut, layar putih
- Subtitle Mandarin ala donghua, guncangan layar, suara gong/drum sintetis
- Reveal hasil: sinar berputar, cincin kejut, nama muncul per huruf, daftar hasil x10
- Mendukung prefers-reduced-motion

## V5 Realm Effects + Performa
- 7 ranah, 7 animasi & efek berbeda (kartu dan layar hasil):
  炼体 palu besi + percikan api + getar layar | 练气 aliran qi berputar | 筑基 formasi geometri tergambar + riak
  结丹 inti emas + orbit | 元婴 teratai api mekar + jiwa primordial | 化虚 ruang retak + glitch | 天仙 sembilan langit + pilar cahaya
- Tiap ranah punya animasi judul & tema warna layar hasil sendiri
- Sinematik baru: lingkaran rune di kanvas, naga roh dengan kepala/tanduk/kumis, kamera zoom, slash cahaya, whiteout berwarna rarity
- Performa: tanpa shadowBlur/blur/backdrop-filter animasi, glow dari sprite, 55 partikel latar, latar berhenti saat ritual, audio disiapkan saat klik pertama
- Durasi gacha ±4 detik (dulu ±6.5), tombol SKIP langsung loncat ke hasil

## V6 Full Upgrade
- 21 kultivator (3 per ranah) dengan nama, elemen, skill, dan portrait SVG prosedural
- Codex: koleksi dengan siluet "???", bintang duplikat, level, Qi/detik
- Simpan progres otomatis (localStorage): stones, pity, riwayat, koleksi, Qi, misi
- Banner event "Dragon Emperor": rate-up 天仙 1.2% + jaminan 50/50
- Login bonus 7 hari + 4 misi harian
- Idle cultivation: kultivator menghasilkan Qi (juga saat offline, maks 8 jam); Qi dipakai breakthrough
- Musik generatif (guzheng, erhu, drone) tanpa file audio; tombol ♪; makin intens saat gacha
- Tombol SAVE CARD: kartu hasil PNG (bagikan via menu share di HP, atau unduh)
- Ingin ilustrasi asli / musik asli? Taruh file di folder assets/ lalu minta integrasi.


## V6.1 Stabilitas + Aksesibilitas
- Perbaikan: hasil summon kini dicatat & disimpan SEBELUM animasi (refresh saat ritual tidak lagi menghilangkan stones/karakter)
- Perbaikan: ritual dibungkus try/finally, layar tidak bisa macet jika ada error
- Perbaikan: waktu perangkat dimundurkan tidak lagi membuat Qi negatif; data save divalidasi saat dimuat
- Perbaikan: ID gradient SVG portrait unik; kartu SAVE CARD menunggu font termuat
- Baru: panel Pengaturan (tombol ⚙) — volume musik/efek, bisukan semua suara, mode "kurangi efek" (kedip, guncangan, zoom, whiteout; otomatis aktif jika OS meminta reduced motion)
- Baru: Export / Import save (.json) dan Reset data
- Baru: tombol SKIP kini `<button>` (bisa dengan keyboard), gaya fokus terlihat, Esc untuk skip/tutup, fokus dipindah ke dialog, aria-label/role dialog/aria-live
- Simpan otomatis juga saat tab disembunyikan/ditutup


## V7 Sinematik, Audio, Tampilan
**File baru:** `audio.js` (efek suara + musik), `ritual.js` (animasi gacha), `visuals.js` (ambience halaman). Urutan skrip di `index.html`: audio → script → ritual → visuals.

**Animasi gacha**
- Orb 道 kini *menanjak* melewati ranah; warnanya adalah petunjuk rarity (abu → hijau → biru → ungu → emas → merah muda → emas ilahi) dengan indikator 7 berlian
- Durasi dinamis: tarikan biasa ±2 dtk, ranah tinggi ±6 dtk (jeda tegang sebelum ranah akhir)
- Klimaks berbeda tiap rarity: percikan (rank 1-2), petir ×3 (3-4), gerbang langit + naga (5-6, retakan langit di 6), freeze-frame + sembilan berkas cahaya (7)
- ×10: tombol ALL RESULTS membuka kartu flip berurutan dari yang paling umum; kartu belum terbuka sudah berpendar sesuai rarity

**Suara**
- Reverb sintetis, kompresor, bus terpisah musik/efek; bunyi klik UI, klaim misi, breakthrough, flip kartu
- Efek ritual berlapis: riser, lonceng bernada pentatonik yang naik tiap ranah, retak petir, gemuruh gerbang, paduan suara, gong
- Musik generatif: tangga nada A minor pentatonik, progresi 4 akor (2 bar/akor), guzheng senar petik (Karplus-Strong), erhu, seruling, pad, bass, taiko/kayu/shaker. Intensitas naik otomatis saat gacha dan turun setelah hasil. Dijeda saat tab disembunyikan

**Tampilan**
- Warna ambient halaman berubah per section dan saat hover kartu ranah
- Ranah berbentuk tangga naik, misi harian bergaya jimat kertas, bingkai codex berbeda per rarity (kilau untuk rank 5+), banner event berkilau
- Hero: lentera, bangau, parallax; kanji raksasa per section; reveal saat scroll
- Perbaikan HP: saldo Spirit Stones dan Qi terlihat di top bar
- Semua dekorasi dimatikan lewat pengaturan "Kurangi efek"

## V8 Cultivation & Alchemy Expansion
- **Perbaikan Logika Pity**: Pity kini direset secara presisi di dalam loop saat karakter Rank 5+ didapatkan, sehingga sisa tarikan pada summon ×10 tidak lagi hilang.
- **Ranah Kultivasi Pemain & Kesengsaraan Langit (渡劫 - Tribulation)**: Pemain memiliki ranah kultivasi sendiri di top bar (7 tingkatan dari Mortal hingga Heavenly Immortal) yang memberikan bonus QPS pasif dan bonus Spirit Stones login harian. Terobosan memicu efek kilat petir dan suara gong kemenangan.
- **Paviliun Alkimia (炼丹 - Alchemy Pavilion)**: Memanfaatkan surplus Qi yang berlimpah untuk meracik pil rohani (*Spirit Gathering Pill*, *Golden Core Pill*, dan *Heavenly Fortune Pill*) menjadi Spirit Stones dan bonus Pity.
- **Fitur Summon Again**: Tombol `SUMMON AGAIN` langsung tersedia di layar hasil gacha untuk melakukan tarikan berikutnya tanpa perlu menutup modal dan scroll manual.
- **Mode Cepat (Fast Summon)**: Toggle opsi lewati animasi secara instan bagi pemain yang ingin melakukan tarikan maraton.
- **Penyempurnaan Codex & Modal Detail Karakter**: Ditambahkan filter kategori (Semua, Dimiliki, Belum, Immortal+), pencarian nama/elemen, dan modal detail karakter lengkap dengan biografi kisah (lore), skill, dan breakthrough langsung di dalam dialog.

