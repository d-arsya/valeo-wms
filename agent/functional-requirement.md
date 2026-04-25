### **1. Alur Kerja Pengguna (User Flow)**

Alur ini dirancang untuk memastikan kecepatan di gudang namun tetap menjaga integritas data melalui pencatatan aktivitas yang ketat.

#### **A. Registrasi Barang & Pelabelan (Khusus Admin)**
1.  **Input Data:** Admin memasukkan data suku cadang baru ke sistem (Nama, Spesifikasi, Merek, *Safety Stock*).
2.  **Generate QR Label:** Sistem secara otomatis membuat label QR Code yang berisi informasi: **Material Number, Location (Rak/Bin), Brand, dan Specification**.
3.  **Penempelan:** Admin mencetak label tersebut dan menempelkannya pada **setiap bin fisik** di gudang.

#### **B. Pengambilan Barang (Tim Lapangan - Mobile)**
1.  **Scan Bin:** Petugas lapangan menggunakan smartphone untuk **memindai QR Code di bin** tempat barang berada.
2.  **Identifikasi:** Aplikasi langsung menampilkan detail barang tersebut untuk memastikan tidak ada salah ambil.
3.  **Input Pengurangan:** Petugas memasukkan jumlah barang yang diambil, nama PIC, dan keterangan (*Remarks*).
4.  **Konfirmasi:** Stok berkurang seketika. **Tidak butuh persetujuan admin**, namun sistem secara otomatis mencatat detil waktu dan siapa yang melakukannya ke dalam **Log Aktivitas**.

#### **C. Kedatangan Barang (Barang Masuk)**
1.  **Pencarian/Scan:** Pengguna memindai QR bin atau mencari barang di aplikasi seluler.
2.  **Input Data Kedatangan:** Memasukkan jumlah stok tambahan, nomor PO, dan tanggal kedatangan.
3.  **Update Stok:** Stok aktual bertambah dan sistem menghitung ulang status ketersediaan.

---

### **2. Persyaratan Fungsional (Functional Requirements)**

Daftar fitur utama yang harus ada agar aplikasi berjalan sesuai kebutuhan bisnis Anda:

#### **FR-01: Pemindai QR Seluler (Mobile Scanner)**
*   Aplikasi harus memiliki fitur kamera terintegrasi untuk **memindai QR Code di setiap bin** menggunakan smartphone.
*   Setelah scan, sistem harus otomatis mengarahkan pengguna ke halaman barang yang relevan tanpa perlu mencari manual.

#### **FR-02: Otomasi Status & Peringatan Stok**
*   Sistem wajib menghitung status stok secara *real-time* dengan rumus: **Actual Stock < Safety Stock**.
*   Jika stok di bawah batas aman, status barang harus otomatis berubah menjadi **"ATTENTION"** atau **"NG"** dengan indikator visual yang jelas (seperti emoji 😮 atau 😡).

#### **FR-03: Pencatatan Log Aktivitas Terperinci**
*   Setiap interaksi pengguna (tambah/kurang stok) harus terekam dalam **log aktivitas yang permanen**.
*   Log harus mencatat: ID Kontrol, Tanggal/Waktu, Nama PIC, Jumlah Perubahan, dan Keterangan.

#### **FR-04: Sistem Pelabelan Dinamis**
*   Admin dapat menghasilkan label QR yang memuat informasi spesifik: *Material Number, Location, Brand,* dan *Specification*.
*   Sistem harus memungkinkan pengaturan parameter data secara dinamis sesuai kebutuhan gudang yang berubah.

#### **FR-05: Penjanaan Laporan (Report Generation)**
*   Aplikasi harus dapat menghasilkan dokumen output dalam format **PDF**.
*   PDF yang dihasilkan harus mengikuti **templat Microsoft Word** yang telah disiapkan sebelumnya agar tata letak laporan tetap resmi dan konsisten.