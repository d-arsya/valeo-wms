# 📘 GitHub Web + CLI Reference for AI Agent  

---

# **2. 📦 Repositories**  
### Deskripsi  
Repositori adalah tempat penyimpanan kode, konfigurasi, dokumentasi, dan workflow.

### Kegunaan untuk AI Agent  
- Membuat repo baru untuk project otomatis.  
- Meng-clone repo untuk analisis kode.  
- Membaca metadata repo (branch, topics, visibility).  
- Menyiapkan struktur project awal.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Membuat repo | `gh repo create <name>` |
| Clone repo | `gh repo clone <owner>/<repo>` |
| Lihat info repo | `gh repo view` |
| Edit repo | `gh repo edit` |

### Referensi  
- `https://cli.github.com/manual/gh_repo_create` 
- `https://docs.github.com/en/repositories` 
---

# **3. 🧩 Issues**  
### Deskripsi  
Issues digunakan untuk bug tracking, task management, dan feature request.

### Kegunaan untuk AI Agent  
- Membuat issue otomatis dari error log.  
- Auto-labeling berdasarkan analisis AI.  
- Menambahkan komentar otomatis.  
- Menutup issue setelah PR merge.  
- Menghubungkan issue dengan project board.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Membuat issue | `gh issue create` |
| List issue | `gh issue list` |
| Komentar | `gh issue comment <number>` |
| Tutup issue | `gh issue close <number>` |

### Referensi  
- `https://cli.github.com/manual/gh_issue_create`   
- `https://docs.github.com/en/issues`

---

# **4. 🔀 Pull Requests**  
### Deskripsi  
Pull Request adalah mekanisme untuk mengusulkan perubahan kode dan melakukan review.

### Kegunaan untuk AI Agent  
- Membuat PR otomatis setelah push branch.  
- Menulis deskripsi PR berdasarkan diff.  
- Memberikan review otomatis.  
- Merge PR setelah CI lulus.  
- Sinkronisasi PR dengan project board.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Membuat PR | `gh pr create` |
| Lihat PR | `gh pr view` |
| Review PR | `gh pr review` |
| Merge PR | `gh pr merge` |

### Referensi  
- `https://cli.github.com/manual/gh_pr_create` 
- `https://docs.github.com/en/pull-requests` 

---

# **5. 📁 Projects (Project Management)**  
### Deskripsi  
GitHub Projects (v2) adalah sistem manajemen project berbasis table/kanban.

### Kegunaan untuk AI Agent  
- Membuat board sprint otomatis.  
- Menambahkan issue/PR ke project.  
- Memperbarui status item berdasarkan event.  
- Mengatur custom fields (priority, status, estimate).  
- Membuat laporan progress otomatis.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| List project | `gh project list` |
| Lihat project | `gh project view <id>` |
| Tambah item | `gh project item-add <id>` |
| Edit project | `gh project edit <id>` |

### Referensi  
- `https://cli.github.com/manual/gh_project_list` 
- `https://docs.github.com/en/issues/planning-and-tracking-with-projects`

---

# **7. 🧪 Code Review & Code Search**  

## **7.1 Code Review**  
### Deskripsi  
Review perubahan kode, komentar inline, dan analisis kualitas.

### Kegunaan untuk AI Agent  
- Memberikan rekomendasi perbaikan kode.  
- Menemukan bug atau anti-pattern.  
- Menulis komentar otomatis pada PR.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Review PR | `gh pr review` |

### Referensi  
- `https://github.com/features/code-review` 

---

## **7.2 Code Search**  
### Deskripsi  
Pencarian kode tingkat lanjut di seluruh repositori.

### Kegunaan untuk AI Agent  
- Mencari pola bug.  
- Menganalisis dependency.  
- Menemukan referensi fungsi/variabel.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Cari kode | `gh search code "<query>"` |

### Referensi  
- `https://github.com/features/code-search` 

---

# **8. 💬 Discussions**  
### Deskripsi  
Forum diskusi untuk komunitas dalam repo atau organisasi.

### Kegunaan untuk AI Agent  
- Membuat thread dokumentasi otomatis.  
- Menjawab pertanyaan pengguna.  
- Mengarsipkan diskusi lama.  
- Menghubungkan diskusi dengan issue/PR.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Membuat diskusi | `gh discussion create` |
| List diskusi | `gh discussion list` |

### Referensi  
- `https://github.com/features/discussions` 
- `https://cli.github.com/manual/gh_discussion` 

---

# **13. 🧰 GitHub CLI Extensions**  
### Deskripsi  
Ekstensi CLI yang menambah kemampuan GitHub CLI.

### Kegunaan untuk AI Agent  
- Menambah fitur otomatisasi (release, linting, changelog).  
- Menjalankan script custom.  
- Memperluas kemampuan CLI tanpa modifikasi internal.  

### GitHub CLI Commands  
| Fungsi | Command |
|--------|---------|
| Install extension | `gh extension install <repo>` |
| List extension | `gh extension list` |
| Remove extension | `gh extension remove <name>` |

### Referensi  
- `https://cli.github.com/manual/gh_extension` 

---

# **14. 📝 Documentation Tools**  
### Deskripsi  
Fitur dokumentasi seperti README, Wiki, dan Markdown.

### Kegunaan untuk AI Agent  
- Generate README otomatis.  
- Update changelog berdasarkan commit.  
- Membuat dokumentasi API.  
- Menulis panduan instalasi otomatis.  

### Referensi  
- `https://docs.github.com/en/get-started/writing-on-github`
- `https://docs.github.com/en/communities/documenting-your-project`