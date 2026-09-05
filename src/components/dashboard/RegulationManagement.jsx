import { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  AlertTriangle,
  FileText,
  Upload,
  ExternalLink,
  RefreshCw,
  Inbox,
  FileCheck,
  Globe,
  ChevronLeft,
  ChevronRight,
  Lock,
  Info
} from "lucide-react"
import { regulationService } from "@/services/api.service"
import RichTextEditor from "../ui/RichTextEditor"
import RichTextContent from "../ui/RichTextContent"

// TODO: system_document_number akan berasal dari backend setelah API contract tersedia.
const generatePreviewSystemNumber = () => {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, "0")
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const yyyy = today.getFullYear()
  return `REG-${dd}${mm}${yyyy}-001`
}

const CATEGORIES = [
  "Peraturan Menteri",
  "SOP",
  "SK",
  "Surat Edaran",
  "Pedoman",
  "Pengumuman",
  "Lainnya"
]

export default function RegulationManagement({ showToast, readOnly = false }) {
  // Regulation state from Real Backend API (no persistent storage / mock data)
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Search & Filter State
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [filterStatus, setFilterStatus] = useState("Semua")

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const perPage = 10

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRegulation, setSelectedRegulation] = useState(null)

  // Detail Modal async state
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: CATEGORIES[0],
    system_document_number: "",
    original_document_number: "",
    document_date: "",
    description: "",
    source_type: "file", // 'file' | 'url'
    file: null,
    file_name: "",
    file_size: "",
    external_url: "",
    status: "published" // 'published' | 'draft'
  })
  const [formErrors, setFormErrors] = useState({})
  const [modalGeneralError, setModalGeneralError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track initial mount for debounce
  const isInitialMount = useRef(true)

  // Safe URL validator for http:// and https:// only
  const isValidUrl = (string) => {
    if (!string) return false
    try {
      const parsed = new URL(string)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  // 400ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page to 1 when search or filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setCurrentPage(1)
  }, [debouncedSearch, filterCategory, filterStatus])

  // Fetch Regulations from Real Backend API
  const fetchRegulations = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await regulationService.getRegulations({
        search: debouncedSearch.trim() || undefined,
        category: filterCategory !== "Semua" ? filterCategory : undefined,
        status: filterStatus !== "Semua" ? filterStatus.toLowerCase() : undefined,
        page: currentPage,
        per_page: perPage
      })

      if (res.success) {
        const rawData = res.data
        let list = []
        if (Array.isArray(rawData)) {
          list = rawData
          setTotalItems(rawData.length)
          setTotalPages(Math.max(1, Math.ceil(rawData.length / perPage)))
        } else if (rawData && Array.isArray(rawData.data)) {
          list = rawData.data
          setCurrentPage(rawData.current_page || 1)
          setTotalPages(rawData.last_page || 1)
          setTotalItems(rawData.total ?? rawData.data.length)
        } else if (rawData && typeof rawData === "object") {
          list = rawData.regulations || rawData.items || []
          setTotalItems(list.length)
          setTotalPages(1)
        }
        setRegulations(list)
      } else {
        if (res.status === 401) {
          // Handled by client.js redirection
          setError("Sesi Anda telah berakhir. Silakan login kembali.")
        } else if (res.status === 403) {
          setError("Anda tidak memiliki izin untuk melakukan tindakan ini.")
        } else if (res.status === 404) {
          setError("Regulasi tidak ditemukan.")
        } else if (res.status === 429) {
          setError(res.message || "Terlalu banyak permintaan ke server. Silakan tunggu beberapa saat.")
        } else if (res.status === 500 || res.status === 503) {
          setError("Tidak dapat terhubung ke server atau terjadi kendala pada server.")
        } else {
          setError(res.message || "Gagal memuat data regulasi dari server.")
        }
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterCategory, filterStatus, currentPage])

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchRegulations()
  }, [fetchRegulations])

  // Handle Manual Refresh
  const handleRefresh = () => {
    fetchRegulations()
    if (showToast) showToast("Memperbarui data regulasi...", "success")
  }

  // Handle PDF File Selection with Frontend Validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Extension validation (.pdf)
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "pdf" && file.type !== "application/pdf") {
      setFormErrors((prev) => ({
        ...prev,
        file: "Format berkas harus PDF (.pdf)."
      }))
      return
    }

    // Size validation (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setFormErrors((prev) => ({
        ...prev,
        file: "Ukuran berkas PDF maksimal 10 MB."
      }))
      return
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
        : (file.size / 1024).toFixed(0) + " KB"

    setFormData((prev) => ({
      ...prev,
      file,
      file_name: file.name,
      file_size: sizeFormatted
    }))

    setFormErrors((prev) => {
      const newErrs = { ...prev }
      delete newErrs.file
      return newErrs
    })
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      file_name: "",
      file_size: ""
    }))
  }

  // Frontend Form Validation
  const validateForm = (isEdit = false) => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = "Judul regulasi wajib diisi."
    }

    if (!formData.category) {
      errors.category = "Kategori regulasi wajib dipilih."
    }

    if (formData.source_type === "file") {
      if (!isEdit && !formData.file) {
        errors.file = "File dokumen PDF wajib diunggah."
      }
      if (formData.file) {
        const ext = formData.file.name.split(".").pop()?.toLowerCase()
        if (ext !== "pdf" && formData.file.type !== "application/pdf") {
          errors.file = "Format file harus berformat PDF (.pdf)."
        }
        if (formData.file.size > 10 * 1024 * 1024) {
          errors.file = "Ukuran file PDF maksimal 10 MB."
        }
      }
    } else if (formData.source_type === "url") {
      if (!formData.external_url.trim()) {
        errors.external_url = "URL dokumen eksternal wajib diisi."
      } else if (!isValidUrl(formData.external_url.trim())) {
        errors.external_url =
          "URL dokumen tidak valid. Gunakan format http:// atau https://."
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Create Regulation
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setModalGeneralError("")
    if (!validateForm(false)) return

    setIsSubmitting(true)
    try {
      let res
      const origNum = formData.original_document_number?.trim() || ""
      if (formData.source_type === "file") {
        const payload = new FormData()
        payload.append("title", formData.title.trim())
        if (formData.category) {
          payload.append("category", formData.category)
        }
        if (origNum) {
          payload.append("original_document_number", origNum)
          payload.append("document_number", origNum)
        }
        if (formData.document_date) {
          payload.append("document_date", formData.document_date)
        }
        if (formData.description?.trim()) {
          payload.append("description", formData.description.trim())
        }
        payload.append("source_type", "file")
        if (formData.status) {
          payload.append("status", formData.status.toLowerCase())
        }
        if (formData.file) {
          payload.append("file", formData.file)
        }

        res = await regulationService.createRegulation(payload)
      } else {
        const payload = {
          title: formData.title.trim(),
          source_type: "url",
          external_url: formData.external_url.trim(),
          status: formData.status.toLowerCase()
        }
        if (formData.category) {
          payload.category = formData.category
        }
        if (origNum) {
          payload.original_document_number = origNum
          payload.document_number = origNum
        }
        if (formData.document_date) {
          payload.document_date = formData.document_date
        }
        if (formData.description?.trim()) {
          payload.description = formData.description.trim()
        }

        res = await regulationService.createRegulation(payload)
      }

      if (res.success) {
        setIsAddOpen(false)
        resetForm()
        if (showToast) showToast("Regulasi berhasil disimpan.", "success")
        fetchRegulations()
      } else {
        if (res.status === 422) {
          if (res.errors && Object.keys(res.errors).length > 0) {
            setFormErrors(res.errors)
            if (showToast) showToast("Data regulasi tidak valid. Silakan periksa kembali input Anda.", "error")
          } else {
            setModalGeneralError(res.message || "Data regulasi tidak valid. Silakan periksa kembali input Anda.")
            if (showToast) showToast("Data regulasi tidak valid. Silakan periksa kembali input Anda.", "error")
          }
        } else if (res.status === 403) {
          setModalGeneralError("Anda tidak memiliki izin untuk melakukan tindakan ini.")
        } else if (res.status === 429) {
          setModalGeneralError(res.message || "Terlalu banyak permintaan. Silakan tunggu beberapa saat.")
        } else {
          setModalGeneralError(res.message || "Gagal menyimpan regulasi.")
        }
      }
    } catch {
      setModalGeneralError("Terjadi kesalahan jaringan saat menyimpan regulasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Edit Regulation
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRegulation) return
    setModalGeneralError("")
    if (!validateForm(true)) return

    setIsSubmitting(true)
    try {
      let res
      const origNum = formData.original_document_number?.trim() || ""
      if (formData.source_type === "file" && formData.file) {
        // User replaced the PDF file -> use FormData
        const payload = new FormData()
        payload.append("title", formData.title.trim())
        if (formData.category) {
          payload.append("category", formData.category)
        }
        if (origNum) {
          payload.append("original_document_number", origNum)
          payload.append("document_number", origNum)
        }
        if (formData.document_date) {
          payload.append("document_date", formData.document_date)
        }
        if (formData.description?.trim()) {
          payload.append("description", formData.description.trim())
        }
        payload.append("source_type", "file")
        if (formData.status) {
          payload.append("status", formData.status.toLowerCase())
        }
        payload.append("file", formData.file)

        res = await regulationService.updateRegulation(selectedRegulation.id, payload)
      } else {
        // Metadata update or external URL or unchanged PDF
        const payload = {
          title: formData.title.trim(),
          source_type: formData.source_type === "file" ? "file" : "url",
          status: formData.status.toLowerCase()
        }
        if (formData.category) {
          payload.category = formData.category
        }
        if (origNum) {
          payload.original_document_number = origNum
          payload.document_number = origNum
        }
        if (formData.document_date) {
          payload.document_date = formData.document_date
        }
        if (formData.description?.trim()) {
          payload.description = formData.description.trim()
        }
        if (formData.source_type === "url") {
          payload.external_url = formData.external_url.trim()
        }

        res = await regulationService.updateRegulation(selectedRegulation.id, payload)
      }

      if (res.success) {
        setIsEditOpen(false)
        resetForm()
        if (showToast) showToast("Regulasi berhasil diperbarui.", "success")
        fetchRegulations()
      } else {
        if (res.status === 422) {
          if (res.errors && Object.keys(res.errors).length > 0) {
            setFormErrors(res.errors)
            if (showToast) showToast("Data regulasi tidak valid. Silakan periksa kembali input Anda.", "error")
          } else {
            setModalGeneralError(res.message || "Data regulasi tidak valid. Silakan periksa kembali input Anda.")
            if (showToast) showToast("Data regulasi tidak valid. Silakan periksa kembali input Anda.", "error")
          }
        } else if (res.status === 403) {
          setModalGeneralError("Anda tidak memiliki izin untuk melakukan tindakan ini.")
        } else if (res.status === 404) {
          setModalGeneralError("Regulasi tidak ditemukan.")
        } else if (res.status === 429) {
          setModalGeneralError(res.message || "Terlalu banyak permintaan. Silakan tunggu beberapa saat.")
        } else {
          setModalGeneralError(res.message || "Gagal memperbarui regulasi.")
        }
      }
    } catch {
      setModalGeneralError("Terjadi kesalahan jaringan saat memperbarui regulasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedRegulation) return
    setIsSubmitting(true)
    try {
      const res = await regulationService.deleteRegulation(selectedRegulation.id)
      if (res.success) {
        setIsDeleteOpen(false)
        setSelectedRegulation(null)
        if (showToast) showToast("Regulasi berhasil dihapus.", "success")
        fetchRegulations()
      } else {
        if (res.status === 403) {
          if (showToast) showToast("Anda tidak memiliki izin untuk melakukan tindakan ini.", "error")
        } else if (res.status === 404) {
          if (showToast) showToast("Regulasi tidak ditemukan.", "error")
        } else {
          if (showToast) showToast(res.message || "Gagal menghapus regulasi.", "error")
        }
      }
    } catch {
      if (showToast) showToast("Terjadi kesalahan jaringan saat menghapus regulasi.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Modal Helpers
  const openAddModal = () => {
    resetForm()
    setFormErrors({})
    setModalGeneralError("")
    setFormData((prev) => ({
      ...prev,
      system_document_number: generatePreviewSystemNumber()
    }))
    setIsAddOpen(true)
  }

  const openEditModal = (reg) => {
    setSelectedRegulation(reg)
    const isFile = reg.source_type === "file" || reg.source_type === "pdf" || reg.source_type === "upload"
    const systemNum = reg.system_document_number || reg.document_number || "—"
    const originalNum = reg.original_document_number !== undefined
      ? reg.original_document_number
      : (reg.document_number && reg.document_number !== systemNum && reg.document_number !== "—" ? reg.document_number : "")

    setFormData({
      title: reg.title || "",
      category: reg.category || CATEGORIES[0],
      system_document_number: systemNum === "—" ? generatePreviewSystemNumber() : systemNum,
      original_document_number: originalNum === "—" ? "" : originalNum,
      document_date: reg.document_date ? reg.document_date.split("T")[0] : "",
      description: reg.description || "",
      source_type: isFile ? "file" : "url",
      file: null,
      file_name: reg.file_name || "",
      file_size: reg.file_size || "",
      external_url: reg.external_url || "",
      status: reg.status?.toLowerCase() === "draft" ? "draft" : "published"
    })
    setFormErrors({})
    setModalGeneralError("")
    setIsEditOpen(true)
  }

  // Open Detail Modal & Fetch fresh data from backend
  const openDetailModal = async (reg) => {
    setSelectedRegulation(reg)
    setDetailData(null)
    setDetailError("")
    setDetailLoading(true)
    setIsDetailOpen(true)

    try {
      const res = await regulationService.getRegulation(reg.id)
      if (res.success) {
        const fetched = res.data?.data || res.data || reg
        setDetailData(fetched)
      } else {
        if (res.status === 403) {
          setDetailError("Anda tidak memiliki izin untuk melakukan tindakan ini.")
        } else if (res.status === 404) {
          setDetailError("Regulasi tidak ditemukan.")
        } else {
          setDetailError(res.message || "Gagal memuat detail regulasi.")
        }
      }
    } catch {
      setDetailError("Gagal terhubung ke server saat memuat detail.")
    } finally {
      setDetailLoading(false)
    }
  }

  const openDeleteModal = (reg) => {
    setSelectedRegulation(reg)
    setIsDeleteOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: CATEGORIES[0],
      system_document_number: "",
      original_document_number: "",
      document_date: "",
      description: "",
      source_type: "file",
      file: null,
      file_name: "",
      file_size: "",
      external_url: "",
      status: "published"
    })
    setFormErrors({})
    setModalGeneralError("")
    setSelectedRegulation(null)
  }

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            PUBLISHED
          </span>
        )
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            DRAFT
          </span>
        )
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            ARCHIVED
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
            {status || "—"}
          </span>
        )
    }
  }

  // Source Type Badge Helper
  const getSourceBadge = (sourceType, fileName) => {
    if (sourceType === "file" || sourceType === "pdf" || sourceType === "upload") {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
          title={fileName || "PDF File"}
        >
          <FileText className="h-3 w-3 text-rose-600 shrink-0" />
          <span>UPLOAD PDF</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Globe className="h-3 w-3 text-blue-600 shrink-0" />
        <span>EXTERNAL URL</span>
      </span>
    )
  }

  // Active detail item (from detailData or selectedRegulation)
  const activeDetail = detailData || selectedRegulation
  const activeDocUrl = activeDetail?.document_url || activeDetail?.file_url || activeDetail?.external_url || ""

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2.5">
            <FileCheck className="h-5 w-5 text-accent-cyan" />
            <span>Manajemen Regulasi</span>
          </h2>
          <p className="text-text-muted text-xs mt-1">
            Kelola dokumen regulasi, SOP, peraturan, surat keputusan, dan pengumuman resmi.
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm shrink-0 hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Regulasi</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau nomor dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold whitespace-nowrap">
              Kategori:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none focus:border-accent-cyan/60"
            >
              <option value="Semua">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold whitespace-nowrap">
              Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-xl border border-dark-border px-3 py-1.5 bg-white text-text-secondary focus:outline-none focus:border-accent-cyan/60"
            >
              <option value="Semua">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Muat ulang data"
            className="p-2 rounded-xl border border-dark-border bg-dark-base hover:bg-white text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin text-accent-cyan" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 card-surface bg-white p-8 rounded-2xl border border-dark-border">
          <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-secondary font-bold animate-pulse">
            Memuat regulasi dari server...
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white border border-dark-border rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Gagal Memuat Regulasi</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-md">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : regulations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white border border-dark-border rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Belum Ada Regulasi</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-md">
              {search || filterCategory !== "Semua" || filterStatus !== "Semua"
                ? "Tidak ada regulasi yang cocok dengan kriteria pencarian dan filter Anda."
                : "Belum ada dokumen regulasi yang terdaftar di dalam sistem."}
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
            >
              Tambah Regulasi Baru
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/40 border-b border-dark-border text-text-secondary font-bold text-xs">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-5 min-w-[220px]">Judul Regulasi</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Nomor Dokumen</th>
                  <th className="py-3.5 px-4">Sumber</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Dokumen</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-xs">
                {regulations.map((reg, index) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-dark-base/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 text-center font-bold text-text-muted">
                      {(currentPage - 1) * perPage + index + 1}
                    </td>
                    <td className="py-4 px-5">
                      <div
                        className="font-bold text-text-primary line-clamp-2"
                        title={reg.title}
                      >
                        {reg.title}
                      </div>
                      {reg.description && (
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                          {reg.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-dark-base border border-dark-border text-text-secondary">
                        {reg.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-text-secondary">
                      {reg.original_document_number || reg.document_number || reg.system_document_number || "—"}
                    </td>
                    <td className="py-4 px-4">
                      {getSourceBadge(reg.source_type, reg.file_name)}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(reg.status)}</td>
                    <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                      {reg.document_date
                        ? new Date(reg.document_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                        : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Detail Button */}
                        <button
                          onClick={() => openDetailModal(reg)}
                          title="Lihat Detail Regulasi"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Button (Write access only) */}
                        {!readOnly && (
                          <button
                            onClick={() => openEditModal(reg)}
                            title="Edit Regulasi"
                            className="p-1.5 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete Button (Write access only) */}
                        {!readOnly && (
                          <button
                            onClick={() => openDeleteModal(reg)}
                            title="Hapus Regulasi"
                            className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

          {/* Server-side Pagination Footer */}
          <div className="p-4 bg-dark-base/20 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              Menampilkan{" "}
              <strong>
                {totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0} -{" "}
                {Math.min(currentPage * perPage, totalItems)}
              </strong>{" "}
              dari total <strong>{totalItems}</strong> regulasi
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="p-1.5 rounded-lg border border-dark-border bg-white text-text-secondary hover:text-text-primary hover:border-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .map((p, idx, arr) => (
                      <div key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-text-muted">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          disabled={loading}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            currentPage === p
                              ? "bg-accent-cyan text-white shadow-sm"
                              : "border border-dark-border bg-white text-text-secondary hover:text-text-primary hover:border-accent-cyan"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || loading}
                  className="p-1.5 rounded-lg border border-dark-border bg-white text-text-secondary hover:text-text-primary hover:border-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD REGULATION MODAL                            */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-dark-border max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-primary">
                    Tambah Dokumen Regulasi
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Lengkapi metadata dan sumber dokumen resmi regulasi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-dark-base transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalGeneralError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalGeneralError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Judul (Required) */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Judul Regulasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Peraturan Menteri ESDM No. 12 Tahun 2025..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.title
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan transition-colors`}
                />
                {formErrors.title && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.title)
                      ? formErrors.title.join(", ")
                      : formErrors.title}
                  </span>
                )}
              </div>

              {/* Kategori & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-primary mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      formErrors.category
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-dark-border bg-dark-base"
                    } text-text-primary focus:outline-none focus:border-accent-cyan`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {Array.isArray(formErrors.category)
                        ? formErrors.category.join(", ")
                        : formErrors.category}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-text-primary mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border bg-dark-base text-text-primary focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  {formErrors.status && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {Array.isArray(formErrors.status)
                        ? formErrors.status.join(", ")
                        : formErrors.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Nomor Dokumen System (Readonly) */}
              <div>
                <label className="block font-bold text-text-primary mb-1 flex items-center justify-between">
                  <span>Nomor Dokumen System</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1 font-normal">
                    <Lock className="h-3 w-3 text-text-muted" /> Otomatis
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.system_document_number || "REG-01092026-001"}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-dark-border bg-dark-base/70 text-text-muted font-mono cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Nomor dibuat otomatis oleh sistem.
                </p>
              </div>

              {/* Nomor Dokumen Asli (Optional) */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Nomor Dokumen Asli
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PERMEN-ESDM/12/2025"
                  value={formData.original_document_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      original_document_number: e.target.value
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.original_document_number
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan`}
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Nomor yang tercantum pada dokumen resmi.
                </p>
                {formErrors.original_document_number && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.original_document_number)
                      ? formErrors.original_document_number.join(", ")
                      : formErrors.original_document_number}
                  </span>
                )}
              </div>

              {/* Tanggal Dokumen */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_date: e.target.value
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.document_date
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary focus:outline-none focus:border-accent-cyan`}
                />
                {formErrors.document_date && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.document_date)
                      ? formErrors.document_date.join(", ")
                      : formErrors.document_date}
                  </span>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Deskripsi / Ringkasan
                </label>
                {/* TODO: Konfirmasi backend content format sebelum production rollout. */}
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) =>
                    setFormData({ ...formData, description })
                  }
                  placeholder="Ringkasan poin utama regulasi atau pedoman terkait..."
                  error={formErrors.description}
                  minHeight="160px"
                />
              </div>

              {/* Source Type Toggle */}
              <div className="space-y-2 pt-1 border-t border-dark-border/60">
                <label className="block font-bold text-text-primary">
                  Sumber Dokumen <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-dark-base p-1 rounded-xl border border-dark-border">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, source_type: "file" })
                    }
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.source_type === "file"
                        ? "bg-white text-accent-cyan shadow-sm border border-dark-border/40"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, source_type: "url" })
                    }
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.source_type === "url"
                        ? "bg-white text-accent-cyan shadow-sm border border-dark-border/40"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>External URL</span>
                  </button>
                </div>
                {formErrors.source_type && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.source_type)
                      ? formErrors.source_type.join(", ")
                      : formErrors.source_type}
                  </span>
                )}
              </div>

              {/* Dynamic Source Input */}
              {formData.source_type === "file" ? (
                <div className="space-y-2">
                  <label className="block font-bold text-text-secondary text-[11px]">
                    File PDF (Maksimal 10 MB) <span className="text-rose-500">*</span>
                  </label>
                  {!formData.file && !formData.file_name ? (
                    <div className="border-2 border-dashed border-dark-border rounded-xl p-4 text-center hover:border-accent-cyan/60 transition-colors bg-dark-base/40">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id="pdf-upload-create"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="pdf-upload-create"
                        className="cursor-pointer flex flex-col items-center space-y-1.5"
                      >
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <Upload className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-text-primary">
                          Pilih berkas PDF untuk diunggah
                        </span>
                        <span className="text-[10px] text-text-muted">
                          Format: PDF (.pdf) | Maksimal: 10MB
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate text-xs">
                            {formData.file_name}
                          </p>
                          <span className="text-[10px] text-text-muted">
                            {formData.file_size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Hapus file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {formErrors.file && (
                    <span className="text-[11px] text-rose-500 block">
                      {Array.isArray(formErrors.file)
                        ? formErrors.file.join(", ")
                        : formErrors.file}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary text-[11px]">
                    URL Dokumen Eksternal (Google Drive / Portal Resmi) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... atau https://jdih.esdm.go.id/..."
                      value={formData.external_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_url: e.target.value
                        })
                      }
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border ${
                        formErrors.external_url
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-dark-border bg-dark-base"
                      } text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan`}
                    />
                  </div>
                  {formErrors.external_url && (
                    <span className="text-[11px] text-rose-500 block">
                      {Array.isArray(formErrors.external_url)
                        ? formErrors.external_url.join(", ")
                        : formErrors.external_url}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-dark-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary hover:text-text-primary rounded-xl font-bold hover:bg-dark-base transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-accent-cyan text-white rounded-xl font-bold hover:bg-accent-cyan/90 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT REGULATION MODAL                           */}
      {/* ======================================================== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-dark-border max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Edit2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-primary">
                    Edit Dokumen Regulasi
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Perbarui informasi atau metadata regulasi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-dark-base transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalGeneralError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalGeneralError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Judul (Required) */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Judul Regulasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.title
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary focus:outline-none focus:border-accent-cyan`}
                />
                {formErrors.title && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.title)
                      ? formErrors.title.join(", ")
                      : formErrors.title}
                  </span>
                )}
              </div>

              {/* Kategori & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-primary mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      formErrors.category
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-dark-border bg-dark-base"
                    } text-text-primary focus:outline-none focus:border-accent-cyan`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {Array.isArray(formErrors.category)
                        ? formErrors.category.join(", ")
                        : formErrors.category}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-text-primary mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border bg-dark-base text-text-primary focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  {formErrors.status && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {Array.isArray(formErrors.status)
                        ? formErrors.status.join(", ")
                        : formErrors.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Nomor Dokumen System (Readonly) */}
              <div>
                <label className="block font-bold text-text-primary mb-1 flex items-center justify-between">
                  <span>Nomor Dokumen System</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1 font-normal">
                    <Lock className="h-3 w-3 text-text-muted" /> Otomatis
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.system_document_number || "REG-01092026-001"}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-dark-border bg-dark-base/70 text-text-muted font-mono cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Nomor dibuat otomatis oleh sistem.
                </p>
              </div>

              {/* Nomor Dokumen Asli (Optional) */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Nomor Dokumen Asli
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PERMEN-ESDM/12/2025"
                  value={formData.original_document_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      original_document_number: e.target.value
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.original_document_number
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan`}
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Nomor yang tercantum pada dokumen resmi.
                </p>
                {formErrors.original_document_number && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.original_document_number)
                      ? formErrors.original_document_number.join(", ")
                      : formErrors.original_document_number}
                  </span>
                )}
              </div>

              {/* Tanggal Dokumen */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_date: e.target.value
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.document_date
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-dark-border bg-dark-base"
                  } text-text-primary focus:outline-none focus:border-accent-cyan`}
                />
                {formErrors.document_date && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.document_date)
                      ? formErrors.document_date.join(", ")
                      : formErrors.document_date}
                  </span>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Deskripsi / Ringkasan
                </label>
                {/* TODO: Konfirmasi backend content format sebelum production rollout. */}
                <RichTextEditor
                  value={formData.description}
                  onChange={(description) =>
                    setFormData({ ...formData, description })
                  }
                  placeholder="Ringkasan poin utama regulasi atau pedoman terkait..."
                  error={formErrors.description}
                  minHeight="160px"
                />
              </div>

              {/* Source Type Toggle */}
              <div className="space-y-2 pt-1 border-t border-dark-border/60">
                <label className="block font-bold text-text-primary">
                  Sumber Dokumen
                </label>
                <div className="grid grid-cols-2 gap-2 bg-dark-base p-1 rounded-xl border border-dark-border">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, source_type: "file" })
                    }
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.source_type === "file"
                        ? "bg-white text-accent-cyan shadow-sm border border-dark-border/40"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, source_type: "url" })
                    }
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.source_type === "url"
                        ? "bg-white text-accent-cyan shadow-sm border border-dark-border/40"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>External URL</span>
                  </button>
                </div>
                {formErrors.source_type && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {Array.isArray(formErrors.source_type)
                      ? formErrors.source_type.join(", ")
                      : formErrors.source_type}
                  </span>
                )}
              </div>

              {/* Dynamic Source Input */}
              {formData.source_type === "file" ? (
                <div className="space-y-2">
                  <label className="block font-bold text-text-secondary text-[11px]">
                    File Dokumen PDF Saat Ini
                  </label>
                  {formData.file ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate text-xs">
                            {formData.file_name} (File Baru)
                          </p>
                          <span className="text-[10px] text-text-muted">
                            {formData.file_size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Batal pilih file baru"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : formData.file_name ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-base/40">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate text-xs">
                            {formData.file_name}
                          </p>
                          <span className="text-[10px] text-text-muted">
                            {formData.file_size || "File tersimpan di server"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="pdf-upload-edit"
                          className="px-2.5 py-1 bg-white border border-dark-border rounded-lg text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-accent-cyan cursor-pointer transition-colors"
                        >
                          Ganti File
                        </label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          id="pdf-upload-edit"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-dark-border rounded-xl p-4 text-center hover:border-accent-cyan/60 transition-colors bg-dark-base/40">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id="pdf-upload-edit-empty"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="pdf-upload-edit-empty"
                        className="cursor-pointer flex flex-col items-center space-y-1.5"
                      >
                        <Upload className="h-5 w-5 text-rose-500" />
                        <span className="font-bold text-text-primary">
                          Pilih file PDF baru (Opsional)
                        </span>
                      </label>
                    </div>
                  )}
                  {formErrors.file && (
                    <span className="text-[11px] text-rose-500 block">
                      {Array.isArray(formErrors.file)
                        ? formErrors.file.join(", ")
                        : formErrors.file}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary text-[11px]">
                    URL Dokumen Eksternal <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.external_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_url: e.target.value
                        })
                      }
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border ${
                        formErrors.external_url
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-dark-border bg-dark-base"
                      } text-text-primary focus:outline-none focus:border-accent-cyan`}
                    />
                  </div>
                  {formErrors.external_url && (
                    <span className="text-[11px] text-rose-500 block">
                      {Array.isArray(formErrors.external_url)
                        ? formErrors.external_url.join(", ")
                        : formErrors.external_url}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-dark-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary hover:text-text-primary rounded-xl font-bold hover:bg-dark-base transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-accent-cyan text-white rounded-xl font-bold hover:bg-accent-cyan/90 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DETAIL REGULATION MODAL                         */}
      {/* ======================================================== */}
      {isDetailOpen && activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-dark-border max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-primary">
                    Detail Dokumen Regulasi
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    Informasi lengkap dan tautan dokumen resmi.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-dark-base transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="h-7 w-7 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-text-secondary font-semibold">
                  Memuat rincian regulasi dari server...
                </span>
              </div>
            ) : detailError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                <p className="text-xs font-bold text-rose-700">{detailError}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-semibold bg-dark-base border border-dark-border text-text-secondary">
                    {activeDetail.category || "—"}
                  </span>
                  {getStatusBadge(activeDetail.status)}
                  {getSourceBadge(activeDetail.source_type, activeDetail.file_name)}
                </div>

                {/* Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-text-muted block">
                    Judul Dokumen
                  </span>
                  <h4 className="text-sm font-bold text-text-primary font-display mt-0.5 leading-snug">
                    {activeDetail.title}
                  </h4>
                </div>

                {/* Numbers & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-dark-base rounded-xl border border-dark-border">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted block">
                      Nomor Dokumen System
                    </span>
                    <span className="font-mono font-bold text-text-primary mt-0.5 block text-[11px]">
                      {activeDetail.system_document_number || activeDetail.document_number || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted block">
                      Nomor Dokumen Asli
                    </span>
                    <span className="font-mono font-bold text-text-primary mt-0.5 block text-[11px]">
                      {activeDetail.original_document_number || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted block">
                      Tanggal Dokumen
                    </span>
                    <span className="font-semibold text-text-primary mt-0.5 block text-[11px]">
                      {activeDetail.document_date
                        ? new Date(activeDetail.document_date).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {activeDetail.description && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-text-muted block mb-1">
                      Deskripsi / Ringkasan
                    </span>
                    <RichTextContent
                      content={activeDetail.description}
                      className="p-3 bg-dark-base/50 rounded-xl border border-dark-border text-text-secondary leading-relaxed"
                    />
                  </div>
                )}

                {/* Document Access Box */}
                <div className="p-4 rounded-xl border border-dark-border bg-white space-y-3">
                  <span className="text-[10px] font-bold uppercase text-text-muted block">
                    Akses Berkas Dokumen
                  </span>

                  {activeDetail.source_type === "file" ||
                  activeDetail.source_type === "pdf" ||
                  activeDetail.source_type === "upload" ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate text-xs">
                            {activeDetail.file_name || "Berkas Dokumen PDF"}
                          </p>
                          <span className="text-[10px] text-text-muted">
                            {activeDetail.file_size || "Format PDF"}
                          </span>
                        </div>
                      </div>

                      {activeDocUrl ? (
                        <a
                          href={activeDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Lihat Dokumen</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-text-muted italic">
                          Tautan dokumen belum tersedia
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary text-xs">
                            Dokumen Tautan Eksternal
                          </p>
                          <p className="text-[10px] text-text-muted truncate">
                            {activeDocUrl || activeDetail.external_url}
                          </p>
                        </div>
                      </div>

                      {activeDocUrl || activeDetail.external_url ? (
                        <a
                          href={activeDocUrl || activeDetail.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <span>Buka Dokumen ↗</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-text-muted italic">
                          Tautan belum tersedia
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-dark-base text-text-primary border border-dark-border rounded-xl font-bold text-xs hover:bg-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION MODAL                       */}
      {/* ======================================================== */}
      {isDeleteOpen && selectedRegulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-dark-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-text-primary">
                  Hapus Regulasi?
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Tindakan ini akan menghapus dokumen regulasi dari server secara permanen.
                </p>
              </div>
            </div>

            <div className="p-3 bg-dark-base rounded-xl border border-dark-border text-xs">
              <p className="text-text-muted mb-1 text-[11px]">
                Apakah Anda yakin ingin menghapus regulasi ini?
              </p>
              <p className="font-bold text-text-primary line-clamp-2">
                &ldquo;{selectedRegulation.title}&rdquo;
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-dark-border text-text-secondary hover:text-text-primary rounded-xl font-bold text-xs hover:bg-dark-base transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
