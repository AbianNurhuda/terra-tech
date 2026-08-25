import { useState, useEffect } from "react"
import { defaultBanners } from "../../utils/cmsDefaults"
import { Search, Plus, Edit2, Trash2, X, AlertCircle, Save, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react"

export default function CmsBannerSlider({ readOnly = false, showToast }) {
  const [banners, setBanners] = useState([])
  const [error, setError] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ title: "", description: "", image: "", status: "Published", sort_order: 1 })

  useEffect(() => {
    const saved = localStorage.getItem("cms_banners")
    if (saved) {
      setBanners(JSON.parse(saved))
    } else {
      setBanners(defaultBanners)
      localStorage.setItem("cms_banners", JSON.stringify(defaultBanners))
    }
  }, [])

  const saveToStorage = (list) => {
    const sorted = [...list].sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    setBanners(sorted)
    localStorage.setItem("cms_banners", JSON.stringify(sorted))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "sort_order" ? Number(value) : value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.image) {
      setError("Judul dan URL Gambar wajib diisi.")
      return
    }

    const newBanner = {
      id: "banner-" + Date.now(),
      ...formData,
      sort_order: banners.length > 0 ? Math.max(...banners.map(b => b.sort_order)) + 1 : 1
    }

    const updated = [...banners, newBanner]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ title: "", description: "", image: "", status: "Published", sort_order: 1 })
    showToast("Banner baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.image) {
      setError("Judul dan URL Gambar wajib diisi.")
      return
    }

    const updated = banners.map((b) =>
      b.id === selectedBanner.id ? { ...b, ...formData } : b
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Data Banner berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = banners.filter((b) => b.id !== selectedBanner.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Banner berhasil dihapus!", "success")
  }

  const moveOrder = (index, direction) => {
    if (readOnly) return
    const newBanners = [...banners]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newBanners.length) return

    // Swap sort orders
    const temp = newBanners[index].sort_order
    newBanners[index].sort_order = newBanners[targetIndex].sort_order
    newBanners[targetIndex].sort_order = temp

    saveToStorage(newBanners)
    showToast("Urutan banner berhasil diperbarui!", "success")
  }

  const openAddModal = () => {
    setError("")
    setFormData({ title: "", description: "", image: "", status: "Published", sort_order: banners.length + 1 })
    setIsAddOpen(true)
  }

  const openEditModal = (banner) => {
    setError("")
    setSelectedBanner(banner)
    setFormData({ ...banner })
    setIsEditOpen(true)
  }

  const openDeleteModal = (banner) => {
    setSelectedBanner(banner)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary font-display">Banner Slider List</h3>
          <p className="text-text-muted text-xs mt-1">
            Kelola banner slider promosi halaman utama, atur urutan tampilannya, dan pratinjau gambarnya.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Banner</span>
          </button>
        )}
      </div>

      {/* Banner Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-white">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-dark-base border-b border-dark-border font-bold text-text-secondary text-left">
              <th className="p-4 w-16">Urutan</th>
              <th className="p-4 w-28">Preview</th>
              <th className="p-4">Informasi Banner</th>
              <th className="p-4 w-24">Status</th>
              {!readOnly && <th className="p-4 w-28 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-text-primary">
            {banners.length > 0 ? (
              banners.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-dark-base/40 transition-colors">
                  <td className="p-4 font-bold text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm font-display text-accent-cyan font-bold">{banner.sort_order}</span>
                      {!readOnly && (
                        <div className="flex gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => moveOrder(index, "up")}
                            className="p-1 rounded bg-dark-base border border-dark-border hover:bg-dark-border text-text-secondary disabled:opacity-40"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={index === banners.length - 1}
                            onClick={() => moveOrder(index, "down")}
                            className="p-1 rounded bg-dark-base border border-dark-border hover:bg-dark-border text-text-secondary disabled:opacity-40"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="h-14 w-24 rounded-lg overflow-hidden border border-dark-border bg-dark-base">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/120x70/27272a/a1a1aa?text=No+Image"
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-text-primary">{banner.title}</h4>
                    <p className="text-[11px] text-text-secondary line-clamp-2 max-w-lg leading-relaxed">
                      {banner.description || "Tidak ada deskripsi."}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        banner.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {banner.status}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(banner)}
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
            ) : (
              <tr>
                <td colSpan={readOnly ? 4 : 5} className="p-8 text-center text-text-muted">
                  Belum ada data banner slider. Klik "Tambah Banner" untuk membuat baru.
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
                <span>Tambah Banner Baru</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Judul Banner</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan judul banner"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Ringkas</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi singkat banner..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Banner</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/banner/1600/600"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar</span>
                    </span>
                    <div className="h-28 w-48 rounded-lg overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.image}
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
                <span>Edit Banner Slider</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Judul Banner</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan judul banner"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Ringkas</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi singkat banner..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Banner</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/banner/1600/600"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar</span>
                    </span>
                    <div className="h-28 w-48 rounded-lg overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.image}
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
              <h3 className="font-bold text-base text-text-primary font-display">Hapus Banner Slider</h3>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus banner <strong>"{selectedBanner?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
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
