# Web Ulang Tahun Interaktif

Proyek ini adalah halaman ulang tahun sederhana untuk di-host di GitHub Pages.

Fitur:
- Animasi welcome
- Tombol `Ready` meminta akses microphone
- Kue dengan lilin animasi
- Deteksi tiupan menggunakan microphone → lilin padam
- Sparkle dan confetti
- Amplop yang bisa diklik untuk membuka surat

Cara pakai lokal:

1. Buka `index.html` di browser modern (Chrome/Edge/Firefox). Untuk fitur mic, jalankan lewat server lokal atau GitHub Pages (file:// mungkin tidak memberi izin mic).

Contoh server cepat (PowerShell):

```powershell
# jika ada Python
python -m http.server 8000

# lalu buka http://localhost:8000
```

Deploy ke GitHub Pages:
1. Buat repo baru di GitHub, push seluruh folder.
2. Aktifkan GitHub Pages dari branch `main` (atau `gh-pages`) dan gunakan folder root.
