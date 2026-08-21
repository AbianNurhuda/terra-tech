import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  FolderOpen,
  RefreshCw,
  Inbox,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { documentCategoryService } from "@/services/api.service"

export default function DocumentCategoriesManagement({ showToast, readOnly = false }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Pagination
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [formErrors, setFormErrors] = useState({})
  const [modalGeneralError, setModalGeneralError] = useState("")

  // Fetch Categories from Backend API
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await documentCategoryService.getCategories({
        search: search.trim() || undefined,
        page: currentPage
      })

      if (res.success) {
        const rawData = res.data
        let catList = []
        if (Array.isArray(rawData)) {
          catList = rawData
          setTotalItems(rawData.length)
          setTotalPages(1)
        } else if (rawData && Array.isArray(rawData.data)) {
          catList = rawData.data
          setCurrentPage(rawData.current_page || 1)
          setTotalPages(rawData.last_page || 1)
          setTotalItems(rawData.total || rawData.data.length)
        } else if (rawData && typeof rawData === "object") {
          catList = rawData.categories || rawData.items || []
          setTotalItems(catList.length)
          setTotalPages(1)
        }
        setCategories(catList)
      } else {
        if (res.status === 404) {
          setError("Endpoint kategori dokumen belum tersedia di API backend. Silakan hubungi administrator/backend developer.")
        } else if (res.status === 401) {
          setError("Sesi Anda telah berakhir. Silakan login kembali.")
        } else if (res.status === 403) {
          setError("Anda tidak memiliki izin (otorisasi) untuk mengakses data kategori dokumen.")
        } else {
          setError(res.message || "Gagal memuat kategori dokumen dari server.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("Tidak dapat terhubung ke server backend. Periksa koneksi internet atau konfigurasi API.")
    } finally {
      setLoading(false)
    }
  }, [search, currentPage])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Create Category
  const handleAdd = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setModalGeneralError("")

    const errs = {}
    if (!formData.name.trim()) errs.name = "Nama kategori wajib diisi."
    if (!formData.description.trim()) errs.description = "Deskripsi kategori wajib diisi."

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await documentCategoryService.createCategory(formData)
      if (res.success) {
        setIsAddOpen(false)
        setFormData({ name: "", description: "" })
        showToast("Kategori dokumen baru berhasil ditambahkan!", "success")
        fetchCategories()
      } else {
        if (res.errors && typeof res.errors === "object") {
          const apiErrs = {}
          Object.keys(res.errors).forEach((key) => {
            apiErrs[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          })
          setFormErrors(apiErrs)
        }
        if (res.status === 404) {
          setModalGeneralError("Endpoint tambah kategori dokumen belum tersedia di API backend.")
        } else {
          setModalGeneralError(res.message || "Gagal menambahkan kategori dokumen.")
        }
      }
    } catch (err) {
      console.error(err)
      setModalGeneralError("Terjadi kendala jaringan saat menghubungi server backend.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit Category
  const handleEdit = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setModalGeneralError("")

    const errs = {}
    if (!formData.name.trim()) errs.name = "Nama kategori wajib diisi."
    if (!formData.description.trim()) errs.description = "Deskripsi kategori wajib diisi."

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await documentCategoryService.updateCategory(selectedCat.id, formData)
      if (res.success) {
        setIsEditOpen(false)
        showToast("Kategori dokumen berhasil diperbarui!", "success")
        fetchCategories()
      } else {
        if (res.errors && typeof res.errors === "object") {
          const apiErrs = {}
          Object.keys(res.errors).forEach((key) => {
            apiErrs[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          })
          setFormErrors(apiErrs)
        }
        if (res.status === 404) {
          setModalGeneralError("Endpoint perbarui kategori dokumen belum tersedia di API backend.")
        } else {
          setModalGeneralError(res.message || "Gagal memperbarui kategori dokumen.")
        }
      }
    } catch (err) {
      console.error(err)
      setModalGeneralError("Terjadi kendala jaringan saat menghubungi server backend.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Category
  const handleDelete = async () => {
    if (!selectedCat) return

    setIsSubmitting(true)
    try {
      const res = await documentCategoryService.deleteCategory(selectedCat.id)
      if (res.success) {
        setIsDeleteOpen(false)
        showToast("Kategori dokumen berhasil dihapus.", "success")
        fetchCategories()
      } else {
        if (res.status === 404) {
          showToast("Endpoint hapus kategori dokumen belum tersedia di API backend.", "error")
        } else {
          const msg = res.message || "Gagal menghapus kategori dokumen."
          showToast(msg, "error")
        }
        setIsDeleteOpen(false)
      }
    } catch (err) {
      console.error(err)
      showToast("Terjadi kendala jaringan saat menghubungi server backend.", "error")
      setIsDeleteOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (cat) => {
    setSelectedCat(cat)
    setFormData({
      name: cat.name || "",
      description: cat.description || ""
    })
    setFormErrors({})
    setModalGeneralError("")
    setIsEditOpen(true)
  }

  const openDeleteModal = (cat) => {
    setSelectedCat(cat)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2.5">
            <FolderOpen className="h-5 w-5 text-accent-cyan" />
            <span>Kategori Dokumen & Berkas</span>
          </h2>
          <p className="text-text-muted text-xs mt-1">
            Kelola pengelompokan folder direktori file dokumen resmi perusahaan Terra Tech.
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={() => {
              setFormData({ name: "", description: "" })
              setFormErrors({})
              setModalGeneralError("")
              setIsAddOpen(true)
            }}
            className="px-4 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori</span>
          </button>
        )}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari kategori dokumen berdasarkan nama atau deskripsi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 transition-all"
          />
        </div>

        <button
          onClick={fetchCategories}
          disabled={loading}
          title="Muat ulang data"
          className="p-2 rounded-xl border border-dark-border bg-dark-base hover:bg-white text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent-cyan" : ""}`} />
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 card-surface bg-white p-8">
          <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-secondary font-bold animate-pulse">
            Memuat kategori dokumen dari server...
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Gagal Mengambil Kategori Dokumen</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-md">{error}</p>
          </div>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white">
          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Tidak Ada Kategori Dokumen</h3>
            <p className="text-xs text-text-secondary mt-1">
              {search
                ? "Tidak ada hasil kategori yang cocok dengan pencarian Anda."
                : "Belum ada kategori dokumen yang terdaftar di database backend."}
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={() => {
                setFormData({ name: "", description: "" })
                setFormErrors({})
                setIsAddOpen(true)
              }}
              className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
            >
              Tambah Kategori Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="card-surface bg-white border border-dark-border p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-accent-cyan/40 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Edit Kategori"
                        className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        title="Hapus Kategori"
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-text-primary font-display">{cat.name}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || "Tidak ada deskripsi kategori."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-dark-border flex items-center justify-between text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-text-muted" />
                  <span>{cat.files_count ?? cat.count ?? 0} Dokumen Terkait</span>
                </div>
                {cat.slug && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-dark-base border border-dark-border">
                    {cat.slug}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 card-surface bg-white border border-dark-border rounded-xl flex items-center justify-between text-xs text-text-muted">
          <span>
            Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({totalItems} total kategori)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 border border-dark-border rounded-lg hover:bg-dark-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1.5 border border-dark-border rounded-lg hover:bg-dark-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Tambah Kategori */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Plus className="h-4 w-4 text-accent-cyan" />
                <span>Tambah Kategori Dokumen</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {modalGeneralError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalGeneralError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Kategori *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Arsip Keuangan"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.name && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Kategori *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan jenis berkas yang dimasukkan ke dalam kategori ini..."
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.description ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60 leading-relaxed resize-none`}
                />
                {formErrors.description && (
                  <span className="text-[11px] text-rose-500 font-semibold">{formErrors.description}</span>
                )}
              </div>

              <div className="pt-3 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kategori</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Kategori */}
      {isEditOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-accent-cyan" />
                <span>Edit Kategori Dokumen</span>
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {modalGeneralError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalGeneralError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Kategori *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.name && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Kategori *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.description ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60 leading-relaxed resize-none`}
                />
                {formErrors.description && (
                  <span className="text-[11px] text-rose-500 font-semibold">{formErrors.description}</span>
                )}
              </div>

              <div className="pt-3 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Kategori Confirmation */}
      {isDeleteOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-display font-bold text-sm text-text-primary">Hapus Kategori Dokumen?</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori <strong>{selectedCat.name}</strong>?
                {(selectedCat.files_count > 0 || selectedCat.count > 0) && (
                  <span className="block text-rose-500 font-semibold mt-1">
                    Peringatan: Kategori ini memiliki berkas dokumen terkait.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Kategori</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
