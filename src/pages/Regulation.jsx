import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search,
  FileCheck,
  FileText,
  ExternalLink,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Inbox,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Maximize2
} from "lucide-react"
import { regulationService } from "@/services/api.service"
import { Button } from "@/components/ui/Button"
import { cn } from "@/utils/cn"
import RichTextContent from "@/components/ui/RichTextContent"

const CATEGORIES = [
  "Semua",
  "Peraturan Menteri",
  "SOP",
  "SK",
  "Surat Edaran",
  "Pedoman",
  "Pengumuman",
  "Lainnya"
]

export function RegulationPage() {
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Search & Filter State
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const perPage = 9

  // PDF Viewer Modal State
  const [viewerModal, setViewerModal] = useState({
    open: false,
    regulation: null
  })

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when category changes
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  // Safe document URL resolver
  const resolveDocUrl = useCallback((item) => {
    if (!item) return ""
    const rawUrl =
      item.document_url ||
      item.file_url ||
      item.external_url ||
      item.file ||
      item.path ||
      item.storage_path ||
      ""
    if (!rawUrl) return ""
    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl
    }
    const apiBase = import.meta.env.VITE_API_URL || ""
    if (apiBase) {
      try {
        const parsed = new URL(apiBase)
        return `${parsed.origin}/${rawUrl.replace(/^\/+/, "")}`
      } catch {
        return `${apiBase.replace(/\/+$/, "")}/${rawUrl.replace(/^\/+/, "")}`
      }
    }
    return rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`
  }, [])

  // Fetch published regulations from backend API
  const fetchRegulations = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await regulationService.getPublicRegulations({
        search: debouncedSearch.trim() || undefined,
        category: selectedCategory !== "Semua" ? selectedCategory : undefined,
        page: currentPage,
        per_page: perPage
      })

      if (res.success && res.data) {
        const rawData = res.data
        let list = []
        let total = 0
        let lastPage = 1

        if (Array.isArray(rawData)) {
          list = rawData
          total = rawData.length
          lastPage = Math.max(1, Math.ceil(rawData.length / perPage))
        } else if (rawData && Array.isArray(rawData.data)) {
          list = rawData.data
          total = rawData.total ?? rawData.data.length
          lastPage = rawData.last_page || 1
        } else if (rawData && typeof rawData === "object") {
          list = rawData.regulations || rawData.items || []
          total = list.length
          lastPage = 1
        }

        // Defensive check: backend is source of truth, verify status 'published' if status property is present
        const publishedOnly = list.filter((item) => {
          if (!item.status) return true
          return String(item.status).toLowerCase().trim() === "published"
        })

        setRegulations(publishedOnly)
        setTotalItems(total || publishedOnly.length)
        setTotalPages(lastPage)
      } else {
        setError(res.message || "Gagal memuat data regulasi.")
      }
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategory, currentPage])

  useEffect(() => {
    fetchRegulations()
  }, [fetchRegulations])

  // Open PDF Viewer Modal
  const openViewer = (reg) => {
    setViewerModal({
      open: true,
      regulation: reg
    })
  }

  const closeViewer = () => {
    setViewerModal({
      open: false,
      regulation: null
    })
  }

  // Active doc URL in viewer
  const viewerDocUrl = useMemo(() => {
    return viewerModal.regulation ? resolveDocUrl(viewerModal.regulation) : ""
  }, [viewerModal.regulation, resolveDocUrl])

  return (
    <div className="min-h-screen bg-dark-base text-text-primary pt-28 pb-20">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent-cyan/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-accent-purple/10 blur-[140px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* ======================================================== */}
        {/* HERO SECTION                                            */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan text-xs font-bold uppercase tracking-wider shadow-sm">
            <FileCheck className="h-4 w-4" />
            <span>Dokumentasi Kebijakan Resmi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-text-primary leading-tight">
            Regulasi & Kepatuhan <br className="hidden sm:inline" />
            <span className="glow-text">Terra Tech</span>
          </h1>

          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Akses transparansi regulasi, standar operasional prosedur (SOP), surat keputusan, dan pedoman kebijakan resmi untuk mendukung tata kelola teknologi yang berintegritas.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SEARCH & FILTER CONTROLS                                */}
        {/* ======================================================== */}
        <div className="card-surface p-4 sm:p-6 bg-dark-surface/80 backdrop-blur-xl border border-dark-border rounded-2xl sm:rounded-3xl shadow-xl space-y-5 animate-fade-up">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Cari regulasi berdasarkan judul, kata kunci, atau nomor dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-dark-border bg-dark-base text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-dark-border">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 duration-150",
                    isActive
                      ? "bg-accent-cyan text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] scale-100"
                      : "bg-dark-base/80 border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-border/40"
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* REGULATION GRID / MAIN CONTENT                          */}
        {/* ======================================================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="h-10 w-10 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary font-bold animate-pulse">
              Memuat regulasi...
            </span>
          </div>
        ) : error ? (
          <div className="card-surface p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto bg-dark-surface/90 border border-dark-border rounded-3xl shadow-xl animate-fade-in">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary font-display">
                Gagal memuat data regulasi.
              </h3>
              <p className="text-xs text-text-secondary">{error}</p>
            </div>
            <Button onClick={fetchRegulations} size="sm" className="h-9 px-5 text-xs font-bold">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Coba Lagi
            </Button>
          </div>
        ) : regulations.length === 0 ? (
          <div className="card-surface p-8 sm:p-14 text-center space-y-4 max-w-lg mx-auto bg-dark-surface/90 border border-dark-border rounded-3xl shadow-xl animate-fade-in">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-dark-base border border-dark-border flex items-center justify-center text-text-muted">
              <Inbox className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-text-primary font-display">
                Belum ada regulasi yang dipublikasikan.
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {search || selectedCategory !== "Semua"
                  ? "Tidak ditemukan dokumen regulasi yang sesuai dengan kriteria pencarian Anda."
                  : "Dokumen regulasi resmi belum tersedia untuk ditampilkan saat ini."}
              </p>
            </div>
            {(search || selectedCategory !== "Semua") && (
              <button
                onClick={() => {
                  setSearch("")
                  setSelectedCategory("Semua")
                }}
                className="px-4 py-2 text-xs font-bold text-accent-cyan hover:underline"
              >
                Reset Filter Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regulations.map((reg) => {
                const docUrl = resolveDocUrl(reg)
                const isFile =
                  reg.source_type === "file" ||
                  reg.source_type === "pdf" ||
                  reg.source_type === "upload" ||
                  Boolean(reg.file_name)

                return (
                  <div
                    key={reg.id}
                    className="card-surface bg-dark-surface/80 backdrop-blur-md border border-dark-border hover:border-accent-cyan/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] group"
                  >
                    <div className="space-y-4">
                      {/* Top Badges & Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                          {reg.category || "Regulasi"}
                        </span>

                        {reg.document_date && (
                          <div className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(reg.document_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Document Number */}
                      <div className="space-y-1.5">
                        <h3 className="font-display font-bold text-base text-text-primary line-clamp-2 group-hover:text-accent-cyan transition-colors">
                          {reg.title}
                        </h3>

                        {(reg.original_document_number || (reg.document_number && reg.document_number !== "—") || reg.system_document_number) && (
                          <div className="inline-block px-2 py-0.5 rounded bg-dark-base border border-dark-border text-[11px] font-mono text-text-secondary">
                            No. {reg.original_document_number || reg.document_number || reg.system_document_number}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {reg.description && (
                        <RichTextContent
                          content={reg.description}
                          className="text-xs text-text-secondary leading-relaxed line-clamp-3"
                        />
                      )}
                    </div>

                    {/* Footer Info & Action Button */}
                    <div className="pt-5 mt-4 border-t border-dark-border/60 flex flex-col gap-3">
                      {/* File Details if available */}
                      {isFile && reg.file_name && (
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span className="truncate" title={reg.file_name}>
                            {reg.file_name}
                          </span>
                          {reg.file_size && (
                            <span className="shrink-0 text-[10px] opacity-75">
                              ({reg.file_size})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {docUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openViewer(reg)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan border border-accent-cyan/30 hover:border-accent-cyan text-accent-cyan hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Lihat Dokumen</span>
                            </button>

                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl border border-dark-border bg-dark-base hover:bg-dark-border/50 text-text-secondary hover:text-text-primary transition-colors"
                              title="Buka Dokumen di Tab Baru"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </>
                        ) : (
                          <div className="w-full py-2 px-3 rounded-xl bg-dark-base border border-dark-border text-center text-xs text-text-muted italic">
                            Dokumen belum dilampirkan
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
                <span>
                  Menampilkan{" "}
                  <strong className="text-text-primary">
                    {(currentPage - 1) * perPage + 1} -{" "}
                    {Math.min(currentPage * perPage, totalItems)}
                  </strong>{" "}
                  dari <strong className="text-text-primary">{totalItems}</strong> regulasi
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-dark-border bg-dark-surface hover:bg-dark-border text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-3 py-1 font-bold text-text-primary">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-dark-border bg-dark-surface hover:bg-dark-border text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
                    title="Halaman selanjutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* PDF VIEWER INTERACTIVE EMBED MODAL                      */}
      {/* ======================================================== */}
      {viewerModal.open && viewerModal.regulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-base/85 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-surface border border-dark-border rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between gap-4 bg-dark-base/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-accent-cyan/15 text-accent-cyan">
                      {viewerModal.regulation.category || "Regulasi"}
                    </span>
                    {viewerModal.regulation.document_number && (
                      <span className="text-[10px] font-mono text-text-muted">
                        No. {viewerModal.regulation.document_number}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-text-primary truncate mt-0.5">
                    {viewerModal.regulation.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {viewerDocUrl && (
                  <a
                    href={viewerDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-dark-border bg-dark-base text-text-secondary hover:text-text-primary hover:bg-dark-border/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Buka dokumen di tab baru"
                  >
                    <span>Tab Baru</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <button
                  onClick={closeViewer}
                  className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-dark-border/40 transition-colors"
                  title="Tutup viewer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embed PDF Viewer with iframe & fallback */}
            <div className="flex-1 bg-dark-base relative overflow-hidden flex flex-col">
              {viewerDocUrl ? (
                <iframe
                  src={`${viewerDocUrl}#toolbar=1&navpanes=0`}
                  title={viewerModal.regulation.title}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                  <p className="text-sm font-bold text-text-primary">
                    Tautan dokumen PDF tidak tersedia.
                  </p>
                  <p className="text-xs text-text-secondary max-w-sm">
                    Dokumen ini mungkin berupa tautan eksternal atau berkas belum diunggah oleh pengelola.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-dark-border bg-dark-surface/90 flex items-center justify-between text-xs text-text-muted">
              <span className="truncate">
                {viewerModal.regulation.file_name || viewerModal.regulation.title}
              </span>
              <button
                onClick={closeViewer}
                className="px-4 py-1.5 rounded-xl bg-dark-base border border-dark-border font-bold text-text-primary hover:bg-dark-border/40 transition-colors"
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

export default RegulationPage
