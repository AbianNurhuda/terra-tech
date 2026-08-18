import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, X, AlertCircle, FolderOpen } from "lucide-react"

export default function DocumentCategoriesManagement({ showToast }) {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [error, setError] = useState("")

  const defaultCategories = [
    { id: 1, name: "Arsip Administrasi", slug: "arsip-administrasi", description: "Berkas formal administrasi kantor dan keuangan", count: 1 },
    { id: 2, name: "Modul Teknis", slug: "modul-teknis", description: "Spesifikasi fitur dan integrasi API sistem", count: 1 },
    { id: 3, name: "Panduan Pengguna", slug: "panduan-pengguna", description: "Buku panduan operasional user & staf", count: 1 },
    { id: 4, name: "Template Dokumen", slug: "template-dokumen", description: "Format standard dokumen kerja sama", count: 1 }
  ]

  useEffect(() => {
    const savedCats = localStorage.getItem("cms_file_categories")
    let cats = defaultCategories
    if (savedCats) {
      cats = JSON.parse(savedCats)
    }

    // Refresh dynamic file counts from actual files list
    const savedFiles = localStorage.getItem("cms_files")
    if (savedFiles) {
      const files = JSON.parse(savedFiles)
      cats = cats.map(c => ({
        ...c,
        count: files.filter(f => f.category === c.name).length
      }))
    }
    
    setCategories(cats)
    localStorage.setItem("cms_file_categories", JSON.stringify(cats))
  }, [])

  const saveToStorage = (list) => {
    setCategories(list)
    localStorage.setItem("cms_file_categories", JSON.stringify(list))
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()
  }

  // Handle Search
  const filteredCats = categories.filter((c) => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  })

  // CRUD Handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.description) {
      setError("Nama kategori dan deskripsi wajib diisi.")
      return
    }

    if (categories.some(c => c.name.toLowerCase() === formData.name.toLowerCase())) {
      setError("Nama kategori sudah digunakan.")
      return
    }

    const newCat = {
      id: Date.now(),
      name: formData.name,
      slug: generateSlug(formData.name),
      description: formData.description,
      count: 0
    }

    const updated = [...categories, newCat]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ name: "", description: "" })
    showToast("Kategori berkas baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.description) {
      setError("Nama kategori dan deskripsi wajib diisi.")
      return
    }

    if (categories.some(c => c.name.toLowerCase() === formData.name.toLowerCase() && c.id !== selectedCat.id)) {
      setError("Nama kategori sudah digunakan oleh kategori lain.")
      return
    }

    // Also update files that belong to this category if name changed
    const savedFiles = localStorage.getItem("cms_files")
    if (savedFiles && selectedCat.name !== formData.name) {
      const files = JSON.parse(savedFiles)
      const updatedFiles = files.map(f => f.category === selectedCat.name ? { ...f, category: formData.name } : f)
      localStorage.setItem("cms_files", JSON.stringify(updatedFiles))
    }

    const updated = categories.map((c) =>
      c.id === selectedCat.id
        ? { ...c, name: formData.name, slug: generateSlug(formData.name), description: formData.description }
        : c
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Kategori berkas berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    // Check if category has files inside it
    if (selectedCat.count > 0) {
      showToast(`Gagal menghapus: Kategori '${selectedCat.name}' memiliki ${selectedCat.count} file dokumen didalamnya. Hapus/pindahkan dokumen terlebih dahulu.`, "error")
      setIsDeleteOpen(false)
      return
    }

    const updated = categories.filter(c => c.id !== selectedCat.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Kategori berkas berhasil dihapus.", "success")
  }

  const openEditModal = (cat) => {
    setSelectedCat(cat)
    setFormData({ name: cat.name, description: cat.description })
    setError("")
    setIsEditOpen(true)
  }

  const openDeleteModal = (cat) => {
    setSelectedCat(cat)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Kategori Dokumen</h2>
          <p className="text-text-muted text-xs mt-0.5">Klasifikasikan direktori penyimpanan berkas dengan membuat kategori baru.</p>
        </div>
        <button
          onClick={() => {
            setError("")
            setFormData({ name: "", description: "" })
            setIsAddOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau deskripsi kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                <th className="py-4 px-6">Nama Kategori</th>
                <th className="py-4 px-6">Slug URL</th>
                <th className="py-4 px-6">Deskripsi Kategori</th>
                <th className="py-4 px-6 text-center">Jumlah Berkas</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredCats.length > 0 ? (
                filteredCats.map((cat) => (
                  <tr key={cat.id} className="hover:bg-dark-base/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary">{cat.name}</td>
                    <td className="py-4 px-6 font-mono text-[10px] text-text-muted">/{cat.slug}</td>
                    <td className="py-4 px-6 max-w-sm truncate" title={cat.description}>{cat.description}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-dark-base border border-dark-border font-bold text-[10px]">
                        <FolderOpen className="h-3 w-3 text-text-muted mr-1" />
                        <span>{cat.count} berkas</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Edit Kategori"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cat)}
                          title="Hapus Kategori"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">
                    Tidak ada kategori berkas ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Kategori */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Tambah Kategori Baru</h3>
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Arsip Administrasi..."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Kategori</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ketik rincian isi tipe berkas yang akan disimpan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-dark-border flex gap-3 justify-end">
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Kategori */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit Kategori Berkas</h3>
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Kategori</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-dark-border flex gap-3 justify-end">
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
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Kategori */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Kategori Berkas?</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed font-semibold">
                  Apakah Anda yakin ingin menghapus kategori "{selectedCat?.name}"? Tindakan ini memerlukan konfirmasi dan tidak dapat dibatalkan.
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
                Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
