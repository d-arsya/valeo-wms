### **1. User Story (Perspektif Pengguna)**

Daftar ini menjelaskan kebutuhan operasional harian yang harus dipenuhi oleh aplikasi:

| ID | Peran | Keinginan (User Story) | Manfaat (Benefit) |
| :--- | :--- | :--- | :--- |
| **US-01** | **Admin** | Mendaftarkan data *sparepart* baru dan menghasilkan QR Code secara otomatis. | Agar label fisik dapat segera dicetak dan ditempelkan pada bin gudang. |
| **US-02** | **Tim Lapangan** | Memindai QR Code di setiap bin menggunakan smartphone untuk melihat detail barang. | Agar saya tidak perlu mencari data secara manual dan memastikan barang yang diambil sudah benar. |
| **US-03** | **Tim Lapangan** | Mengurangi stok langsung melalui ponsel saat mengambil barang dari bin. | Agar jumlah stok di sistem selalu sama dengan kondisi asli di gudang secara *real-time*. |
| **US-04** | **Tim Lapangan** | Menambahkan stok barang masuk lengkap dengan nomor PO dan harga per pcs. | Agar riwayat pengadaan barang terdokumentasi dengan rapi. |
| **US-05** | **Manajer/User** | Melihat peringatan visual (status "ATTENTION" atau emoji 😮) saat stok di bawah batas aman. | Agar saya bisa segera melakukan pemesanan ulang sebelum terjadi *stop line* produksi. |
| **US-06** | **Admin/User** | Mengunduh laporan riwayat IN/OUT dalam format PDF berdasarkan templat yang sudah ada. | Agar saya memiliki dokumen resmi yang rapi untuk keperluan audit internal. |

---

### **2. Alur Kerja Pengguna (User Flow)**

Berikut adalah visualisasi langkah-langkah yang akan dilakukan pengguna di lapangan:

#### **A. Alur Pengambilan Barang (OUT Control - Tim Lapangan)**
1.  **Mulai:** Petugas lapangan tiba di depan bin fisik gudang.
2.  **Scan QR:** Membuka aplikasi di ponsel dan memindai QR Code yang tertempel di bin tersebut.
3.  **Verifikasi:** Sistem menampilkan data: **Material Number, Brand, Spec, dan Actual Stock** saat ini.
4.  **Input Data:** Petugas memasukkan:
    *   Jumlah (Qty) yang diambil.
    *   Nama PIC (Penanggung Jawab).
    *   Keterangan/Mesin tujuan (*Remarks*).
5.  **Submit:** Klik tombol "Kurangi Stok".
6.  **Log:** Sistem mencatat aktivitas secara otomatis ke dalam log permanen.
7.  **Auto-Status:** Jika `Actual Stock < Safety Stock`, sistem langsung mengubah status barang menjadi **ATTENTION**.

#### **B. Alur Penerimaan Barang (IN Control - Tim Lapangan)**
1.  **Cari Barang:** Pengguna memindai QR bin atau mencari nama barang di dasbor aplikasi.
2.  **Input Kedatangan:** Memasukkan data baru:
    *   Jumlah stok tambahan.
    *   Nomor PO Terakhir & Nama Supplier.
    *   Tanggal Kedatangan (*GR Date*) & Harga per unit.
3.  **Simpan:** Klik "Tambah Stok".
4.  **Selesai:** Stok sistem bertambah dan log riwayat masuk diperbarui.

#### **C. Alur Pendaftaran & Pelabelan (Khusus Admin)**
1.  **Input Master:** Admin memasukkan data detail *sparepart* baru ke sistem.
2.  **Pilih Bin:** Menentukan lokasi rak (Rak A-V) dan nomor bin spesifik.
3.  **Generate QR:** Klik tombol "Generate Barcode". Sistem menciptakan QR Code berisi info material, lokasi, merek, dan spesifikasi.
4.  **Cetak:** Admin mencetak label dan menempelkannya di bin fisik gudang.

#### **D. Alur Penjanaan Laporan (Reporting)**
1.  **Filter:** Admin/User memilih menu Report dan memfilter data berdasarkan rentang tanggal atau ID Dokumen.
2.  **Export:** Klik tombol "Export to PDF".
3.  **Formatting:** Sistem secara otomatis memetakan data log ke dalam **templat Microsoft Word** yang sudah disiapkan sebelumnya.
4.  **Download:** Pengguna mengunduh file PDF yang sudah siap dipresentasikan.