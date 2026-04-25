# Technical Reference: Laravel 13 & Inertia (React) Architecture Guide

## 1. Core Principles & Constraints
* **Backend Modularity:** Maksimal **300 baris** per file PHP.
* **Frontend Modularity:** Maksimal **500 baris** per file React/TypeScript.
* **Pattern Philosophy:** Gunakan **"The Laravel Way"**. Larang penggunaan *Repository* atau *Service Pattern* manual. Maksimalkan fitur bawaan framework.
* **Tech Stack:** Laravel 13, Inertia.js, React, Tailwind CSS, Shadcn UI, TypeScript.

---

## 2. Backend Strategy (Laravel 13)

Untuk menjaga file tetap ramping (<300 baris), AI Agent harus mendistribusikan logika ke komponen berikut:

### A. Models & Data Handling
* **Lean Models:** Gunakan `Traits` untuk memisahkan *Scopes*, *Relationships*, dan *Attribute Casting* jika model terlalu besar.
* **Automatic Casting:** Manfaatkan fitur terbaru Laravel 13 untuk casting data kompleks (JSON/Asymmetric Encrypted) langsung di property model.
* **Observers:** Semua logika *side-effect* (seperti mengirim email setelah register, logging audit trail, atau manipulasi file) **wajib** diletakkan di `Model Observers`.

### B. Controller & Routing
* **Single Action Controllers:** Gunakan `__invoke()` untuk logic yang kompleks guna memastikan controller tetap di bawah 300 baris.
* **Form Requests:** Validasi **dilarang keras** ada di dalam Controller. Gunakan `php artisan make:request` untuk semua validasi dan otorisasi level request.
* **Fluent Middleware:** Gunakan konfigurasi middleware di `bootstrap/app.php` (gaya Laravel 11+) untuk menyederhanakan proteksi rute.

### C. Logic Distribution
* **Action Classes (Optional):** Jika sebuah logika melibatkan banyak model, buatlah class POPO (Plain Old PHP Object) sederhana tanpa struktur *Service Pattern* yang kaku.
* **Events & Listeners:** Gunakan `DispatchesEvents` pada model untuk memicu proses *asynchronous* atau *heavy-lifting*.
* **Custom Collections:** Jika ada manipulasi array/data koleksi yang rumit, pindahkan ke `Custom Collection` class dengan meng-override method `newCollection()` di model.

---

## 3. Frontend Strategy (Inertia + React)

### A. Component Structure
* **Atomic Design with Shadcn:** Manfaatkan folder `components/ui` untuk komponen dasar. Logic bisnis harus berada di `components/features` atau langsung di `Pages`.
* **Composition Over Inheritance:** Gunakan *React Composition* untuk membuat komponen yang fleksibel dan tetap di bawah 500 baris.
* **TypeScript Strict Mode:** Semua props wajib memiliki interface yang jelas untuk memudahkan debugging AI.

### B. State & Data Management
* **Inertia UseForm:** Gunakan helper `useForm` dari Inertia untuk handling submit dan error validation. Jangan membuat state manual untuk form kecuali diperlukan.
* **Custom Hooks:** Pisahkan logika UI yang kompleks (seperti kalkulasi client-side atau filter list) ke dalam *Custom Hooks* lokal.
* **Shared Data:** Manfaatkan `HandleInertiaRequests` middleware untuk data global (auth user, flash messages, dsb).

---

## 4. Strict AI Agent Instructions

Agent harus mengikuti instruksi ini secara literal:

1.  **Code Splitting:** "Jika file `.php` mendekati 250 baris, identifikasi bagian mana yang bisa dipindah ke `Trait`, `Observer`, atau `Casts`."
2.  **Naming Convention:** * Model Traits: `Models/Traits/Has[FeatureName].php`
    * Single Action: `Http/Controllers/[Entity]/[ActionName]Controller.php`
3.  **Strict No-Service Policy:** "Jangan buat folder `Services/` atau `Repositories/`. Gunakan `Query Scopes` untuk filter data dan `Actions` atau `Job Classes` untuk logic antar model."
4.  **UI Consistency:** "Gunakan Shadcn UI untuk semua elemen input dan feedback. Pastikan `className` Tailwind tidak menumpuk; gunakan helper `cn()` untuk penggabungan class."
5.  **Laravel 13 Specifics:** "Gunakan fitur terbaru seperti *improved routing performance*, *enhanced type-hinting*, dan *simplified view-data* yang ada di versi 13."

---

## 5. Development Workflow

1.  **Schema First:** Definisikan Migration dan Model lengkap dengan *Relationships* dan *Casts*.
2.  **Inertia Bridge:** Buat `FormRequest` dan `Controller` yang mengembalikan `Inertia::render()`.
3.  **Frontend Implementation:** Bangun Page menggunakan Shadcn components, hubungkan dengan data dari props Laravel.
4.  **Refactor:** Jika syarat baris maksimal terlampaui, lakukan dekomposisi ke `Traits` (backend) atau `Sub-components` (frontend).

---
> **Note for Agent:** Fokus pada modularitas bawaan framework. Jika kamu merasa butuh *Service Pattern*, itu tandanya kamu harus memecah logic tersebut ke dalam `Jobs`, `Listeners`, atau `Model Scopes`.