import { useState, useEffect } from "react"
import { defaultServices } from "../../utils/cmsDefaults"
import { Search, Plus, Edit2, Trash2, X, AlertCircle, Save, Code2, Smartphone, Palette, HeadphonesIcon, Database, Cloud, Image as ImageIcon } from "lucide-react"

// Icon components mapped to string names
const iconMap = {
  Code2,
  Smartphone,
  Palette,
  HeadphonesIcon,
  Database,
  Cloud
}

export default function CmsServices({ readOnly = false, showToast }) {
  const [services, setServices] = useState([])
  const [error, setError] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", icon: "Code2", description: "", image: "", status: "Published", sort_order: 1 })

  const setBypassDefaults = () => {
    setServices(defaultServices)
    localStorage.setItem("cms_services", JSON.stringify(defaultServices))
  }

  useEffect(() => {
    const saved = localStorage.getItem("cms_services")
    if (saved) {
      setServices(JSON.parse(saved))
    } else {
      setBypassDefaults()
    }
  }, [])

  const saveToStorage = (list) => {
    const sorted = [...list].sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    setServices(sorted)
    localStorage.setItem("cms_services", JSON.stringify(sorted))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "sort_order" ? Number(value) : value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.description) {
      setError("Nama Layanan dan Deskripsi wajib diisi.")
      return
    }

    const newService = {
      id: "svc-" + Date.now(),
      ...formData,
      sort_order: Number(formData.sort_order) || (services.length > 0 ? Math.max(...services.map(s => s.sort_order)) + 1 : 1)
    }

    const updated = [...services, newService]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ name: "", icon: "Code2", description: "", image: "", status: "Published", sort_order: 1 })
    showToast("Layanan baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.description) {
      setError("Nama Layanan dan Deskripsi wajib diisi.")
      return
    }

    const updated = services.map((s) =>
      s.id === selectedService.id ? { ...s, ...formData } : s
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Layanan berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = services.filter((s) => s.id !== selectedService.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Layanan berhasil dihapus!", "success")
  }

  const openAddModal = () => {
    setError("")
    setFormData({ name: "", icon: "Code2", description: "", image: "", status: "Published", sort_order: services.length + 1 })
    setIsAddOpen(true)
  }

  const openEditModal = (service) => {
    setError("")
    setSelectedService(service)
    setFormData({ ...service })
    setIsEditOpen(true)
  }

  const openDeleteModal = (service) => {
    setSelectedService(service)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary font-display">Services List</h3>
          <p className="text-text-muted text-xs mt-1">
            Kelola daftar produk dan layanan Terra Tech yang tampil di Landing Page.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Layanan</span>
          </button>
        )}
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-white">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-dark-base border-b border-dark-border font-bold text-text-secondary text-left">
              <th className="p-4 w-16 text-center">No.</th>
              <th className="p-4 w-16 text-center">Ikon</th>
              <th className="p-4 w-28">Preview</th>
              <th className="p-4">Informasi Layanan</th>
              <th className="p-4 w-24">Status</th>
              {!readOnly && <th className="p-4 w-28 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-text-primary">
            {services.length > 0 ? (
              services.map((service, index) => {
                const IconComponent = iconMap[service.icon] || Code2
                return (
                  <tr key={service.id} className="hover:bg-dark-base/40 transition-colors">
                    <td className="p-4 font-bold text-center text-text-muted">{service.sort_order}</td>
                    <td className="p-4 text-center">
                      <span className="p-2 rounded-xl bg-dark-base border border-dark-border inline-flex text-accent-cyan shadow-sm">
                        <IconComponent className="h-5 w-5" />
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="h-14 w-24 rounded-lg overflow-hidden border border-dark-border bg-dark-base">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "https://placehold.co/120x70/27272a/a1a1aa?text=No+Image"
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <h4 className="font-bold text-sm text-text-primary">{service.name}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2 max-w-lg leading-relaxed">
                        {service.description}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          service.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(service)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-text-muted">
                  Belum ada data layanan. Klik "Tambah Layanan" untuk membuat baru.
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
                <span>Tambah Layanan Baru</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Nama Layanan</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama layanan"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Pilih Ikon</label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 font-semibold"
                    >
                      <option value="Code2">Code (Web Development)</option>
                      <option value="Smartphone">Smartphone (Mobile App)</option>
                      <option value="Palette">Palette (UI/UX Design)</option>
                      <option value="HeadphonesIcon">Headphones (IT Consulting)</option>
                      <option value="Database">Database (Database Tech)</option>
                      <option value="Cloud">Cloud (Cloud Infrastructure)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">No. Urut (Sort Order)</label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      placeholder="Contoh: 1"
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
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Layanan</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Jelaskan secara singkat mengenai layanan yang disediakan..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Layanan (Showcase Detail)</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/terraweb/900/500"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar Layanan</span>
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
                <span>Edit Layanan</span>
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
                    <label className="text-xs font-semibold text-text-secondary">Nama Layanan</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama layanan"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Pilih Ikon</label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 font-semibold"
                    >
                      <option value="Code2">Code (Web Development)</option>
                      <option value="Smartphone">Smartphone (Mobile App)</option>
                      <option value="Palette">Palette (UI/UX Design)</option>
                      <option value="HeadphonesIcon">Headphones (IT Consulting)</option>
                      <option value="Database">Database (Database Tech)</option>
                      <option value="Cloud">Cloud (Cloud Infrastructure)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">No. Urut (Sort Order)</label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      placeholder="Contoh: 1"
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
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Layanan</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Jelaskan secara singkat mengenai layanan yang disediakan..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">URL Gambar Layanan (Showcase Detail)</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://picsum.photos/seed/terraweb/900/500"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                {formData.image && (
                  <div className="p-3 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Preview Gambar Layanan</span>
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
              <h3 className="font-bold text-base text-text-primary font-display">Hapus Layanan</h3>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus layanan <strong>"{selectedService?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
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
