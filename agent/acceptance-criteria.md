### **1. Fitur: Manajemen Data Master & QR Code (Admin)**
**Tujuan:** Mendaftarkan barang dan memfasilitasi pelabelan fisik.
*   **Kriteria 1:** Sistem berhasil menyimpan data barang baru yang mencakup: *Material Number, Location (Rak & Bin), Part Name, Specification, Brand, Category, Safety Stock,* dan *Initial Stock*.
*   **Kriteria 2:** Sistem harus dapat **menghasilkan (generate) QR Code** secara otomatis setelah data disimpan.
*   **Kriteria 3:** QR Code yang dihasilkan wajib memuat informasi tekstual: **Material Number, Location, Brand, dan Specification** agar mudah dibaca secara manual jika diperlukan.

### **2. Fitur: Pemindaian Mobile (Tim Lapangan)**
**Tujuan:** Kecepatan akses data di depan bin barang.
*   **Kriteria 1:** Aplikasi dapat mengakses kamera smartphone untuk memindai QR Code pada bin.
*   **Kriteria 2:** Setelah pemindaian berhasil, sistem harus **langsung mengarahkan (*auto-redirect*)** pengguna ke halaman detil barang yang sesuai tanpa pencarian manual tambahan.
*   **Kriteria 3:** Pemindaian harus tetap berfungsi meski kondisi cahaya di gudang minim (menggunakan dukungan *flash* kamera ponsel).

### **3. Fitur: Kontrol Stok Keluar (OUT Control)**
**Tujuan:** Mencatat pengambilan barang dengan akurat.
*   **Kriteria 1:** Pengguna dapat memasukkan jumlah barang yang diambil, memilih nama PIC dari daftar dinamis, dan mengisi alasan pengambilan (*Remarks*).
*   **Kriteria 2:** **Stok Aktual** harus berkurang secara *real-time* segera setelah tombol konfirmasi ditekan.
*   **Kriteria 3:** Sistem **wajib mencatat log aktivitas** secara otomatis (siapa, jam berapa, barang apa, berapa banyak) untuk audit di kemudian hari.

### **4. Fitur: Otomasi Status Stok Kritis**
**Tujuan:** Peringatan dini ketersediaan barang.
*   **Kriteria 1:** Sistem secara otomatis menghitung status berdasarkan rumus: **Actual Stock < Safety Stock**.
*   **Kriteria 2:** Jika stok di bawah batas aman, label status pada dasbor harus berubah secara visual menjadi **"ATTENTION"** atau **"NG"** dengan emoji peringatan (😮 atau 😡).
*   **Kriteria 3:** Perubahan status ini harus terjadi instan setelah ada transaksi *OUT Control* yang memicu stok rendah.

### **5. Fitur: Pelaporan PDF Berbasis Templat (Reporting)**
**Tujuan:** Menghasilkan dokumen resmi yang konsisten.
*   **Kriteria 1:** Sistem harus dapat mengekspor riwayat transaksi (IN/OUT) ke dalam format **PDF**.
*   **Kriteria 2:** Tata letak (*layout*) laporan PDF yang dihasilkan harus **identik dengan templat Microsoft Word** yang telah disiapkan sebelumnya.
*   **Kriteria 3:** Laporan harus dapat difilter berdasarkan rentang tanggal atau ID kontrol tertentu.