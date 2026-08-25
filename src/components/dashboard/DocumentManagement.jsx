import { useState, useEffect } from "react"
import { Search, Plus, Trash2, X, AlertCircle, FileText, Upload, Download, FolderOpen, Eye } from "lucide-react"

export default function DocumentManagement({ showToast, readOnly = false }) {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [categories, setCategories] = useState(["Arsip Administrasi", "Modul Teknis", "Panduan Pengguna", "Template Dokumen"])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Modals / upload states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // Upload Form states
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [uploadedFileObj, setUploadedFileObj] = useState(null)
  const [error, setError] = useState("")

  const defaultFiles = [
    { id: 1, title: "Laporan Keuangan Kuartal II 2026", category: "Arsip Administrasi", fileName: "Laporan_Keuangan_Q2_2026.xlsx", fileSize: "1.4 MB", fileFormat: "xlsx", downloads: 88, status: "Active", uploadDate: "2026-08-01" },
    { id: 2, title: "Spesifikasi Teknis Integrasi API V3", category: "Modul Teknis", fileName: "Spesifikasi_API_Integrasi_V3.pdf", fileSize: "3.2 MB", fileFormat: "pdf", downloads: 120, status: "Active", uploadDate: "2026-08-03" },
    { id: 3, title: "Panduan Penggunaan Portal CMS Staf", category: "Panduan Pengguna", fileName: "Manual_Book_Staf_Portal.pdf", fileSize: "4.5 MB", fileFormat: "pdf", downloads: 56, status: "Active", uploadDate: "2026-08-05" },
    { id: 4, title: "Template Surat Perjanjian Kerja Sama (MOU)", category: "Template Dokumen", fileName: "Template_MOU_TerraTech.docx", fileSize: "115 KB", fileFormat: "docx", downloads: 12, status: "Draft", uploadDate: "2026-08-08" }
  ]

  useEffect(() => {
    // Load files
    const savedFiles = localStorage.getItem("cms_files")
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles))
    } else {
      setFiles(defaultFiles)
      localStorage.setItem("cms_files", JSON.stringify(defaultFiles))
    }

    // Load categories
    const savedCats = localStorage.getItem("cms_file_categories")
    if (savedCats) {
      const catObjects = JSON.parse(savedCats)
      setCategories(catObjects.map(c => c.name))
    } else {
      const defaultCatObjects = [
        { id: 1, name: "Arsip Administrasi", slug: "arsip-administrasi", description: "Berkas formal administrasi kantor dan keuangan", count: 1 },
        { id: 2, name: "Modul Teknis", slug: "modul-teknis", description: "Spesifikasi fitur dan integrasi API sistem", count: 1 },
        { id: 3, name: "Panduan Pengguna", slug: "panduan-pengguna", description: "Buku panduan operasional user & staf", count: 1 },
        { id: 4, name: "Template Dokumen", slug: "template-dokumen", description: "Format standard dokumen kerja sama", count: 1 }
      ]
      localStorage.setItem("cms_file_categories", JSON.stringify(defaultCatObjects))
    }
  }, [])

  const saveToStorage = (list) => {
    setFiles(list)
    localStorage.setItem("cms_files", JSON.stringify(list))

    // Update categories counters dynamically in localStorage
    const savedCats = localStorage.getItem("cms_file_categories")
    if (savedCats) {
      const catObjects = JSON.parse(savedCats)
      const updatedCats = catObjects.map((cat) => ({
        ...cat,
        count: list.filter(f => f.category === cat.name).length
      }))
      localStorage.setItem("cms_file_categories", JSON.stringify(updatedCats))
    }
  }

  // Handle Search & Filter
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.fileName.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === "all" || f.category === filterCategory
    const matchesStatus = filterStatus === "all" || f.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // File Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast("Gagal: Batas ukuran file dokumen adalah 10MB.", "error")
      return
    }

    setUploadedFileObj(file)
    if (!newTitle) {
      // Auto fill title with file name without extension
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
      setNewTitle(nameWithoutExt.replace(/[_-]/g, " "))
    }
    showToast("File dokumen siap diunggah!", "success")
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!newTitle || !newCategory || !uploadedFileObj) {
      setError("Judul dokumen, kategori, dan file wajib disertakan.")
      return
    }

    const sizeStr = uploadedFileObj.size > 1024 * 1024
      ? (uploadedFileObj.size / (1024 * 1024)).toFixed(1) + " MB"
      : (uploadedFileObj.size / 1024).toFixed(0) + " KB"

    const ext = uploadedFileObj.name.substring(uploadedFileObj.name.lastIndexOf(".") + 1).toLowerCase() || "bin"

    const newDoc = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      fileName: uploadedFileObj.name,
      fileSize: sizeStr,
      fileFormat: ext,
      downloads: 0,
      status: "Active",
      uploadDate: new Date().toISOString().split("T")[0]
    }

    const updated = [newDoc, ...files]
    saveToStorage(updated)
    setIsUploadOpen(false)
    setNewTitle("")
    setNewCategory("")
    setUploadedFileObj(null)
    showToast("File berhasil diunggah dan ditambahkan ke direktori!", "success")
  }

  const handleDelete = () => {
    const updated = files.filter(f => f.id !== selectedFile.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast("Dokumen berhasil dihapus dari direktori.", "success")
  }

  const handleSimulatedDownload = (file) => {
    const updated = files.map(f => f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f)
    saveToStorage(updated)
    showToast(`Mengunduh berkas '${file.fileName}'...`, "success")
  }

  const openDeleteModal = (file) => {
    setSelectedFile(file)
    setIsDeleteOpen(true)
  }

  const getFormatColor = (fmt) => {
    switch (fmt) {
      case "pdf": return "bg-red-50 text-red-700 border-red-200"
      case "xlsx":
      case "xls": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "docx":
      case "doc": return "bg-blue-50 text-blue-700 border-blue-200"
      case "zip":
      case "rar": return "bg-amber-50 text-amber-700 border-amber-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Dokumen & File</h2>
          <p className="text-text-muted text-xs mt-0.5">Unggah, klasifikasikan, pantau unduhan, dan kelola dokumen administrasi / teknis.</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setError("")
              setNewTitle("")
              setNewCategory(categories[0] || "Arsip Administrasi")
              setUploadedFileObj(null)
              setIsUploadOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Unggah File Baru</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul dokumen atau file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Kategori Dokumen:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Status Dokumen:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listing / Table */}
      {filteredFiles.length > 0 ? (
        <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                  <th className="py-4 px-6">Judul Dokumen</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Informasi Berkas</th>
                  <th className="py-4 px-6 text-center">Jumlah Unduhan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Tanggal Unggah</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-dark-base/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary max-w-xs truncate" title={file.title}>
                      {file.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded bg-dark-base border border-dark-border text-[10px] font-semibold">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded border text-[9px] font-extrabold uppercase ${getFormatColor(file.fileFormat)}`}>
                          {file.fileFormat}
                        </span>
                        <span className="text-[10px] text-text-muted truncate max-w-[150px]" title={file.fileName}>{file.fileName}</span>
                        <span className="text-[10px] text-text-muted shrink-0">({file.fileSize})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-semibold">
                      {file.downloads} kali
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        file.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">{file.uploadDate}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedFile(file)
                            setIsViewOpen(true)
                          }}
                          title="Detail / Pratinjau"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSimulatedDownload(file)}
                          title="Unduh File"
                          className="p-1.5 text-text-muted hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {!readOnly && (
                          <button
                            onClick={() => openDeleteModal(file)}
                            title="Hapus Dokumen"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card-surface bg-white border border-dark-border p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto animate-fade-in">
          <div className="p-4 bg-dark-base rounded-full border border-dark-border text-text-muted">
            <FolderOpen className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-text-primary">Direktori Dokumen Kosong</h3>
            <p className="text-text-secondary text-xs mt-1.5 leading-relaxed max-w-sm">
              Tidak ada berkas yang sesuai dengan kriteria pencarian Anda, atau belum ada dokumen yang diunggah ke kategori ini.
            </p>
          </div>
          <button
            onClick={() => {
              setError("")
              setNewTitle("")
              setNewCategory(categories[0] || "Arsip Administrasi")
              setUploadedFileObj(null)
              setIsUploadOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Unggah File Pertama</span>
          </button>
        </div>
      )}

      {/* Modal: Unggah File */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Unggah Dokumen Baru</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Judul Dokumen</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ketik judul dokumen..."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Klasifikasi Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Upload Drag & Drop zone */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-secondary">Pilih Berkas Komputer</span>
                  <span className="text-[10px] text-text-muted">Maks 10MB (PDF, DOCX, XLSX, ZIP)</span>
                </div>
                
                {uploadedFileObj ? (
                  <div className="flex items-center justify-between p-3.5 border border-dark-border rounded-xl bg-dark-base/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-5 w-5 text-accent-cyan shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-text-primary truncate">{uploadedFileObj.name}</span>
                        <span className="text-[10px] text-text-muted">{(uploadedFileObj.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFileObj(null)}
                      className="text-xs font-bold text-rose-600 hover:underline shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2.5 py-8 border-2 border-dashed border-dark-border hover:border-accent-cyan/40 bg-white hover:bg-dark-base/30 rounded-2xl cursor-pointer transition-all">
                    <Upload className="h-6 w-6 text-text-muted" />
                    <div className="text-center">
                      <span className="text-xs text-text-primary font-bold block">Klik untuk memilih file</span>
                      <span className="text-[10px] text-text-secondary mt-0.5 block">atau seret file Anda ke sini</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx,.xls,.zip,.rar,.doc"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-4 border-t border-dark-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary hover:bg-dark-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-cyan text-white rounded-xl text-xs font-bold hover:bg-blue-600"
                >
                  Unggah Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus File */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Hapus Dokumen?</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed font-semibold">
                  Apakah Anda yakin ingin menghapus berkas "{selectedFile?.title}" ({selectedFile?.fileName}) dari direktori penyimpanan?
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
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Detail */}
      {isViewOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Detail & Informasi Berkas</h3>
              <button onClick={() => setIsViewOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-text-secondary">
              <div className="p-4 bg-dark-base/30 rounded-xl border border-dark-border space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Judul Dokumen</span>
                  <span className="font-bold text-text-primary text-right max-w-[200px] truncate">{selectedFile.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Kategori Klasifikasi</span>
                  <span className="font-bold text-text-primary">{selectedFile.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Nama File</span>
                  <span className="font-mono text-accent-cyan truncate max-w-[180px]" title={selectedFile.fileName}>{selectedFile.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Ukuran Berkas</span>
                  <span className="font-medium text-text-primary">{selectedFile.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Format File</span>
                  <span className="font-bold uppercase text-accent-purple">{selectedFile.fileFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Total Diunduh</span>
                  <span className="font-bold text-emerald-600">{selectedFile.downloads} kali</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Status Dokumen</span>
                  <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${selectedFile.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>{selectedFile.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Tanggal Unggah</span>
                  <span className="font-medium text-text-primary">{selectedFile.uploadDate}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-dark-base/50 border-t border-dark-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => handleSimulatedDownload(selectedFile)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary bg-white hover:bg-dark-base transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
