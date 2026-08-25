import { useState, useEffect } from "react"
import { defaultTestimonials } from "../../utils/cmsDefaults"
import { Search, Plus, Edit2, Trash2, X, AlertCircle, Save, Quote, Image as ImageIcon } from "lucide-react"

export default function CmsTestimonials({ readOnly = false, showToast }) {
  const [testimonials, setTestimonials] = useState([])
  const [error, setError] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ customer_name: "", position: "", testimonial: "", image: "", status: "Published" })

  useEffect(() => {
    const saved = localStorage.getItem("cms_testimonials")
    if (saved) {
      setTestimonials(JSON.parse(saved))
    } else {
      setTestimonials(defaultTestimonials)
      localStorage.setItem("cms_testimonials", JSON.stringify(defaultTestimonials))
    }
  }, [])

  const saveToStorage = (list) => {
    setTestimonials(list)
    localStorage.setItem("cms_testimonials", JSON.stringify(list))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.customer_name || !formData.testimonial) {
      setError("Nama Pelanggan dan Isi Testimoni wajib diisi.")
      return
    }

    const newTestimonial = {
      id: "test-" + Date.now(),
      ...formData
    }

    const updated = [...testimonials, newTestimonial]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ customer_name: "", position: "", testimonial: "", image: "", status: "Published" })
    showToast("Testimoni baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.customer_name || !formData.testimonial) {
      setError("Nama Pelanggan dan Isi Testimoni wajib diisi.")
      return
    }

    const updated = testimonials.map((t) =>
      t.id === selectedTestimonial.id ? { ...t, ...formData } : t
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Data Testimoni berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = testimonials.filter((t) => t.id !== selectedTestimonial.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Testimoni berhasil dihapus!", "success")
  }

  const openAddModal = () => {
    setError("")
    setFormData({ customer_name: "", position: "", testimonial: "", image: "", status: "Published" })
    setIsAddOpen(true)
  }

  const openEditModal = (testimonial) => {
    setError("")
    setSelectedTestimonial(testimonial)
    setFormData({ ...testimonial })
    setIsEditOpen(true)
  }

  const openDeleteModal = (testimonial) => {
    setSelectedTestimonial(testimonial)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary font-display">Testimonials Configuration</h3>
          <p className="text-text-muted text-xs mt-1">
            Kelola ulasan dan testimoni dari pelanggan Terra Tech yang akan tampil di Landing Page.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Testimoni</span>
          </button>
        )}
      </div>

      {/* Testimonials Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-white">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-dark-base border-b border-dark-border font-bold text-text-secondary text-left">
              <th className="p-4 w-16 text-center">Avatar</th>
              <th className="p-4 w-48">Nama Pelanggan</th>
              <th className="p-4">Ulasan / Testimoni</th>
              <th className="p-4 w-24">Status</th>
              {!readOnly && <th className="p-4 w-28 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-text-primary">
            {testimonials.length > 0 ? (
              testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-dark-base/40 transition-colors">
                  <td className="p-4 text-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-dark-border bg-dark-base mx-auto">
                      <img
                        src={t.image}
                        alt={t.customer_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/100x100/27272a/a1a1aa?text=User"
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <h4 className="font-bold text-sm text-text-primary">{t.customer_name}</h4>
                    <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wide">{t.position}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 max-w-lg">
                      "{t.testimonial}"
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(t)}
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
                  Belum ada data testimoni. Klik "Tambah Testimoni" untuk membuat baru.
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
                <span>Tambah Testimoni Baru</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Nama Pelanggan</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama pelanggan"
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
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Jabatan / Instansi (Position)</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Contoh: CEO, Toko Bagus atau Direktur IT"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Isi Ulasan / Testimoni</label>
                  <textarea
                    name="testimonial"
                    rows="3"
                    value={formData.testimonial}
                    onChange={handleInputChange}
                    placeholder="Tuliskan isi ulasan pelanggan mengenai produk/jasa Terra Tech..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Avatar Pelanggan</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/avatar/160/160"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Foto Pelanggan</span>
                    </span>
                    <div className="h-16 w-16 rounded-full overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.image}
                        alt="Preview Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/100x100/27272a/a1a1aa?text=User"
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
                <span>Edit Testimoni</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Nama Pelanggan</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama pelanggan"
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
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Jabatan / Instansi (Position)</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Contoh: CEO, Toko Bagus atau Direktur IT"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Isi Ulasan / Testimoni</label>
                  <textarea
                    name="testimonial"
                    rows="3"
                    value={formData.testimonial}
                    onChange={handleInputChange}
                    placeholder="Tuliskan isi ulasan pelanggan mengenai produk/jasa Terra Tech..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Avatar Pelanggan</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/avatar/160/160"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Foto Pelanggan</span>
                    </span>
                    <div className="h-16 w-16 rounded-full overflow-hidden border border-dark-border bg-white shadow-sm">
                      <img
                        src={formData.image}
                        alt="Preview Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/100x100/27272a/a1a1aa?text=User"
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
              <h3 className="font-bold text-base text-text-primary font-display">Hapus Testimoni</h3>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus ulasan dari <strong>"{selectedTestimonial?.customer_name}"</strong>? Tindakan ini tidak dapat dibatalkan.
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
