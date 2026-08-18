import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, Eye, X, AlertCircle, Calendar, Clock, MapPin } from "lucide-react"

export default function TimelineManagement({ showToast, readOnly = false }) {
  const [timelines, setTimelines] = useState([])
  const [search, setSearch] = useState("")
  const [filterPublished, setFilterPublished] = useState("all")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ sequence: 1, title: "", color: "blue", description: "", startDate: "", endDate: "", location: "", agendaStatus: "Akan Datang", isPublished: true })
  const [error, setError] = useState("")

  const defaultTimelines = [
    { id: 1, sequence: 1, title: "Kickoff Project TerraTech Portal Staf", color: "blue", description: "Inisiasi awal proyek pembuatan dashboard terintegrasi TerraTech dengan tim desainer dan insinyur.", startDate: "2026-08-01", endDate: "2026-08-05", location: "Ruang Rapat Utama (Gedung Cyber)", agendaStatus: "Selesai", isPublished: true },
    { id: 2, sequence: 2, title: "Sesi Review Palet Warna & Desain UI", color: "purple", description: "Penyelarasan visual, penggantian skema warna menjadi biru cerah modern, dan penyelesaian mock-up landing page.", startDate: "2026-08-09", endDate: "2026-08-12", location: "Virtual Meet (Google Workspace)", agendaStatus: "Sedang Berjalan", isPublished: true },
    { id: 3, sequence: 3, title: "Peluncuran Modul Super Admin CMS", color: "emerald", description: "Rilis perdana portal kontrol administrasi TerraTech, termasuk kelola user, profil perusahaan, pengumuman, dan arsip file.", startDate: "2026-08-20", endDate: "2026-08-25", location: "Staging Server Deploy", agendaStatus: "Akan Datang", isPublished: true },
    { id: 4, sequence: 4, title: "Integrasi Dashboard Staf Operator & Editor", color: "rose", description: "Penggabungan antrean chat bantuan langsung pelanggan dan modul penulisan blog editor dalam satu rilis stabil.", startDate: "2026-09-05", endDate: "2026-09-10", location: "Staging Server Deploy", agendaStatus: "Akan Datang", isPublished: false }
  ]

  useEffect(() => {
    const saved = localStorage.getItem("cms_timelines")
    if (saved) {
      const parsed = JSON.parse(saved)
      const migrated = parsed.map(t => {
        if (!t.startDate || !t.endDate) {
          const baseDate = t.date || new Date().toISOString().split("T")[0]
          return {
            ...t,
            startDate: baseDate,
            endDate: baseDate
          }
        }
        return t
      })
      setTimelines(migrated)
      localStorage.setItem("cms_timelines", JSON.stringify(migrated))
    } else {
      setTimelines(defaultTimelines)
      localStorage.setItem("cms_timelines", JSON.stringify(defaultTimelines))
    }
  }, [])

  const saveToStorage = (list) => {
    // Sort automatically by sequence order
    const sorted = [...list].sort((a, b) => Number(a.sequence) - Number(b.sequence))
    setTimelines(sorted)
    localStorage.setItem("cms_timelines", JSON.stringify(sorted))
  }

  // Handle Search & Filter
  const filteredTimelines = timelines.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
    
    const matchesPub =
      filterPublished === "all" ||
      (filterPublished === "published" && t.isPublished) ||
      (filterPublished === "draft" && !t.isPublished)

    return matchesSearch && matchesPub
  })

  // CRUD Handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
      setError("Judul, deskripsi, tanggal mulai, tanggal selesai, dan lokasi wajib diisi.")
      return
    }

    const newTime = {
      id: Date.now(),
      sequence: Number(formData.sequence),
      title: formData.title,
      color: formData.color,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      agendaStatus: formData.agendaStatus,
      isPublished: formData.isPublished
    }

    const updated = [...timelines, newTime]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ sequence: timelines.length + 2, title: "", color: "blue", description: "", startDate: "", endDate: "", location: "", agendaStatus: "Akan Datang", isPublished: true })
    showToast("Agenda timeline baru berhasil disimpan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
      setError("Judul, deskripsi, tanggal mulai, tanggal selesai, dan lokasi wajib diisi.")
      return
    }

    const updated = timelines.map((t) =>
      t.id === selectedTime.id
        ? {
            ...t,
            sequence: Number(formData.sequence),
            title: formData.title,
            color: formData.color,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            location: formData.location,
            agendaStatus: formData.agendaStatus,
            isPublished: formData.isPublished
          }
        : t
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Timeline berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = timelines.filter(t => t.id !== selectedTime.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Timeline berhasil dihapus.", "success")
  }

  const openEditModal = (time) => {
    setSelectedTime(time)
    setFormData({
      sequence: time.sequence,
      title: time.title,
      color: time.color,
      description: time.description,
      startDate: time.startDate || "",
      endDate: time.endDate || "",
      location: time.location,
      agendaStatus: time.agendaStatus,
      isPublished: time.isPublished
    })
    setError("")
    setIsEditOpen(true)
  }

  const openViewModal = (time) => {
    setSelectedTime(time)
    setIsViewOpen(true)
  }

  const openDeleteModal = (time) => {
    setSelectedTime(time)
    setIsDeleteOpen(true)
  }

  const getColorClasses = (color) => {
    switch (color) {
      case "blue": return { dot: "bg-blue-500", bg: "bg-blue-50/50 border-blue-200 text-blue-700" }
      case "purple": return { dot: "bg-purple-500", bg: "bg-purple-50/50 border-purple-200 text-purple-700" }
      case "emerald": return { dot: "bg-emerald-500", bg: "bg-emerald-50/50 border-emerald-200 text-emerald-700" }
      case "rose": return { dot: "bg-rose-500", bg: "bg-rose-50/50 border-rose-200 text-rose-700" }
      case "amber": return { dot: "bg-amber-500", bg: "bg-amber-50/50 border-amber-200 text-amber-700" }
      default: return { dot: "bg-gray-500", bg: "bg-gray-50/50 border-gray-200 text-gray-700" }
    }
  }

  const getAgendaBadge = (status) => {
    switch (status) {
      case "Selesai": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Sedang Berjalan": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Akan Datang": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Timeline & Milestone</h2>
          <p className="text-text-muted text-xs mt-0.5">Kelola agenda kegiatan, tahapan rilis, dan peta jalan (roadmap) Terra Tech.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setError("")
              setFormData({ sequence: timelines.length + 1, title: "", color: "blue", description: "", date: "", location: "", agendaStatus: "Akan Datang", isPublished: true })
              setIsAddOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Timeline</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari judul, lokasi, atau deskripsi agenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-text-secondary font-semibold">Status Publikasi:</span>
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                <th className="py-4 px-6 text-center w-16">Urutan</th>
                <th className="py-4 px-6">Milestone Agenda</th>
                <th className="py-4 px-6 text-center">Indikator Warna</th>
                <th className="py-4 px-6">Tanggal Kegiatan</th>
                <th className="py-4 px-6">Lokasi</th>
                <th className="py-4 px-6">Status Agenda</th>
                <th className="py-4 px-6">Publikasi</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredTimelines.length > 0 ? (
                filteredTimelines.map((time) => {
                  const colors = getColorClasses(time.color)
                  return (
                    <tr key={time.id} className="hover:bg-dark-base/10 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-text-primary text-sm font-mono">{time.sequence}</td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-text-primary">{time.title}</div>
                        <div className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{time.description}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${colors.bg}`}>
                          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                          <span>{time.color}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-text-muted">Mulai:</span>
                            <span className="font-semibold text-text-primary">{time.startDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-text-muted">Selesai:</span>
                            <span className="font-semibold text-text-primary">{time.endDate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-text-muted" />
                          <span className="truncate max-w-[120px]" title={time.location}>{time.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAgendaBadge(time.agendaStatus)}`}>
                          <Clock className="h-2.5 w-2.5" />
                          <span>{time.agendaStatus}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          time.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {time.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openViewModal(time)}
                            title="Pratinjau"
                            className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!readOnly && (
                             <>
                               <button
                                 onClick={() => openEditModal(time)}
                                 title="Edit"
                                 className="p-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                               >
                                 <Edit2 className="h-4 w-4" />
                               </button>
                               <button
                                 onClick={() => openDeleteModal(time)}
                                 title="Hapus"
                                 className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-text-muted">
                    Tidak ada agenda timeline yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Timeline */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Tambah Agenda Milestone</h3>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Nomor Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Milestone</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nama kegiatan"
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tempat / Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: R. Rapat 1 / Staging"
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Agenda Status</label>
                  <select
                    value={formData.agendaStatus}
                    onChange={(e) => setFormData({ ...formData, agendaStatus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Indikator Warna</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="blue">Biru (Blue)</option>
                    <option value="emerald">Hijau (Emerald)</option>
                    <option value="purple">Ungu (Purple)</option>
                    <option value="rose">Merah Muda (Rose)</option>
                    <option value="amber">Oranye (Amber)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan deskriptif ringkas mengenai milestone..."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="pub"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-dark-border text-accent-cyan"
                />
                <label htmlFor="pub" className="ml-2 text-xs font-semibold text-text-secondary select-none">
                  Terbitkan di website publik (Published)
                </label>
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
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Timeline */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit Agenda Milestone</h3>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Nomor Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Milestone</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tempat / Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Agenda Status</label>
                  <select
                    value={formData.agendaStatus}
                    onChange={(e) => setFormData({ ...formData, agendaStatus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Indikator Warna</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="blue">Biru (Blue)</option>
                    <option value="emerald">Hijau (Emerald)</option>
                    <option value="purple">Ungu (Purple)</option>
                    <option value="rose">Merah Muda (Rose)</option>
                    <option value="amber">Oranye (Amber)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="pub"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-dark-border text-accent-cyan"
                />
                <label htmlFor="pub" className="ml-2 text-xs font-semibold text-text-secondary select-none">
                  Terbitkan di website publik (Published)
                </label>
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

      {/* Modal: Lihat Timeline */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm text-accent-cyan">#{selectedTime?.sequence}</span>
                <h3 className="font-display font-bold text-sm text-text-primary">{selectedTime?.title}</h3>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-dark-base border border-dark-border rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <span>Tanggal Mulai: <strong>{selectedTime?.startDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <span>Tanggal Selesai: <strong>{selectedTime?.endDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="h-4 w-4 text-text-muted" />
                  <span>Lokasi: <strong>{selectedTime?.location}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span>Status Agenda: <strong className="underline">{selectedTime?.agendaStatus}</strong></span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Deskripsi Milestone:</h4>
                <p className="text-text-primary leading-loose bg-dark-base/30 p-3 rounded-xl border border-dark-border/40">
                  {selectedTime?.description}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-text-muted pt-2 border-t border-dark-border">
                <span>Warna Indikator: <span className="font-bold capitalize text-text-primary">{selectedTime?.color}</span></span>
                <span>Website Publik: <span className="font-bold text-text-primary">{selectedTime?.isPublished ? "Published" : "Draft"}</span></span>
              </div>
            </div>

            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hapus Timeline */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Timeline?</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed font-semibold">
                  Apakah Anda yakin ingin menghapus agenda #{selectedTime?.sequence} "{selectedTime?.title}"?
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
    </div>
  )
}
