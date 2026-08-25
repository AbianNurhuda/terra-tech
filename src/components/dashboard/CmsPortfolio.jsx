import { useState, useEffect } from "react"
import { portfolioService } from "../../services/api.service"
import { Plus, Edit2, Trash2, X, AlertCircle, Save, Image as ImageIcon } from "lucide-react"

export default function CmsPortfolio({ readOnly = false, showToast }) {
  const [portfolios, setPortfolios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ title: "", category: "Web Development", description: "", cover_image_url: "", client_name: "", status: "published" })
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])

  const buildPortfolioFormData = () => {
    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "cover_image_url") payload.append(key, value)
    })
    if (coverFile) payload.append("cover_image", coverFile)
    return payload
  }

  const isValidImageFile = (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type) && file.size <= 2 * 1024 * 1024

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isValidImageFile(file)) {
      setError("Gambar cover harus berupa PNG, JPG, JPEG, atau WEBP dengan ukuran maksimal 2 MB.")
      e.target.value = ""
      return
    }
    setError("")
    setCoverFile(file)
    setFormData((prev) => ({ ...prev, cover_image_url: URL.createObjectURL(file) }))
  }

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.some((file) => !isValidImageFile(file))) {
      setError("Gambar gallery harus berupa PNG, JPG, JPEG, atau WEBP dengan ukuran maksimal 2 MB.")
      e.target.value = ""
      return
    }
    setError("")
    setGalleryFiles(files)
  }

  const loadPortfolios = async () => {
    setIsLoading(true)
    const response = await portfolioService.getPortfolios()
    if (response.success) {
      const data = Array.isArray(response.data) ? response.data : response.data?.items || []
      setPortfolios(data)
      setError("")
    } else {
      setError(response.message || "Gagal memuat portfolio.")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadPortfolios()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description || !coverFile) {
      setError("Judul, Deskripsi, dan Gambar Portofolio wajib diisi.")
      return
    }

    const response = await portfolioService.createPortfolio(buildPortfolioFormData())
    if (!response.success) {
      setError(response.message || "Gagal menambahkan portfolio.")
      return
    }
    const created = response.data
    for (const file of galleryFiles) await portfolioService.uploadGallery(created.id, file)
    await loadPortfolios()
    setIsAddOpen(false)
    setFormData({ title: "", category: "Web Development", description: "", cover_image_url: "", client_name: "", status: "published" })
    setCoverFile(null)
    setGalleryFiles([])
    showToast("Studi kasus portofolio baru berhasil ditambahkan!", "success")
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description || (!formData.cover_image_url && !coverFile)) {
      setError("Judul, Deskripsi, dan Gambar Portofolio wajib diisi.")
      return
    }

    const response = await portfolioService.updatePortfolio(selectedPortfolio.id, buildPortfolioFormData())
    if (!response.success) {
      setError(response.message || "Gagal memperbarui portfolio.")
      return
    }
    for (const file of galleryFiles) await portfolioService.uploadGallery(selectedPortfolio.id, file)
    await loadPortfolios()
    setIsEditOpen(false)
    setCoverFile(null)
    setGalleryFiles([])
    showToast("Portofolio berhasil diperbarui!", "success")
  }

  const handleDelete = async () => {
    const response = await portfolioService.deletePortfolio(selectedPortfolio.id)
    if (!response.success) {
      setError(response.message || "Gagal menghapus portfolio.")
      setIsDeleteOpen(false)
      return
    }
    setPortfolios((items) => items.filter((p) => p.id !== selectedPortfolio.id))
    setIsDeleteOpen(false)
    showToast("Portofolio berhasil dihapus!", "success")
  }

  const openAddModal = () => {
    setError("")
    setFormData({ title: "", category: "Web Development", description: "", cover_image_url: "", client_name: "", status: "published" })
    setCoverFile(null)
    setGalleryFiles([])
    setIsAddOpen(true)
  }

  const openEditModal = (portfolio) => {
    setError("")
    setSelectedPortfolio(portfolio)
    setFormData({
      title: portfolio.title || "",
      category: portfolio.category || "Web Development",
      description: portfolio.description || "",
      cover_image_url: portfolio.cover_image_url || "",
      client_name: portfolio.client_name || "",
      status: portfolio.status || "draft"
    })
    setCoverFile(null)
    setGalleryFiles([])
    setIsEditOpen(true)
  }

  const openDeleteModal = (portfolio) => {
    setSelectedPortfolio(portfolio)
    setIsDeleteOpen(true)
  }

  const handleDeleteGalleryImage = async (index) => {
    const response = await portfolioService.deleteGalleryImage(selectedPortfolio.id, index)
    if (!response.success) {
      setError(response.message || "Gagal menghapus gambar gallery.")
      return
    }
    const refreshed = await portfolioService.getPortfolio(selectedPortfolio.id)
    if (refreshed.success) {
      setSelectedPortfolio(refreshed.data)
      setPortfolios((items) => items.map((item) => item.id === refreshed.data.id ? refreshed.data : item))
    }
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary font-display">Portfolio List</h3>
          <p className="text-text-muted text-xs mt-1">
            Kelola data dan ulasan portofolio proyek Terra Tech untuk meyakinkan calon klien.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Portofolio</span>
          </button>
        )}
      </div>

      {/* Portfolio Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-white">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-dark-base border-b border-dark-border font-bold text-text-secondary text-left">
              <th className="p-4 w-28">Preview</th>
              <th className="p-4 w-40">Judul Proyek</th>
              <th className="p-4 w-24">Kategori</th>
              <th className="p-4">Deskripsi Ringkas</th>
              <th className="p-4 w-24">Status</th>
              {!readOnly && <th className="p-4 w-28 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-text-primary">
            {isLoading ? (
              <tr><td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-text-muted">Memuat portfolio...</td></tr>
            ) : portfolios.length > 0 ? (
              portfolios.map((p) => (
                <tr key={p.id} className="hover:bg-dark-base/40 transition-colors">
                  <td className="p-4">
                    <div className="h-14 w-24 rounded-lg overflow-hidden border border-dark-border bg-dark-base">
                      <img
                        src={p.cover_image_url || "https://placehold.co/120x70/27272a/a1a1aa?text=No+Image"}
                        alt={p.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/120x70/27272a/a1a1aa?text=No+Image"
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <h4 className="font-bold text-xs text-text-primary leading-tight">{p.title}</h4>
                    {p.client_name && <span className="text-[10px] text-text-muted block mt-1">{p.client_name}</span>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-dark-base border border-dark-border text-text-secondary text-[9px] font-bold uppercase whitespace-nowrap">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 max-w-md">
                      {p.description}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-rose-600">{error}<br /><button onClick={loadPortfolios} className="mt-2 underline">Coba lagi</button></td></tr>
            ) : (
              <tr>
                <td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-text-muted">
                  Belum ada data portofolio. Klik "Tambah Portofolio" untuk membuat baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-dark-border shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[90vh]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
            <div className="p-6 border-b border-dark-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-text-primary font-display flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Tambah Portofolio Baru</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Judul Proyek</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama proyek"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 font-semibold"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Tautan URL Proyek (Project Link)</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="Nama klien"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Status Tampilan</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat Studi Kasus</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan ringkasan pengerjaan proyek dan pencapaian..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Gambar Banner Portofolio</label>
                  <input
                    type="file"
                    name="cover_image"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCoverChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.cover_image_url && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar Proyek</span>
                    </span>
                    <div className="h-28 w-48 rounded-lg overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.cover_image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/240x140/27272a/a1a1aa?text=Not+Found"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex justify-end gap-3 shrink-0">
              <label className="mr-auto btn-secondary py-2 px-3.5 text-xs cursor-pointer">
                Tambah Gallery
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
              <button onClick={() => setIsAddOpen(false)} className="btn-secondary py-2 px-3.5 text-xs">Batal</button>
              <button onClick={handleAdd} className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shadow-sm">
                <Save className="h-4 w-4" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-dark-border shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[90vh]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
            <div className="p-6 border-b border-dark-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-text-primary font-display flex items-center gap-2">
                <Edit2 className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Edit Portofolio</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Judul Proyek</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama proyek"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 font-semibold"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Tautan URL Proyek (Project Link)</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="Nama klien"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Status Tampilan</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat Studi Kasus</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan ringkasan pengerjaan proyek dan pencapaian..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Gambar Banner Portofolio</label>
                  <input
                    type="file"
                    name="cover_image"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCoverChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.cover_image_url && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar Proyek</span>
                    </span>
                    <div className="h-28 w-48 rounded-lg overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.cover_image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/240x140/27272a/a1a1aa?text=Not+Found"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex justify-end gap-3 shrink-0">
              {selectedPortfolio?.gallery_image_urls?.length > 0 && (
                <div className="absolute left-6 bottom-20 right-6 flex gap-2 overflow-x-auto">
                  {selectedPortfolio.gallery_image_urls.map((url, index) => (
                    <div key={url} className="relative h-12 w-16 shrink-0 rounded overflow-hidden border border-dark-border">
                      <img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                      {!readOnly && <button type="button" onClick={() => handleDeleteGalleryImage(index)} className="absolute right-0 top-0 bg-rose-600 text-white p-0.5" aria-label="Hapus gambar gallery"><X className="h-3 w-3" /></button>}
                    </div>
                  ))}
                </div>
              )}
              <label className="mr-auto btn-secondary py-2 px-3.5 text-xs cursor-pointer">
                Tambah Gallery
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
              <button onClick={() => setIsEditOpen(false)} className="btn-secondary py-2 px-3.5 text-xs">Batal</button>
              <button onClick={handleEdit} className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shadow-sm">
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-dark-border shadow-2xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary font-display">Hapus Portofolio</h3>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus portofolio <strong>"{selectedPortfolio?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setIsDeleteOpen(false)} className="btn-secondary py-2 px-3.5 text-xs">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
