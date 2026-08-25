import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, Eye, X, AlertCircle, Layers, CheckSquare } from "lucide-react"

export default function RegistrationFlowManagement({ showToast, readOnly = false }) {
  const [steps, setSteps] = useState([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ sequence: 1, title: "", description: "", requirementsCount: 1, isPublished: true })
  const [error, setError] = useState("")

  const defaultSteps = [
    { id: 1, sequence: 1, title: "Registrasi Akun Utama", description: "Melakukan pendaftaran akun menggunakan alamat email perusahaan resmi dan verifikasi kode OTP.", requirementsCount: 3, isPublished: true },
    { id: 2, sequence: 2, title: "Lengkapi Profil & Legalitas", description: "Mengisi data profil lengkap instansi beserta mengunggah berkas legalitas hukum pendirian perusahaan.", requirementsCount: 5, isPublished: true },
    { id: 3, sequence: 3, title: "Verifikasi Dokumen Teknis", description: "Proses pengecekan kelayakan dokumen teknis dan portofolio oleh tim penilai TerraTech.", requirementsCount: 4, isPublished: true },
    { id: 4, sequence: 4, title: "Tanda Tangan Elektronik & Aktivasi", description: "Penandatanganan dokumen MOU kerja sama secara digital dan aktivasi akun portal mitra sepenuhnya.", requirementsCount: 2, isPublished: false }
  ]

  useEffect(() => {
    const saved = localStorage.getItem("cms_registration_steps")
    if (saved) {
      setSteps(JSON.parse(saved))
    } else {
      setSteps(defaultSteps)
      localStorage.setItem("cms_registration_steps", JSON.stringify(defaultSteps))
    }
  }, [])

  const saveToStorage = (list) => {
    const sorted = [...list].sort((a, b) => Number(a.sequence) - Number(b.sequence))
    setSteps(sorted)
    localStorage.setItem("cms_registration_steps", JSON.stringify(sorted))
  }

  // Handle Search & Filter
  const filteredSteps = steps.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && s.isPublished) ||
      (filterStatus === "draft" && !s.isPublished)

    return matchesSearch && matchesStatus
  })

  // CRUD Handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description) {
      setError("Judul langkah dan deskripsi wajib diisi.")
      return
    }

    const newStep = {
      id: Date.now(),
      sequence: Number(formData.sequence),
      title: formData.title,
      description: formData.description,
      requirementsCount: Number(formData.requirementsCount),
      isPublished: formData.isPublished
    }

    const updated = [...steps, newStep]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ sequence: steps.length + 2, title: "", description: "", requirementsCount: 1, isPublished: true })
    showToast("Langkah alur pendaftaran baru berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.title || !formData.description) {
      setError("Judul langkah dan deskripsi wajib diisi.")
      return
    }

    const updated = steps.map((s) =>
      s.id === selectedStep.id
        ? {
            ...s,
            sequence: Number(formData.sequence),
            title: formData.title,
            description: formData.description,
            requirementsCount: Number(formData.requirementsCount),
            isPublished: formData.isPublished
          }
        : s
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Langkah alur pendaftaran berhasil diperbarui!", "success")
  }

  const handleDelete = () => {
    const updated = steps.filter(s => s.id !== selectedStep.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Langkah alur pendaftaran berhasil dihapus.", "success")
  }

  const openEditModal = (step) => {
    setSelectedStep(step)
    setFormData({
      sequence: step.sequence,
      title: step.title,
      description: step.description,
      requirementsCount: step.requirementsCount,
      isPublished: step.isPublished
    })
    setError("")
    setIsEditOpen(true)
  }

  const openViewModal = (step) => {
    setSelectedStep(step)
    setIsViewOpen(true)
  }

  const openDeleteModal = (step) => {
    setSelectedStep(step)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Alur Pendaftaran</h2>
          <p className="text-text-muted text-xs mt-0.5">Konfigurasikan tahapan, urutan langkah, dan syarat pendaftaran mitra TerraTech.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setFormData({ sequence: steps.length + 1, title: "", description: "", requirementsCount: 1, isPublished: true })
              setError("")
              setIsAddOpen(true)
            }}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Langkah</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Cari alur pendaftaran berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/30 placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-white focus:outline-none focus:border-accent-cyan/60"
          >
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan (Published)</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Content Table / List */}
      <div className="border border-dark-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/50 text-[10px] uppercase font-bold text-text-secondary border-b border-dark-border">
                <th className="px-6 py-4 w-16 text-center">Urutan</th>
                <th className="px-6 py-4">Judul Langkah</th>
                <th className="px-6 py-4">Deskripsi Tahapan</th>
                <th className="px-6 py-4 w-36 text-center">Persyaratan</th>
                <th className="px-6 py-4 w-28 text-center">Status</th>
                <th className="px-6 py-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredSteps.length > 0 ? (
                filteredSteps.map((step) => (
                  <tr key={step.id} className="hover:bg-dark-base/20 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-bold font-display">
                        {step.sequence}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-primary">
                      {step.title}
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate" title={step.description}>
                      {step.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold text-[10px]">
                        <CheckSquare className="h-3.5 w-3.5" />
                        {step.requirementsCount} Syarat
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                          step.isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {step.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(step)}
                          className="p-1.5 rounded-lg border border-dark-border text-text-muted hover:text-text-primary hover:bg-dark-base transition-colors"
                          title="Detail Langkah"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => openEditModal(step)}
                              className="p-1.5 rounded-lg border border-dark-border text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/30 transition-colors"
                              title="Edit Langkah"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(step)}
                              className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Langkah"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted text-xs">
                    <Layers className="h-8 w-8 mx-auto text-text-muted/40 mb-2" />
                    Belum ada data alur pendaftaran yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4.5 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Tambah Langkah Pendaftaran Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Tahapan Ke-</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sequence}
                      onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Jumlah Syarat</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.requirementsCount}
                      onChange={(e) => setFormData({ ...formData, requirementsCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Langkah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengisian Formulir Kontak"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Tahapan</label>
                  <textarea
                    rows="3"
                    placeholder="Jelaskan detail prosedur atau apa yang harus diselesaikan pada tahapan ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublishedAdd"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-dark-border text-accent-cyan focus:ring-accent-cyan/20"
                  />
                  <label htmlFor="isPublishedAdd" className="ml-2 text-xs text-text-secondary select-none">
                    Publikasikan tahapan ini langsung (Published)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-dark-base/30 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold rounded-xl"
                >
                  Simpan Langkah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4.5 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit Langkah Pendaftaran</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Tahapan Ke-</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sequence}
                      onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Jumlah Syarat</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.requirementsCount}
                      onChange={(e) => setFormData({ ...formData, requirementsCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Judul Langkah</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Deskripsi Tahapan</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublishedEdit"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-dark-border text-accent-cyan focus:ring-accent-cyan/20"
                  />
                  <label htmlFor="isPublishedEdit" className="ml-2 text-xs text-text-secondary select-none">
                    Publikasikan tahapan ini langsung (Published)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-dark-base/30 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold rounded-xl"
                >
                  Perbarui Langkah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isViewOpen && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4.5 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Detail Langkah Pendaftaran</h3>
              <button onClick={() => setIsViewOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold font-display text-base">
                  {selectedStep.sequence}
                </span>
                <div>
                  <h4 className="font-display font-bold text-sm text-text-primary">{selectedStep.title}</h4>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      selectedStep.isPublished
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {selectedStep.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-dark-base/50 rounded-xl border border-dark-border">
                <h5 className="text-[10px] uppercase font-bold text-text-muted tracking-wide">Deskripsi Kegiatan</h5>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedStep.description}</p>
              </div>

              <div className="flex justify-between items-center px-4 py-3 border border-dark-border rounded-xl text-xs text-text-secondary">
                <span className="font-semibold">Jumlah Persyaratan:</span>
                <span className="font-bold text-accent-cyan">{selectedStep.requirementsCount} Berkas/Persyaratan</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-dark-base/30 border-t border-dark-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="btn-primary py-2 px-4 text-xs font-bold rounded-xl"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Langkah Pendaftaran?</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Apakah Anda yakin ingin menghapus <strong>"{selectedStep.title}"</strong> (Tahapan Ke-{selectedStep.sequence})? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-dark-base/30 border-t border-dark-border flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-dark-border text-text-secondary bg-white rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
