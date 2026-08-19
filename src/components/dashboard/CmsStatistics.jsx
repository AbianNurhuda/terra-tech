import { useState, useEffect } from "react"
import { defaultStatistics } from "../../utils/cmsDefaults"
import { Search, Plus, Edit2, Trash2, X, AlertCircle, Save, Users, Trophy, Briefcase, Calendar } from "lucide-react"

const iconMap = {
  Users,
  Trophy,
  Briefcase,
  Calendar
}

export default function CmsStatistics({ readOnly = false, showToast }) {
  const [stats, setStats] = useState([])
  const [error, setError] = useState("")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStat, setSelectedStat] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ title: "", value: "", icon: "Users", status: "Active" })

  useEffect(() => {
    const saved = localStorage.getItem("cms_statistics")
    if (saved) {
      setStats(JSON.parse(saved))
    } else {
      setStats(defaultStatistics)
      localStorage.setItem("cms_statistics", JSON.stringify(defaultStatistics))
    }
  }, [])

  const saveToStorage = (list) => {
    setStats(list)
    localStorage.setItem("cms_statistics", JSON.stringify(list))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.value) {
      setError("Label/Judul dan Nilai Statistik wajib diisi.")
      return
    }

    const newStat = {
      id: "stat-" + Date.now(),
      ...formData
    }

    const updated = [...stats, newStat]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ title: "", value: "", icon: "Users", status: "Active" })
    showToast("Statistik baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.value) {
      setError("Label/Judul dan Nilai Statistik wajib diisi.")
      return
    }

    const updated = stats.map((s) =>
      s.id === selectedStat.id ? { ...s, ...formData } : s
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Data Statistik berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = stats.filter((s) => s.id !== selectedStat.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Statistik berhasil dihapus!", "success")
  }

  const openAddModal = () => {
    setError("")
    setFormData({ title: "", value: "", icon: "Users", status: "Active" })
    setIsAddOpen(true)
  }

  const openEditModal = (stat) => {
    setError("")
    setSelectedStat(stat)
    setFormData({ ...stat })
    setIsEditOpen(true)
  }

  const openDeleteModal = (stat) => {
    setSelectedStat(stat)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary font-display">Statistics Configuration</h3>
          <p className="text-text-muted text-xs mt-1">
            Atur metrik pencapaian (angka statistik) yang tampil pada halaman beranda Terra Tech.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Statistik</span>
          </button>
        )}
      </div>

      {/* Statistics Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-white">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-dark-base border-b border-dark-border font-bold text-text-secondary text-left">
              <th className="p-4 w-16 text-center">Ikon</th>
              <th className="p-4 w-32">Nilai (Value)</th>
              <th className="p-4">Label Statistik (Title)</th>
              <th className="p-4 w-24">Status</th>
              {!readOnly && <th className="p-4 w-28 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-text-primary">
            {stats.length > 0 ? (
              stats.map((stat) => {
                const IconComponent = iconMap[stat.icon] || Users
                return (
                  <tr key={stat.id} className="hover:bg-dark-base/40 transition-colors">
                    <td className="p-4 text-center">
                      <span className="p-2 rounded-xl bg-dark-base border border-dark-border inline-flex text-accent-cyan shadow-sm">
                        <IconComponent className="h-4.5 w-4.5" />
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm text-accent-cyan font-display">{stat.value}</td>
                    <td className="p-4 font-semibold text-text-primary">{stat.title}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stat.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {stat.status}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(stat)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(stat)}
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
                <td colSpan={readOnly ? 4 : 5} className="p-8 text-center text-text-muted">
                  Belum ada data statistik. Klik "Tambah Statistik" untuk membuat baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-dark-border shadow-2xl relative overflow-hidden text-left flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
            <div className="p-6 border-b border-dark-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-text-primary font-display flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Tambah Statistik Baru</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Label / Judul Statistik</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contoh: Klien Puas atau Proyek Selesai"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Nilai Statistik</label>
                    <input
                      type="text"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="Contoh: 150+ atau 99%"
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
                      <option value="Users">Users (Klien/Pengguna)</option>
                      <option value="Trophy">Trophy (Penghargaan/Kepuasan)</option>
                      <option value="Briefcase">Briefcase (Proyek/Pekerjaan)</option>
                      <option value="Calendar">Calendar (Waktu/Tahun)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Aktif</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="Active">Active (Tampilkan)</option>
                    <option value="Inactive">Inactive (Sembunyikan)</option>
                  </select>
                </div>
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
          <div className="bg-white rounded-2xl max-w-md w-full border border-dark-border shadow-2xl relative overflow-hidden text-left flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
            <div className="p-6 border-b border-dark-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-text-primary font-display flex items-center gap-2">
                <Edit2 className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Edit Statistik</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Label / Judul Statistik</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contoh: Klien Puas atau Proyek Selesai"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Nilai Statistik</label>
                    <input
                      type="text"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="Contoh: 150+ atau 99%"
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
                      <option value="Users">Users (Klien/Pengguna)</option>
                      <option value="Trophy">Trophy (Penghargaan/Kepuasan)</option>
                      <option value="Briefcase">Briefcase (Proyek/Pekerjaan)</option>
                      <option value="Calendar">Calendar (Waktu/Tahun)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Aktif</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="Active">Active (Tampilkan)</option>
                    <option value="Inactive">Inactive (Sembunyikan)</option>
                  </select>
                </div>
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
              <h3 className="font-bold text-base text-text-primary font-display">Hapus Statistik</h3>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus statistik <strong>"{selectedStat?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
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
