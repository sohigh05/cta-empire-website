# CTA EMPIRE

Website korporat CTA EMPIRE dalam Bahasa Melayu, dibina menggunakan HTML, CSS dan JavaScript biasa.

## Kandungan

- Dua aliran perkhidmatan: IT dan Construction, dengan pop-up maklumat lengkap.
- Loading screen dan transisi logo antara halaman.
- Profil pemilik, gambar pasukan dan carta organisasi.
- Rekod projek penyelenggaraan daripada profil syarikat.
- Galeri sijil dengan watermark dan butiran sensitif yang disamarkan.
- Borang pertanyaan WhatsApp, Google Maps dan Waze.
- Paparan responsif untuk komputer, tablet dan telefon.

## Buka secara tempatan

Pada laptop asal projek ini, klik dua kali **Buka CTA EMPIRE.cmd**. Pembuka menggunakan Python yang disediakan oleh Codex.

Pada komputer lain yang mempunyai Python 3, buka terminal dalam folder projek dan jalankan:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Buka **http://127.0.0.1:4173/** dalam pelayar. Gunakan pelayan tempatan supaya pop-up IT dan Construction dapat membaca kandungan halaman masing-masing.

Fon Google, peta dan pautan WhatsApp memerlukan sambungan internet. Maklumat borang disediakan sebagai mesej untuk disemak dan dihantar sendiri oleh pengguna melalui WhatsApp.

## Susunan fail

```text
dist/
├── index.html
├── tentang.html
├── it.html
├── construction.html
├── projek.html
├── hubungi.html
├── css/
├── js/
└── assets/
    ├── images/
    └── sijil/
```

Rujuk **PANDUAN.txt** untuk maklumat penyelenggaraan. Tiada framework atau langkah kompilasi diperlukan.

Repositori ini menyimpan kod sumber. GitHub Pages atau hosting automatik tidak dikonfigurasikan.

© CTA EMPIRE. Hak cipta terpelihara.
