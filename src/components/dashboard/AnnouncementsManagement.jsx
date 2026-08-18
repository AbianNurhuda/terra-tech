import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, Eye, X, AlertCircle, Megaphone, Paperclip, FileText, Download } from "lucide-react"

export default function AnnouncementsManagement({ showToast, readOnly = false }) {
  const [announcements, setAnnouncements] = useState([])
  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAnn, setSelectedAnn] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ title: "", priority: "Normal", status: "Published", content: "", attachmentName: "", attachmentSize: "" })
  const [error, setError] = useState("")

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()
  }

  const defaultAnnouncements = [
    { id: 1, title: "Kebijakan Cuti Bersama dan Jam Kerja Libur Nasional 2026", slug: "kebijakan-cuti-bersama-dan-jam-kerja-libur-nasional-2026", content: "Sehubungan dengan Surat Keputusan Bersama 3 Menteri tentang Hari Libur Nasional dan Cuti Bersama 2026, diinformasikan bahwa kantor TerraTech akan diliburkan mulai tanggal 15 hingga 18 Agustus 2026.", priority: "Important", status: "Published", attachmentName: "SK_Libur_Nasional_2026.pdf", attachmentSize: "324 KB", downloads: 45, author: "Super Admin", publishDate: "2026-08-01" },
    { id: 2, title: "Jadwal Pemeliharaan Server Database Utama", slug: "jadwal-pemeliharaan-server-database-utama", content: "Diberitahukan kepada seluruh tim teknis bahwa pemeliharaan server database PostgreSQL utama dijadwalkan pada hari Sabtu pukul 22:00 WIB hingga Minggu pukul 02:00 WIB. Akses dashboard akan mengalami downtime parsial.", priority: "Urgent", status: "Published", attachmentName: "Jadwal_Downtime_Database.pdf", attachmentSize: "185 KB", downloads: 22, author: "Budi Santoso", publishDate: "2026-08-03" },
    { id: 3, title: "Pendaftaran Program Pelatihan Sertifikasi DevOps Internal", slug: "pendaftaran-program-pelatihan-sertifikasi-devops-internal", content: "Kesempatan bagi tim developer TerraTech untuk mengikuti sertifikasi DevOps (AWS/Kubernetes). Pendaftaran ditutup akhir bulan ini. Silakan unduh modul kurikulum terlampir.", priority: "Normal", status: "Draft", attachmentName: "Silabus_DevOps_Internal.pdf", attachmentSize: "1.2 MB", downloads: 0, author: "Super Admin", publishDate: "—" }
  ]

  useEffect(() => {
    const saved = localStorage.getItem("cms_announcements")
    if (saved) {
      const parsed = JSON.parse(saved)
      const migrated = parsed.map(a => {
        if (!a.slug) {
          return { ...a, slug: generateSlug(a.title) }
        }
        return a
      })
      setAnnouncements(migrated)
      localStorage.setItem("cms_announcements", JSON.stringify(migrated))
    } else {
      setAnnouncements(defaultAnnouncements)
      localStorage.setItem("cms_announcements", JSON.stringify(defaultAnnouncements))
    }
  }, [])

  const saveToStorage = (list) => {
    setAnnouncements(list)
    localStorage.setItem("cms_announcements", JSON.stringify(list))
  }

  // Handle Search & Filters
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = filterPriority === "all" || a.priority === filterPriority
    const matchesStatus = filterStatus === "all" || a.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  // CRUD Handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.content) {
      setError("Judul dan isi pengumuman wajib diisi.")
      return
    }

    const newAnn = {
      id: Date.now(),
      title: formData.title,
      slug: generateSlug(formData.title),
      content: formData.content,
      priority: formData.priority,
      status: formData.status,
      attachmentName: formData.attachmentName,
      attachmentSize: formData.attachmentSize,
      downloads: 0,
      author: localStorage.getItem("userName") || "Super Admin",
      publishDate: formData.status === "Published" ? new Date().toISOString().split("T")[0] : "—"
    }

    const updated = [newAnn, ...announcements]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ title: "", priority: "Normal", status: "Published", content: "", attachmentName: "", attachmentSize: "" })
    showToast("Pengumuman berhasil diterbitkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.content) {
      setError("Judul dan isi pengumuman wajib diisi.")
      return
    }

    const updated = announcements.map((a) =>
      a.id === selectedAnn.id
        ? {
            ...a,
            title: formData.title,
            slug: generateSlug(formData.title),
            content: formData.content,
            priority: formData.priority,
            status: formData.status,
            attachmentName: formData.attachmentName,
            attachmentSize: formData.attachmentSize,
            publishDate: formData.status === "Published" && a.publishDate === "—"
              ? new Date().toISOString().split("T")[0]
              : formData.status === "Draft" ? "—" : a.publishDate
          }
        : a
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Pengumuman berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = announcements.filter((a) => a.id !== selectedAnn.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Pengumuman berhasil dihapus.", "success")
  }

  const handleSimulatedDownload = (ann) => {
    const updated = announcements.map(a => a.id === ann.id ? { ...a, downloads: a.downloads + 1 } : a)
    saveToStorage(updated)
    // Update selectedAnn if view modal is open
    if (selectedAnn && selectedAnn.id === ann.id) {
      setSelectedAnn({ ...selectedAnn, downloads: selectedAnn.downloads + 1 })
    }
    showToast(`Mengunduh berkas '${ann.attachmentName}'...`, "success")
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const sizeStr = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
      : (file.size / 1024).toFixed(0) + " KB"

    setFormData({
      ...formData,
      attachmentName: file.name,
      attachmentSize: sizeStr
    })
    showToast("Berkas lampiran berhasil dipilih!", "success")
  }

  const removeAttachment = () => {
    setFormData({
      ...formData,
      attachmentName: "",
      attachmentSize: ""
    })
  }

  const openEditModal = (ann) => {
    setSelectedAnn(ann)
    setFormData({
      title: ann.title,
      priority: ann.priority,
      status: ann.status,
      content: ann.content,
      attachmentName: ann.attachmentName,
      attachmentSize: ann.attachmentSize
    })
    setError("")
    setIsEditOpen(true)
  }

  const openViewModal = (ann) => {
    setSelectedAnn(ann)
    setIsViewOpen(true)
  }

  const openDeleteModal = (ann) => {
    setSelectedAnn(ann)
    setIsDeleteOpen(true)
  }

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case "Urgent": return "bg-rose-50 border-rose-100 text-rose-700"
      case "Important": return "bg-amber-50 border-amber-100 text-amber-700"
      case "Normal": return "bg-blue-50 border-blue-100 text-blue-700"
      default: return "bg-gray-50 border-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Pengumuman Staf</h2>
          <p className="text-text-muted text-xs mt-0.5">Kelola maklumat internal, jadwal penting, dan lampiran berkas resmi perusahaan.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setError("")
              setFormData({ title: "", priority: "Normal", status: "Published", content: "", attachmentName: "", attachmentSize: "" })
              setIsAddOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pengumuman</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari judul pengumuman atau konten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Prioritas:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Normal">Normal</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
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

      {/* Table grid */}
      <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                <th className="py-4 px-6">Pengumuman</th>
                <th className="py-4 px-6 text-center">Tingkat Prioritas</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Lampiran Dokumen</th>
                <th className="py-4 px-6 text-center">Unduhan</th>
                <th className="py-4 px-6">Pembuat</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-dark-base/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary max-w-xs truncate">
                      <div className="font-bold truncate">{ann.title}</div>
                      {ann.slug && (
                        <div className="text-[10px] text-accent-cyan mt-0.5 font-mono truncate">/{ann.slug}</div>
                      )}
                      <div className="text-[10px] text-text-muted mt-0.5 font-normal truncate">{ann.publishDate}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadge(ann.priority)}`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ann.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {ann.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {ann.attachmentName ? (
                        <button
                          onClick={() => handleSimulatedDownload(ann)}
                          className="inline-flex items-center gap-1.5 text-accent-cyan hover:underline text-left"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]" title={ann.attachmentName}>{ann.attachmentName}</span>
                        </button>
                      ) : (
                        <span className="text-text-muted/50">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-semibold">
                      {ann.attachmentName ? `${ann.downloads} kali` : "—"}
                    </td>
                    <td className="py-4 px-6 font-medium">{ann.author}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openViewModal(ann)}
                          title="Pratinjau"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => openEditModal(ann)}
                              title="Edit Pengumuman"
                              className="p-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(ann)}
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-text-muted">
                    Tidak ada pengumuman terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Pengumuman */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Buat Pengumuman Baru</h3>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Maklumat</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Jadwal Libur Lebaran..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                  {formData.title && (
                    <span className="text-[10px] text-accent-cyan block mt-1 font-mono">Slug: /{generateSlug(formData.title)}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tingkat Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Konten Pengumuman</label>
                <textarea
                  rows="7"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Ketik isi pengumuman untuk staf secara detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Attachment File Uploader UI */}
              <div className="space-y-1.5 pt-2 border-t border-dark-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-secondary">Unggah Lampiran Dokumen (Opsional)</span>
                  <span className="text-[10px] text-text-muted">PDF, DOCX, XLSX (Maks 5MB)</span>
                </div>
                {formData.attachmentName ? (
                  <div className="flex items-center justify-between p-3 border border-dark-border rounded-xl bg-dark-base/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-text-muted" />
                      <span className="text-xs font-medium text-text-primary">{formData.attachmentName}</span>
                      <span className="text-[10px] text-text-muted">({formData.attachmentSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 py-4 border border-dashed border-dark-border hover:border-accent-cyan/40 bg-white hover:bg-dark-base/30 rounded-xl cursor-pointer transition-all">
                    <Paperclip className="h-4 w-4 text-text-muted" />
                    <span className="text-xs text-text-secondary font-bold">Pilih Dokumen Lampiran</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Status:</span>
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
                    Terbitkan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Pengumuman */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit Pengumuman</h3>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Maklumat</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                  {formData.title && (
                    <span className="text-[10px] text-accent-cyan block mt-1 font-mono">Slug: /{generateSlug(formData.title)}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tingkat Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Konten Pengumuman</label>
                <textarea
                  rows="7"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Attachment File Uploader UI */}
              <div className="space-y-1.5 pt-2 border-t border-dark-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-secondary">Lampiran Dokumen</span>
                  <span className="text-[10px] text-text-muted">PDF, DOCX, XLSX (Maks 5MB)</span>
                </div>
                {formData.attachmentName ? (
                  <div className="flex items-center justify-between p-3 border border-dark-border rounded-xl bg-dark-base/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-text-muted" />
                      <span className="text-xs font-medium text-text-primary">{formData.attachmentName}</span>
                      <span className="text-[10px] text-text-muted">({formData.attachmentSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 py-4 border border-dashed border-dark-border hover:border-accent-cyan/40 bg-white hover:bg-dark-base/30 rounded-xl cursor-pointer transition-all">
                    <Paperclip className="h-4 w-4 text-text-muted" />
                    <span className="text-xs text-text-secondary font-bold">Pilih Dokumen Baru</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Status:</span>
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

      {/* Modal: Lihat Detail Pengumuman */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-bold ${getPriorityBadge(selectedAnn?.priority)}`}>
                    {selectedAnn?.priority}
                  </span>
                  <h3 className="font-display font-bold text-sm text-text-primary">{selectedAnn?.title}</h3>
                </div>
                {selectedAnn?.slug && (
                  <div className="text-[10px] text-accent-cyan mt-1 font-mono">/{selectedAnn.slug}</div>
                )}
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-xs">
              <div className="flex justify-between items-center text-[10px] text-text-muted border-b border-dark-border pb-2.5">
                <span>Rilis: <strong>{selectedAnn?.publishDate}</strong> oleh <strong>{selectedAnn?.author}</strong></span>
                <span>Status: <strong>{selectedAnn?.status}</strong></span>
              </div>

              <p className="whitespace-pre-wrap leading-relaxed text-text-primary leading-loose">
                {selectedAnn?.content}
              </p>

              {/* View/Download attachment block */}
              {selectedAnn?.attachmentName && (
                <div className="p-4 border border-dark-border bg-dark-base/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white rounded-xl border border-dark-border text-accent-cyan shadow-sm">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-text-primary">{selectedAnn?.attachmentName}</h4>
                      <p className="text-[10px] text-text-muted">{selectedAnn?.attachmentSize} • Diunduh {selectedAnn?.downloads} kali</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSimulatedDownload(selectedAnn)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent-cyan hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <Download className="h-4.5 w-4.5" />
                    <span>Unduh Lampiran</span>
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hapus Pengumuman */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Pengumuman?</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed font-semibold">
                  Apakah Anda yakin ingin menghapus pengumuman "{selectedAnn?.title}"? Pengumuman tidak bisa dikembalikan.
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
