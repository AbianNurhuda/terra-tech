import { useState, useEffect } from "react"
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Search,
  RefreshCw,
  Home,
  Briefcase,
  FolderOpen,
  Phone,
  Sparkles,
  Layers,
  Info,
  Globe,
  HelpCircle,
  Clock,
  Shield,
  Check,
  AlertTriangle,
  FileCheck,
  FileText
} from "lucide-react"
import { navigationService, pageService } from "@/services/api.service"
import { defaultNavigations, registeredRoutes } from "@/utils/defaultNavigation"

// Icon mapping dictionary for dynamic visual representation
const iconMap = {
  Home,
  Briefcase,
  FolderOpen,
  Phone,
  Sparkles,
  Layers,
  Info,
  Globe,
  Compass,
  ExternalLink,
  FileCheck,
  FileText
}

export default function CmsNavigation({ role = "super_admin", showToast }) {
  const [navigations, setNavigations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [pages, setPages] = useState([])

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form State
  const [formData, setFormData] = useState({
    label: "",
    path: "/",
    type: "internal",
    icon: "Home",
    sort_order: 1,
    target: "_self",
    status: "active",
    is_coming_soon: false,
    page_id: ""
  })

  // Determine permissions based on role
  const isSuperOrAdmin = role === "super_admin" || role === "admin"
  const isEditor = role === "editor"
  const isOperator = role === "operator"
  const canCreate = isSuperOrAdmin
  const canEdit = isSuperOrAdmin || isEditor
  const canDelete = isSuperOrAdmin
  const canReorder = isSuperOrAdmin || isEditor
  const canToggleStatus = isSuperOrAdmin || isEditor

  // Fetch navigation data
  const fetchNavigations = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await navigationService.getNavigation()
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data.items || defaultNavigations)
        const sorted = [...items].sort((a, b) => Number(a.sort_order || a.order || 0) - Number(b.sort_order || b.order || 0))
        setNavigations(sorted)
        setIsBackendConnected(true)
      } else {
        // Backend API returned 404 or not implemented yet -> Fallback to default
        const savedFallback = localStorage.getItem("cms_navigation_fallback")
        if (savedFallback) {
          try {
            setNavigations(JSON.parse(savedFallback))
          } catch {
            setNavigations(defaultNavigations)
          }
        } else {
          setNavigations(defaultNavigations)
          localStorage.setItem("cms_navigation_fallback", JSON.stringify(defaultNavigations))
        }
        setIsBackendConnected(false)
      }
    } catch (err) {
      console.error("Navigation load failed:", err)
      setError("Gagal memuat navigasi dari server backend.")
      const savedFallback = localStorage.getItem("cms_navigation_fallback")
      setNavigations(savedFallback ? JSON.parse(savedFallback) : defaultNavigations)
      setIsBackendConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async () => {
    const res = await pageService.getPages({ status: "all" })
    if (res.success) {
      const data = res.data
      setPages(Array.isArray(data) ? data : (data?.items || data?.data || data?.pages || []))
    }
  }

  useEffect(() => {
    fetchNavigations()
    fetchPages()
  }, [])

  // Helper to persist in case of fallback mode
  const saveFallbackState = (items) => {
    const sorted = [...items].sort((a, b) => Number(a.sort_order || a.order || 0) - Number(b.sort_order || b.order || 0))
    setNavigations(sorted)
    localStorage.setItem("cms_navigation_fallback", JSON.stringify(sorted))
  }

  // Filter & Search Logic
  const filteredNavigations = navigations.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.path.toLowerCase().includes(search.toLowerCase())

    const matchesType = filterType === "all" || item.type === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Route validation checker for internal paths
  const checkRouteAvailability = (path) => {
    if (!path || !path.startsWith("/")) return { isValid: false, type: "invalid" }
    // Normalize path by removing query params and hash
    const cleanPath = path.split("?")[0].split("#")[0]
    const isBuiltIn = registeredRoutes.some((r) => {
      if (r.path === cleanPath) return true
      if (r.path.includes(":")) {
        const pattern = new RegExp("^" + r.path.replace(/:[^\s/]+/g, "([\\w-]+)") + "$")
        return pattern.test(cleanPath)
      }
      return false
    })
    return {
      isValid: true,
      type: isBuiltIn ? "builtin" : "dynamic"
    }
  }

  // Open Create Modal
  const handleOpenAdd = () => {
    const maxOrder = navigations.reduce((max, item) => Math.max(max, Number(item.sort_order || item.order || 0)), 0)
    setFormData({
      label: "",
      path: "/",
      type: "internal",
      icon: "Home",
      sort_order: maxOrder + 1,
      target: "_self",
      status: "active",
      is_coming_soon: false,
      page_id: ""
    })
    setFormError("")
    setIsAddOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      label: item.label,
      path: item.path,
      type: item.type || "internal",
      icon: item.icon || "Home",
      sort_order: item.sort_order || item.order || 1,
      target: item.target || "_self",
      status: item.status || "active",
      is_coming_soon: Boolean(item.is_coming_soon),
      page_id: item.page_id || item.page?.id || ""
    })
    setFormError("")
    setIsEditOpen(true)
  }

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item)
    setIsDeleteOpen(false)
    setTimeout(() => setIsDeleteOpen(true), 50)
  }

  // Handle Form Submission (Add)
  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!formData.label.trim()) {
      setFormError("Label menu navigasi wajib diisi.")
      return
    }

    if (!formData.path.trim()) {
      setFormError("Path / URL navigasi wajib diisi.")
      return
    }

    // External URL validation
    if (formData.type === "external") {
      try {
        const url = new URL(formData.path)
        if (!url.protocol.startsWith("http")) {
          setFormError("URL eksternal harus diawali dengan http:// atau https://")
          return
        }
      } catch {
        setFormError("Format URL eksternal tidak valid. Contoh: https://instagram.com/terratech")
        return
      }
    }

    // Internal URL duplicate path validation
    if (formData.type === "internal") {
      const normalizedNewPath = formData.path.trim().toLowerCase().replace(/\/+$/, "") || "/"
      const isDuplicate = navigations.some((n) => {
        if (n.type !== "internal") return false
        const normalizedExisting = (n.path || "").trim().toLowerCase().replace(/\/+$/, "") || "/"
        return normalizedExisting === normalizedNewPath
      })
      if (isDuplicate) {
        setFormError(`Menu dengan path '${formData.path.trim()}' sudah terdaftar. Hindari duplikasi menu internal.`)
        return
      }
    }

    setIsSubmitting(true)
    const newNav = {
      ...formData,
      id: Date.now(),
      sort_order: Number(formData.sort_order),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (isBackendConnected) {
      try {
        const res = await navigationService.createNavigation(newNav)
        if (res.success) {
          showToast?.("Menu navigasi baru berhasil ditambahkan!", "success")
          setIsAddOpen(false)
          fetchNavigations()
        } else {
          setFormError(res.message || "Gagal menambahkan navigasi ke backend.")
        }
      } catch {
        setFormError("Terjadi kendala saat menghubungi API backend.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Fallback mode
      const updated = [...navigations, newNav]
      saveFallbackState(updated)
      setIsSubmitting(false)
      setIsAddOpen(false)
      showToast?.("Menu navigasi baru berhasil ditambahkan!", "success")
    }
  }

  // Handle Form Submission (Edit)
  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!formData.label.trim()) {
      setFormError("Label menu navigasi wajib diisi.")
      return
    }

    if (!formData.path.trim()) {
      setFormError("Path / URL navigasi wajib diisi.")
      return
    }

    if (formData.type === "external") {
      try {
        const url = new URL(formData.path)
        if (!url.protocol.startsWith("http")) {
          setFormError("URL eksternal harus diawali dengan http:// atau https://")
          return
        }
      } catch {
        setFormError("Format URL eksternal tidak valid. Contoh: https://instagram.com/terratech")
        return
      }
    }

    // Internal URL duplicate path validation on Edit
    if (formData.type === "internal") {
      const normalizedNewPath = formData.path.trim().toLowerCase().replace(/\/+$/, "") || "/"
      const isDuplicate = navigations.some((n) => {
        if (n.id === selectedItem?.id) return false
        if (n.type !== "internal") return false
        const normalizedExisting = (n.path || "").trim().toLowerCase().replace(/\/+$/, "") || "/"
        return normalizedExisting === normalizedNewPath
      })
      if (isDuplicate) {
        setFormError(`Menu dengan path '${formData.path.trim()}' sudah terdaftar. Hindari duplikasi menu internal.`)
        return
      }
    }

    setIsSubmitting(true)
    const updatedItem = {
      ...selectedItem,
      ...formData,
      sort_order: Number(formData.sort_order),
      updated_at: new Date().toISOString()
    }

    if (isBackendConnected) {
      try {
        const res = await navigationService.updateNavigation(selectedItem.id, updatedItem)
        if (res.success) {
          showToast?.("Navigasi berhasil diperbarui!", "success")
          setIsEditOpen(false)
          fetchNavigations()
        } else {
          setFormError(res.message || "Gagal memperbarui navigasi pada server backend.")
        }
      } catch {
        setFormError("Terjadi kendala saat menghubungi API backend.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Fallback mode
      const updated = navigations.map((item) => (item.id === selectedItem.id ? updatedItem : item))
      saveFallbackState(updated)
      setIsSubmitting(false)
      setIsEditOpen(false)
      showToast?.("Navigasi berhasil diperbarui!", "success")
    }
  }

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)

    if (isBackendConnected) {
      try {
        const res = await navigationService.deleteNavigation(selectedItem.id)
        if (res.success) {
          showToast?.("Menu navigasi berhasil dihapus.", "success")
          setIsDeleteOpen(false)
          fetchNavigations()
        } else {
          showToast?.(res.message || "Gagal menghapus navigasi dari backend.", "error")
        }
      } catch {
        showToast?.("Gagal menghapus navigasi dari backend.", "error")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      const updated = navigations.filter((item) => item.id !== selectedItem.id)
      saveFallbackState(updated)
      setIsSubmitting(false)
      setIsDeleteOpen(false)
      showToast?.("Menu navigasi berhasil dihapus.", "success")
    }
  }

  // Handle Quick Status Toggle
  const handleToggleStatus = async (item) => {
    if (!canToggleStatus) return
    const newStatus = item.status === "active" ? "inactive" : "active"

    if (isBackendConnected) {
      try {
        const res = await navigationService.toggleStatus(item.id, newStatus)
        if (res.success) {
          showToast?.(`Status menu '${item.label}' diubah menjadi ${newStatus}.`, "success")
          fetchNavigations()
        } else {
          showToast?.(res.message || "Gagal mengubah status di backend.", "error")
        }
      } catch {
        showToast?.("Gagal mengubah status di backend.", "error")
      }
    } else {
      const updated = navigations.map((n) => (n.id === item.id ? { ...n, status: newStatus } : n))
      saveFallbackState(updated)
      showToast?.(`Status menu '${item.label}' diubah menjadi ${newStatus}.`, "success")
    }
  }

  // Handle Reorder (Move Up / Down)
  const handleReorder = async (index, direction) => {
    if (!canReorder) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= navigations.length) return

    const newItems = [...navigations]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Re-assign sequence orders 1..N
    const reordered = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }))

    if (isBackendConnected) {
      try {
        const res = await navigationService.reorderNavigation(reordered)
        if (res.success) {
          showToast?.("Urutan navigasi berhasil diperbarui.", "success")
          fetchNavigations()
        } else {
          showToast?.("Gagal menyimpan urutan di backend.", "error")
        }
      } catch {
        showToast?.("Gagal menyimpan urutan di backend.", "error")
      }
    } else {
      saveFallbackState(reordered)
      showToast?.("Urutan navigasi berhasil diperbarui.", "success")
    }
  }

  // Render Icon helper
  const renderIcon = (iconName, className = "h-4 w-4") => {
    const IconComponent = iconMap[iconName] || Globe
    return <IconComponent className={className} />
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">CMS Control Panel</span>
            <span className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-bold">
              v1.0 Navigation Engine
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1 flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-accent-cyan" />
            <span>CMS Navigasi (Navigation Management)</span>
          </h2>
          <p className="text-text-secondary text-xs mt-1">
            Kelola menu bar navigasi website Terra Tech secara dinamis tanpa perlu mengubah kode sumber Navbar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchNavigations}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-dark-border bg-white text-text-secondary hover:text-text-primary hover:bg-dark-base text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
            title="Refresh data dari server"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent-cyan" : ""}`} />
            <span>Refresh</span>
          </button>

          {canCreate && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg shadow-accent-cyan/20 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah NavLink</span>
            </button>
          )}
        </div>
      </div>

      {/* Backend Connection Status Notice */}
      {!isBackendConnected && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-1">
            <p className="font-bold text-amber-700">
              Integrasi REST API Backend: Mode Baseline Navigation Aktif (Fallback Mode)
            </p>
            <p className="text-[11px] text-amber-600/90 leading-relaxed">
              Endpoint backend <code className="px-1 py-0.5 bg-amber-100/50 rounded font-mono text-[10px]">/api/v1/cms/navigation</code> belum tersedia di server. Seluruh data navigasi saat ini disimpan dan disinkronkan melalui baseline schema Terra Tech. Menu Navbar publik tetap berjalan normal dan aman.
            </p>
          </div>
        </div>
      )}

      {/* Live Navbar Preview Card */}
      <div className="p-5 rounded-2xl bg-dark-base border border-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <Eye className="h-4 w-4 text-accent-cyan" />
            <span>Live Preview Navbar (Pratinjau Langsung Publik)</span>
          </div>
          <span className="text-[10px] text-text-muted">
            Tampilan simulasi header website berdasarkan konfigurasi menu aktif saat ini
          </span>
        </div>

        {/* Mockup Header Box */}
        <div className="bg-dark-surface/90 rounded-xl border border-dark-border p-4 shadow-inner">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-display font-bold text-sm text-text-primary">
                Terra<span className="text-accent-cyan">Tech</span>
              </span>
            </div>

            {/* Nav Items */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-1">
              {navigations
                .filter((n) => n.status === "active")
                .map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/5 text-text-primary"
                  >
                    {renderIcon(n.icon, "h-3.5 w-3.5 text-accent-cyan")}
                    <span>{n.label}</span>
                    {n.type === "external" && <ExternalLink className="h-3 w-3 text-text-muted" />}
                    {(n.is_coming_soon || n.type === "coming_soon") && (
                      <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-bold">
                        Soon
                      </span>
                    )}
                  </div>
                ))}
            </div>

            {/* CTA Button */}
            <div className="px-3 py-1.5 rounded-lg bg-accent-cyan text-white text-xs font-bold shadow-sm">
              Hubungi Kami
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80 relative">
          <Search className="absolute left-3 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Cari label menu atau path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-white text-text-secondary focus:outline-none focus:border-accent-cyan/40"
          >
            <option value="all">Semua Tipe</option>
            <option value="internal">Internal Route</option>
            <option value="external">External Link</option>
            <option value="coming_soon">Coming Soon</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-white text-text-secondary focus:outline-none focus:border-accent-cyan/40"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif (Active)</option>
            <option value="inactive">Nonaktif (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Navigation Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-text-secondary animate-pulse">Memuat navigasi...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white p-6 rounded-2xl border border-dark-border">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-text-primary">{error}</h3>
          <button
            onClick={fetchNavigations}
            className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredNavigations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white p-6 rounded-2xl border border-dark-border">
          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-text-primary">Belum ada menu navigasi.</h3>
          <p className="text-xs text-text-secondary">
            {search || filterType !== "all" || filterStatus !== "all"
              ? "Tidak ada menu yang sesuai dengan filter pencarian."
              : "Klik tombol Tambah NavLink di atas untuk membuat menu navigasi pertama."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-base/50 text-text-muted border-b border-dark-border text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Label</th>
                <th className="px-4 py-3.5">Path / URL</th>
                <th className="px-4 py-3.5">Page</th>
                <th className="px-4 py-3.5">Tipe</th>
                <th className="px-4 py-3.5 text-center">Icon</th>
                <th className="px-4 py-3.5 text-center">Urutan</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Coming Soon</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredNavigations.map((item, index) => {
                const isInternal = item.type === "internal"
                const routeStatus = isInternal ? checkRouteAvailability(item.path) : { isValid: true }
                const isComingSoon = Boolean(item.is_coming_soon || item.type === "coming_soon")

                return (
                  <tr key={item.id} className="hover:bg-dark-base/30 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-text-muted">{index + 1}</td>

                    <td className="px-4 py-4 font-bold text-text-primary">
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {isInternal && (
                          routeStatus.type === "dynamic" ? (
                            <span
                              title="Halaman dinamis terhubung dengan Dynamic CMS Page Engine"
                              className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-100 text-[9px] font-bold flex items-center gap-1"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>CMS Page</span>
                            </span>
                          ) : !routeStatus.isValid ? (
                            <span
                              title="Path internal harus diawali dengan /"
                              className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>Path Invalid</span>
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px] text-text-secondary max-w-xs truncate" title={item.path}>
                      <span className="flex items-center gap-1.5">
                        {item.path}
                        {item.type === "external" && (
                          <ExternalLink className="h-3 w-3 text-text-muted shrink-0" />
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-text-secondary">
                      {item.page?.title || pages.find((page) => String(page.id) === String(item.page_id))?.title || (
                        <span className="text-amber-600 text-[10px] font-semibold">Belum terhubung ke halaman</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {item.type === "internal" ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                          Internal
                        </span>
                      ) : item.type === "external" ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                          External ({item.target || "_self"})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">
                          Coming Soon
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-dark-base border border-dark-border text-accent-cyan" title={item.icon}>
                        {renderIcon(item.icon, "h-4 w-4")}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-text-primary px-1.5">{item.sort_order || item.order || index + 1}</span>
                        {canReorder && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleReorder(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded bg-dark-base hover:bg-dark-border text-text-secondary disabled:opacity-30 transition-colors"
                              title="Pindah ke Atas"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleReorder(index, "down")}
                              disabled={index === navigations.length - 1}
                              className="p-1 rounded bg-dark-base hover:bg-dark-border text-text-secondary disabled:opacity-30 transition-colors"
                              title="Pindah ke Bawah"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {canToggleStatus ? (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }`}
                          title="Klik untuk ubah status aktif/nonaktif"
                        >
                          {item.status === "active" ? "● Aktif" : "○ Nonaktif"}
                        </button>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {item.status === "active" ? "● Aktif" : "○ Nonaktif"}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isComingSoon ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          Ya
                        </span>
                      ) : (
                        <span className="text-text-muted font-semibold text-[11px]">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit ? (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg border border-dark-border text-text-secondary hover:text-accent-cyan hover:bg-dark-base transition-colors"
                            title="Edit Menu Navigasi"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted italic px-2">Read Only</span>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus Menu Navigasi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form: Tambah / Edit NavLink */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-dark-border shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="font-display font-bold text-base text-text-primary flex items-center gap-2">
                <Compass className="h-5 w-5 text-accent-cyan" />
                <span>{isAddOpen ? "Tambah Menu NavLink Baru" : "Edit Menu NavLink"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false)
                  setIsEditOpen(false)
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={isAddOpen ? handleSubmitAdd : handleSubmitEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Label Menu (Teks Tampilan)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Layanan, Portofolio, Blog..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tipe NavLink</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value
                      setFormData({
                        ...formData,
                        type: newType,
                        target: newType === "external" ? "_blank" : "_self",
                        is_coming_soon: newType === "coming_soon" ? true : formData.is_coming_soon
                      })
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="internal">Internal Route</option>
                    <option value="external">External URL</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="Home">Home (Beranda)</option>
                    <option value="Briefcase">Briefcase (Layanan / Produk)</option>
                    <option value="FolderOpen">FolderOpen (Portofolio / Berkas)</option>
                    <option value="FileCheck">FileCheck (Regulasi / Kebijakan)</option>
                    <option value="FileText">FileText (Dokumen / Halaman)</option>
                    <option value="Phone">Phone (Kontak)</option>
                    <option value="Sparkles">Sparkles (Inovasi / AI)</option>
                    <option value="Layers">Layers (Alur / Layanan)</option>
                    <option value="Info">Info (Tentang / Informasi)</option>
                    <option value="Globe">Globe (Web / Publik)</option>
                    <option value="Compass">Compass (Eksplorasi)</option>
                    <option value="ExternalLink">ExternalLink (Tautan Luar)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">Path / URL Tujuan</label>
                  {formData.type === "internal" && (
                    <span className="text-[10px] text-text-muted">Gunakan awalan slash (/)</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === "internal"
                      ? "Contoh: /layanan atau /portofolio"
                      : "Contoh: https://instagram.com/terratech"
                  }
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 font-mono"
                />

                {/* Route Validation Helper Alerts */}
                {formData.type === "internal" && formData.path.trim() && (() => {
                  const check = checkRouteAvailability(formData.path)
                  if (!check.isValid) {
                    return (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-2 mt-1">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                        <span>
                          <strong>Format Path Salah:</strong> Path internal wajib diawali dengan tanda slash (<code className="font-mono font-bold">/</code>), contoh: <code className="font-mono">/tentang-kami</code>.
                        </span>
                      </div>
                    )
                  }
                  if (check.type === "dynamic") {
                    return (
                      <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] flex items-start gap-2 mt-1">
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-accent-cyan" />
                        <span>
                          <strong>Dynamic CMS Page:</strong> Route ini otomatis aktif dan dirender melalui Dynamic Page Engine Terra Tech.
                        </span>
                      </div>
                    )
                  }
                  return (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold mt-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Rute statis bawaan sistem terdaftar.</span>
                    </div>
                  )
                })()}
              </div>

              {formData.type === "internal" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Halaman CMS Terhubung</label>
                  <select
                    value={formData.page_id}
                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="">Belum terhubung ke halaman</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title} ({page.slug})
                      </option>
                    ))}
                  </select>
                  {pages.length === 0 && <p className="text-[10px] text-text-muted">Tidak ada Pages dari backend atau endpoint belum dapat diakses.</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Target Window</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="_self">_self (Halaman yang sama)</option>
                    <option value="_blank">_blank (Buka di Tab Baru)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Urutan Menu</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Tampilan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40"
                  >
                    <option value="active">Aktif (Tampilkan di Navbar)</option>
                    <option value="inactive">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={formData.is_coming_soon}
                      onChange={(e) => setFormData({ ...formData, is_coming_soon: e.target.checked })}
                      className="rounded border-dark-border text-accent-cyan focus:ring-accent-cyan/20 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-text-primary">Tandai "Coming Soon"</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false)
                    setIsEditOpen(false)
                  }}
                  className="px-4 py-2 rounded-xl border border-dark-border bg-white text-text-secondary text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{isAddOpen ? "Simpan Menu" : "Perbarui Menu"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation: Delete NavLink */}
      {isDeleteOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-dark-border shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-text-primary">Hapus Menu Navigasi?</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus menu <strong>"{selectedItem.label}"</strong> ({selectedItem.path}) dari Navbar? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 border-t border-dark-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-dark-border bg-white text-text-secondary text-xs font-bold hover:bg-dark-base transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
