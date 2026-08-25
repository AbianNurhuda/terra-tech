import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, Eye, X, AlertCircle, Tags, BookOpen, Layers } from "lucide-react"

export default function InformationManagement({ showToast, readOnly = false }) {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState(["Teknologi", "Bisnis", "Pengumuman", "Tutorial"])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ title: "", category: "Teknologi", status: "Published", content: "" })
  const [newCategoryName, setNewCategoryName] = useState("")
  const [error, setError] = useState("")

  const defaultArticles = [
    { id: 1, title: "Masa Depan AI dalam Rekayasa Perangkat Lunak", slug: "masa-depan-ai-rekayasa-perangkat-lunak", category: "Teknologi", status: "Published", views: 245, author: "Super Admin", publishDate: "2026-08-01", content: "Kecerdasan Buatan (AI) telah merevolusi cara pengembang menulis kode. Dari autokomplit cerdas hingga generator kode, teknologi ini mempercepat siklus rilis dan meminimalkan bug." },
    { id: 2, title: "Strategi Transformasi Digital UMKM Indonesia", slug: "strategi-transformasi-digital-umkm", category: "Bisnis", status: "Published", views: 180, author: "Budi Santoso", publishDate: "2026-08-03", content: "UMKM yang mengadopsi platform digital mencatat kenaikan profit hingga 40%. Artikel ini membedah langkah taktis migrasi sistem manual ke cloud e-commerce." },
    { id: 3, title: "Meluncurkan Fitur Layanan Integrasi Cloud TerraTech", slug: "fitur-integrasi-cloud-terratech", category: "Pengumuman", status: "Draft", views: 0, author: "Rian Prasetyo", publishDate: "—", content: "Kami mengumumkan integrasi multicloud yang mendukung AWS, GCP, dan Azure secara native dalam portal manajemen klien kami. Fitur ini dirancang untuk skalabilitas tinggi." },
    { id: 4, title: "Panduan Dasar Optimasi SEO Website Perusahaan", slug: "panduan-dasar-optimasi-seo-corporate", category: "Tutorial", status: "Published", views: 320, author: "Rian Prasetyo", publishDate: "2026-08-05", content: "Langkah-langkah praktis meningkatkan visibilitas mesin pencari untuk situs corporate, mulai dari optimasi loading speed, perbaikan tag struktur, hingga riset kata kunci kompetitif." }
  ]

  useEffect(() => {
    const savedArticles = localStorage.getItem("cms_articles")
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles))
    } else {
      setArticles(defaultArticles)
      localStorage.setItem("cms_articles", JSON.stringify(defaultArticles))
    }

    const savedCats = localStorage.getItem("cms_article_categories")
    if (savedCats) {
      setCategories(JSON.parse(savedCats))
    } else {
      localStorage.setItem("cms_article_categories", JSON.stringify(categories))
    }
  }, [])

  const saveArticlesToStorage = (list) => {
    setArticles(list)
    localStorage.setItem("cms_articles", JSON.stringify(list))
  }

  const saveCategoriesToStorage = (list) => {
    setCategories(list)
    localStorage.setItem("cms_article_categories", JSON.stringify(list))
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()
  }

  // Handle Search & Filters
  const filteredArticles = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCat = filterCategory === "all" || a.category === filterCategory
    const matchesStatus = filterStatus === "all" || a.status === filterStatus
    return matchesSearch && matchesCat && matchesStatus
  })

  // CRUD Handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.content) {
      setError("Judul dan isi artikel wajib diisi.")
      return
    }

    const newArt = {
      id: Date.now(),
      title: formData.title,
      slug: generateSlug(formData.title),
      category: formData.category,
      status: formData.status,
      views: 0,
      author: localStorage.getItem("userName") || "Super Admin",
      publishDate: formData.status === "Published" ? new Date().toISOString().split("T")[0] : "—",
      content: formData.content
    }

    const updated = [newArt, ...articles]
    saveArticlesToStorage(updated)
    setIsAddOpen(false)
    setFormData({ title: "", category: categories[0] || "Teknologi", status: "Published", content: "" })
    showToast("Artikel baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.content) {
      setError("Judul dan isi artikel wajib diisi.")
      return
    }

    const updated = articles.map((a) =>
      a.id === selectedArticle.id
        ? {
            ...a,
            title: formData.title,
            slug: generateSlug(formData.title),
            category: formData.category,
            status: formData.status,
            publishDate: formData.status === "Published" && a.publishDate === "—"
              ? new Date().toISOString().split("T")[0]
              : formData.status === "Draft" ? "—" : a.publishDate,
            content: formData.content
          }
        : a
    )
    saveArticlesToStorage(updated)
    setIsEditOpen(false)
    showToast("Artikel berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = articles.filter((a) => a.id !== selectedArticle.id)
    saveArticlesToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Artikel berhasil dihapus.", "success")
  }

  // Category CRUDs
  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    if (categories.includes(newCategoryName.trim())) {
      showToast("Kategori sudah terdaftar.", "error")
      return
    }
    const updated = [...categories, newCategoryName.trim()]
    saveCategoriesToStorage(updated)
    setNewCategoryName("")
    showToast("Kategori berhasil ditambahkan!", "success")
  }

  const handleDeleteCategory = (catToDelete) => {
    // Check if category is in use
    if (articles.some(a => a.category === catToDelete)) {
      showToast(`Gagal menghapus: Kategori '${catToDelete}' sedang digunakan oleh artikel.`, "error")
      return
    }
    const updated = categories.filter(c => c !== catToDelete)
    saveCategoriesToStorage(updated)
    showToast("Kategori berhasil dihapus.", "success")
  }

  const openEditModal = (art) => {
    setSelectedArticle(art)
    setFormData({ title: art.title, category: art.category, status: art.status, content: art.content })
    setError("")
    setIsEditOpen(true)
  }

  const openViewModal = (art) => {
    setSelectedArticle(art)
    setIsViewOpen(true)
  }

  const openDeleteModal = (art) => {
    setSelectedArticle(art)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Informasi Perusahaan</h2>
          <p className="text-text-muted text-xs mt-0.5">Tulis, edit, kelompokkan, dan kelola publikasi artikel/berita Terra Tech.</p>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 border border-dark-border bg-white text-text-secondary font-bold text-xs rounded-xl px-4 py-2.5 hover:bg-dark-base transition-all"
            >
              <Tags className="h-4 w-4 text-text-muted" />
              <span>Kelola Kategori</span>
            </button>
            <button
              onClick={() => {
                setError("")
                setFormData({ title: "", category: categories[0] || "Teknologi", status: "Published", content: "" })
                setIsAddOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Artikel</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari judul artikel atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Listing */}
      <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                <th className="py-4 px-6">Judul Artikel</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Pembaca (Views)</th>
                <th className="py-4 px-6">Penulis</th>
                <th className="py-4 px-6">Tanggal Rilis</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-dark-base/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary max-w-xs truncate">
                      <div className="font-bold">{art.title}</div>
                      <div className="text-[10px] text-text-muted mt-0.5 font-normal truncate">/{art.slug}</div>
                    </td>
                    <td className="py-4 px-6">{art.category}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        art.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {art.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold">{art.views} kali</td>
                    <td className="py-4 px-6 font-medium">{art.author}</td>
                    <td className="py-4 px-6">{art.publishDate}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openViewModal(art)}
                          title="Lihat Detail"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => openEditModal(art)}
                              title="Edit Artikel"
                              className="p-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(art)}
                              title="Hapus Artikel"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-text-muted">
                    Belum ada artikel yang ditambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Artikel */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Tambah Artikel Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Artikel</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ketik judul artikel..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Isi Konten Artikel</label>
                <textarea
                  rows="10"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Ketik isi artikel secara lengkap di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none leading-relaxed resize-none"
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Status Publikasi:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="text-xs rounded-xl border border-dark-border px-3 py-1 bg-white focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary hover:bg-dark-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
                  >
                    Simpan & Rilis
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Artikel */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit Artikel</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Artikel</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Isi Konten Artikel</label>
                <textarea
                  rows="10"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none leading-relaxed resize-none"
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Status Publikasi:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="text-xs rounded-xl border border-dark-border px-3 py-1 bg-white focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary hover:bg-dark-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lihat Artikel */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">{selectedArticle?.category}</span>
                <h3 className="font-display font-bold text-sm text-text-primary mt-0.5">{selectedArticle?.title}</h3>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto leading-relaxed text-xs text-text-secondary">
              <div className="flex gap-4 border-b border-dark-border pb-3 text-[10px] text-text-muted">
                <span>Penulis: <strong>{selectedArticle?.author}</strong></span>
                <span>•</span>
                <span>Rilis: <strong>{selectedArticle?.publishDate}</strong></span>
                <span>•</span>
                <span>Dibaca: <strong>{selectedArticle?.views} kali</strong></span>
                <span>•</span>
                <span>Status: <strong>{selectedArticle?.status}</strong></span>
              </div>
              <p className="whitespace-pre-wrap leading-loose text-text-primary">
                {selectedArticle?.content}
              </p>
            </div>
            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
              >
                Tutup Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hapus Artikel */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Artikel?</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed font-semibold">
                  Apakah Anda yakin ingin menghapus artikel "{selectedArticle?.title}"? Tindakan ini permanen.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary hover:bg-dark-base"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kelola Kategori */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Tags className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Kelola Kategori Artikel</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Add New Category form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kategori baru..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-dark-border rounded-xl text-xs focus:outline-none focus:border-accent-cyan/60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* Categories list */}
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-semibold text-text-secondary">Daftar Kategori Saat Ini:</h4>
                <div className="border border-dark-border rounded-xl divide-y divide-dark-border overflow-hidden max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-3 text-xs">
                      <span className="font-medium text-text-primary">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-text-muted hover:text-rose-600 transition-colors p-1 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-accent-cyan hover:bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
