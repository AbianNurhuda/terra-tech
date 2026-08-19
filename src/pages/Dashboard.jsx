import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService, dashboardService } from "@/services/api.service"
import {
  Shield,
  UserCheck,
  Radio,
  FileEdit,
  LogOut,
  Home,
  Settings,
  Users,
  BarChart3,
  Inbox,
  Layers,
  Plus,
  Search,
  Bell,
  Clock,
  AlertTriangle,
  Menu,
  X,
  Building2,
  Megaphone,
  Calendar,
  Tags,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  User,
  BookOpen,
  Download,
  Paperclip,
  CheckSquare,
  Activity
} from "lucide-react"

// Import Super Admin Subviews
import UsersManagement from "@/components/dashboard/UsersManagement"
import CompanyProfileConfig from "@/components/dashboard/CompanyProfileConfig"
import InformationManagement from "@/components/dashboard/InformationManagement"
import AnnouncementsManagement from "@/components/dashboard/AnnouncementsManagement"
import TimelineManagement from "@/components/dashboard/TimelineManagement"
import DocumentManagement from "@/components/dashboard/DocumentManagement"
import DocumentCategoriesManagement from "@/components/dashboard/DocumentCategoriesManagement"
import RegistrationFlowManagement from "@/components/dashboard/RegistrationFlowManagement"
import MyAccount from "@/components/dashboard/MyAccount"
import CmsLandingPage from "@/components/dashboard/CmsLandingPage"

export function DashboardPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Ringkasan")
  
  // Toast notification state
  const [toast, setToast] = useState(null)

  // Real-time metric counts
  const [metrics, setMetrics] = useState({
    totalUsers: 5,
    activeRoles: 4,
    systemStatus: "Online & Stabil",
    cmsVersion: "v1.4.0-build.2026",
    totalArticles: 4,
    totalAnnouncements: 3,
    totalTimelines: 4,
    totalFiles: 4,
    totalRegistrationSteps: 4,
    totalFileDownloads: 276,
    totalAnnDownloads: 67
  })

  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState("")
  const [dashboardEmpty, setDashboardEmpty] = useState(false)
  const [activities, setActivities] = useState({})
  const [draftsCount, setDraftsCount] = useState({
    information: 0,
    announcements: 0,
    timelines: 0,
    files: 0,
    registration_steps: 0
  })
  const [systemHealth, setSystemHealth] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole")
    const savedEmail = localStorage.getItem("userEmail")
    const savedName = localStorage.getItem("userName")
    const token = localStorage.getItem("api_token")

    if (!token && !savedRole) {
      navigate("/login")
      return
    }

    if (savedRole) {
      setRole(savedRole)
      setEmail(savedEmail || "")
      setName(savedName || "User Staf")
      if (savedRole === "admin" || savedRole === "editor") {
        setActiveTab("Dashboard Operasional")
      } else {
        setActiveTab("Ringkasan")
      }
    }

    const fetchFreshProfile = async () => {
      const res = await authService.refreshCurrentUser()
      if (res.success && res.user) {
        setRole(res.role)
        setEmail(res.user.email || "")
        setName(res.user.name || "User Staf")
      } else {
        authService.logout()
        navigate("/login")
      }
    }

    if (token) {
      fetchFreshProfile()
    }
  }, [navigate])

  const fetchDashboardData = async () => {
    setDashboardLoading(true)
    setDashboardError("")
    setDashboardEmpty(false)
    try {
      const res = await dashboardService.getDashboard()
      if (res.success && res.data) {
        const d = res.data
        const isEmpty = !d || (!d.stats && !d.activity && !d.drafts);
        setDashboardEmpty(isEmpty)
        setMetrics({
          totalUsers: d.stats?.total_users ?? 0,
          activeRoles: 4,
          systemStatus: d.system_health?.status || "Online & Stabil",
          cmsVersion: "v1.4.0-build.2026",
          totalArticles: d.stats?.total_information ?? 0,
          totalAnnouncements: d.stats?.total_announcements ?? 0,
          totalTimelines: d.stats?.total_timelines ?? 0,
          totalFiles: d.stats?.total_files ?? 0,
          totalRegistrationSteps: d.stats?.total_registration_steps ?? 0,
          totalFileDownloads: d.stats?.total_file_downloads ?? 0,
          totalAnnDownloads: d.stats?.total_announcement_downloads ?? 0
        })

        if (d.drafts) {
          setDraftsCount(d.drafts)
        }

        if (d.activity) {
          setActivities(d.activity)
        }

        if (d.system_health) {
          setSystemHealth(d.system_health)
        }
      } else {
        setDashboardError(res.message || "Terjadi kesalahan. Silakan coba lagi.")
      }
    } catch (err) {
      console.error(err)
      setDashboardError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setDashboardLoading(false)
    }
  }

  // Fetch real-time dashboard data from REST API
  useEffect(() => {
    if (!role) return

    if (activeTab === "Ringkasan" || activeTab === "Dashboard Operasional") {
      fetchDashboardData()
    }
  }, [role, activeTab])

  const handleLogout = async () => {
    await authService.logout()
    navigate("/login")
  }

  // Get all draft items for monitoring
  const getDraftItems = () => {
    const drafts = []

    // Articles
    const savedArticles = localStorage.getItem("cms_articles")
    const articleList = savedArticles ? JSON.parse(savedArticles) : []
    articleList.forEach(a => {
      if (a.status === "Draft") {
        drafts.push({
          id: `article-${a.id}`,
          type: "Artikel",
          title: a.title,
          meta: `Kategori: ${a.category}`,
          originalItem: a,
          typeKey: "article"
        })
      }
    })

    // Announcements
    const savedAnnouncements = localStorage.getItem("cms_announcements")
    const announcementList = savedAnnouncements ? JSON.parse(savedAnnouncements) : []
    announcementList.forEach(a => {
      if (a.status === "Draft") {
        drafts.push({
          id: `announcement-${a.id}`,
          type: "Pengumuman",
          title: a.title,
          meta: `Prioritas: ${a.priority}`,
          originalItem: a,
          typeKey: "announcement"
        })
      }
    })

    // Timelines
    const savedTimelines = localStorage.getItem("cms_timelines")
    const timelineList = savedTimelines ? JSON.parse(savedTimelines) : []
    timelineList.forEach(t => {
      if (!t.isPublished) {
        drafts.push({
          id: `timeline-${t.id}`,
          type: "Timeline",
          title: t.title,
          meta: `Urutan: ${t.sequence} | Status: ${t.agendaStatus}`,
          originalItem: t,
          typeKey: "timeline"
        })
      }
    })

    // Files
    const savedFiles = localStorage.getItem("cms_files")
    const fileList = savedFiles ? JSON.parse(savedFiles) : []
    fileList.forEach(f => {
      if (f.status === "Draft") {
        drafts.push({
          id: `file-${f.id}`,
          type: "Dokumen",
          title: f.title,
          meta: `Kategori: ${f.category} | File: ${f.fileName}`,
          originalItem: f,
          typeKey: "file"
        })
      }
    })

    // Registration Steps
    const savedSteps = localStorage.getItem("cms_registration_steps")
    const stepList = savedSteps ? JSON.parse(savedSteps) : []
    stepList.forEach(s => {
      if (!s.isPublished) {
        drafts.push({
          id: `step-${s.id}`,
          type: "Alur Pendaftaran",
          title: s.title,
          meta: `Tahapan: ${s.sequence} | ${s.requirementsCount} Syarat`,
          originalItem: s,
          typeKey: "step"
        })
      }
    })

    return drafts
  }

  const handlePublishDraft = (draft) => {
    if (draft.typeKey === "article") {
      const saved = localStorage.getItem("cms_articles")
      const list = saved ? JSON.parse(saved) : []
      const updated = list.map(item => item.id === draft.originalItem.id ? { ...item, status: "Published", publishDate: new Date().toISOString().split("T")[0] } : item)
      localStorage.setItem("cms_articles", JSON.stringify(updated))
    } else if (draft.typeKey === "announcement") {
      const saved = localStorage.getItem("cms_announcements")
      const list = saved ? JSON.parse(saved) : []
      const updated = list.map(item => item.id === draft.originalItem.id ? { ...item, status: "Published", publishDate: new Date().toISOString().split("T")[0] } : item)
      localStorage.setItem("cms_announcements", JSON.stringify(updated))
    } else if (draft.typeKey === "timeline") {
      const saved = localStorage.getItem("cms_timelines")
      const list = saved ? JSON.parse(saved) : []
      const updated = list.map(item => item.id === draft.originalItem.id ? { ...item, isPublished: true } : item)
      localStorage.setItem("cms_timelines", JSON.stringify(updated))
    } else if (draft.typeKey === "file") {
      const saved = localStorage.getItem("cms_files")
      const list = saved ? JSON.parse(saved) : []
      const updated = list.map(item => item.id === draft.originalItem.id ? { ...item, status: "Active" } : item)
      localStorage.setItem("cms_files", JSON.stringify(updated))
    } else if (draft.typeKey === "step") {
      const saved = localStorage.getItem("cms_registration_steps")
      const list = saved ? JSON.parse(saved) : []
      const updated = list.map(item => item.id === draft.originalItem.id ? { ...item, isPublished: true } : item)
      localStorage.setItem("cms_registration_steps", JSON.stringify(updated))
    }

    showToast(`Konten '${draft.title}' berhasil diterbitkan!`, "success")
    // Force metrics calculation update by updating some trigger state
    setActiveTab(activeTab) 
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  // Define sidebar navigation links per role
  const getNavLinks = () => {
    const common = [
      { name: "Ringkasan", icon: Home },
    ]

    switch (role) {
      case "super_admin":
        return [
          { name: "Ringkasan", icon: Home },
          { name: "Kelola Pengguna", icon: Users, isUnavailable: true },
          { name: "Profil Perusahaan", icon: Building2, isUnavailable: true },
          { name: "Informasi Perusahaan", icon: FileEdit },
          { name: "Pengumuman Staf", icon: Megaphone },
          { name: "Timeline & Milestone", icon: Calendar },
          { name: "Dokumen & File", icon: FolderOpen },
          { name: "Kategori Dokumen", icon: Tags, isUnavailable: true },
          { name: "CMS Halaman Utama", icon: BookOpen }
        ]
      case "admin":
        return [
          { name: "Dashboard Operasional", icon: Home },
          { name: "Profil Perusahaan", icon: Building2, isUnavailable: true },
          { name: "Manajemen Informasi", icon: FileEdit },
          { name: "Manajemen Pengumuman", icon: Megaphone },
          { name: "Manajemen Timeline", icon: Calendar },
          { name: "Manajemen Dokumen File", icon: FolderOpen },
          { name: "Manajemen Kategori File", icon: Tags, isUnavailable: true },
          { name: "Manajemen Alur Pendaftaran", icon: Layers },
          { name: "CMS Halaman Utama", icon: BookOpen },
          { name: "Akun Saya", icon: User },
        ]
      case "operator":
        return [
          { name: "Ringkasan", icon: Home },
          { name: "Dashboard Operasional", icon: BarChart3 },
          { name: "Lihat Informasi", icon: FileEdit },
          { name: "Manajemen Pengumuman", icon: Megaphone },
          { name: "Manajemen Timeline", icon: Calendar },
          { name: "Manajemen Dokumen File", icon: FolderOpen },
          { name: "Manajemen Alur Pendaftaran", icon: Layers },
          { name: "CMS Halaman Utama", icon: BookOpen }
        ]
      case "editor":
        return [
          { name: "Dashboard Operasional", icon: Home },
          { name: "Manajemen Informasi", icon: FileEdit },
          { name: "Manajemen Pengumuman", icon: Megaphone },
          { name: "Manajemen Timeline", icon: Calendar },
          { name: "Manajemen Dokumen File", icon: FolderOpen },
          { name: "Manajemen Kategori File", icon: Tags, isUnavailable: true },
          { name: "Manajemen Alur Pendaftaran", icon: Layers },
          { name: "CMS Halaman Utama", icon: BookOpen }
        ]
      default:
        return common
    }
  }

  const renderComingSoon = (title) => {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-text-primary">Modul {title}</h3>
          <p className="text-[11px] text-text-secondary mt-1.5 max-w-sm leading-relaxed">
            Fitur belum tersedia di API backend.
          </p>
        </div>
      </div>
    )
  }

  const getCombinedActivities = () => {
    const combined = []
    if (!activities) return combined

    if (activities.latest_information) {
      activities.latest_information.forEach(x => combined.push({
        time: x.created_at,
        label: "INFO",
        color: "text-blue-500",
        text: `Artikel baru dibuat: "${x.title}" oleh ${x.creator?.name || "Staf"}`
      }))
    }
    if (activities.latest_announcements) {
      activities.latest_announcements.forEach(x => combined.push({
        time: x.created_at,
        label: "ANNC",
        color: "text-amber-500",
        text: `Pengumuman dirilis: "${x.title}" (Prioritas: ${x.priority})`
      }))
    }
    if (activities.latest_timelines) {
      activities.latest_timelines.forEach(x => combined.push({
        time: x.created_at,
        label: "TIME",
        color: "text-purple-500",
        text: `Timeline agenda baru: "${x.title}"`
      }))
    }
    if (activities.latest_files) {
      activities.latest_files.forEach(x => combined.push({
        time: x.created_at,
        label: "FILE",
        color: "text-emerald-500",
        text: `File diunggah: "${x.title}"`
      }))
    }
    if (activities.latest_registration_steps) {
      activities.latest_registration_steps.forEach(x => combined.push({
        time: x.created_at,
        label: "STEP",
        color: "text-indigo-500",
        text: `Langkah alur pendaftaran diperbarui: "${x.title}"`
      }))
    }
    
    combined.sort((a, b) => new Date(b.time) - new Date(a.time))
    return combined.slice(0, 8)
  }

  const renderDraftsPanel = () => {
    const draftModules = [
      { name: "Informasi", count: draftsCount.information, color: "text-blue-500", bg: "bg-blue-50/50 border-blue-100/50 hover:bg-blue-50" },
      { name: "Pengumuman", count: draftsCount.announcements, color: "text-amber-500", bg: "bg-amber-50/50 border-amber-100/50 hover:bg-amber-50" },
      { name: "Timeline", count: draftsCount.timelines, color: "text-purple-500", bg: "bg-purple-50/50 border-purple-100/50 hover:bg-purple-50" },
      { name: "Dokumen", count: draftsCount.files, color: "text-emerald-500", bg: "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50" },
      { name: "Pendaftaran", count: draftsCount.registration_steps, color: "text-indigo-500", bg: "bg-indigo-50/50 border-indigo-100/50 hover:bg-indigo-50" }
    ]

    const totalDrafts = Object.values(draftsCount).reduce((a, b) => a + b, 0)

    return (
      <div className="card-surface p-6 bg-white space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-dark-border pb-3">
          <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            <span>Pemantauan Draft Konten</span>
          </h3>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
            {totalDrafts} Draft Tertunda
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {draftModules.map((m) => (
            <div key={m.name} className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${m.bg}`}>
              <span className="text-[10px] font-bold uppercase text-text-muted">{m.name}</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-2xl font-bold font-display ${m.color}`}>{m.count}</span>
                <span className="text-[9px] text-text-secondary font-semibold">draft</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Get specific header tags or labels for the role
  const getRoleBadge = () => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admin", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Shield }
      case "admin":
        return { label: "Administrator", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: UserCheck }
      case "operator":
        return { label: "Operator Staf", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Radio }
      case "editor":
        return { label: "Editor Konten", color: "bg-pink-100 text-pink-800 border-pink-200", icon: FileEdit }
      default:
        return { label: "Staf", color: "bg-gray-100 text-gray-800 border-gray-200", icon: Users }
    }
  }

  const roleBadge = getRoleBadge()
  const RoleIcon = roleBadge.icon
  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen bg-dark-base text-text-primary relative">
      {/* Toast Notification Alert Box */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 bg-white max-w-sm animate-fade-in animate-float">
          {toast.type === "success" ? (
            <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          ) : (
            <span className="p-1 rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </span>
          )}
          <p className="text-xs font-semibold text-text-primary">{toast.message}</p>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-dark-border transform transition-transform duration-300 ease-out md:translate-x-0 shrink-0 cms-sidebar-visible ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Sidebar Brand Header */}
            <div className="h-20 px-6 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white font-bold shadow-sm">
                  T
                </span>
                <span className="font-display font-bold text-lg tracking-tight">
                  Terra<span className="text-accent-cyan">Tech</span>
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar User Profile Card */}
            <div className="p-4 mx-4 my-6 bg-dark-base rounded-2xl border border-dark-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center font-bold text-accent-cyan font-display shrink-0">
                {name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-text-primary truncate" title={name}>{name}</h4>
                <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold whitespace-nowrap ${roleBadge.color}`}>
                  <RoleIcon className="h-3 w-3 shrink-0" />
                  <span>{roleBadge.label}</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 space-y-1.5 overflow-y-auto max-h-[55vh]">
              {navLinks.map((link) => {
                const LinkIcon = link.icon
                const isActive = activeTab === link.name
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      setActiveTab(link.name)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-accent-cyan text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)]"
                        : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-text-muted"}`} />
                      <span>{link.name}</span>
                    </div>
                    {link.isUnavailable && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        Soon
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer / Logout */}
          <div className="p-4 border-t border-dark-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all duration-200"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-text-primary/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Workspace Area */}
      <div className="min-h-screen flex flex-col cms-sidebar-offset">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-dark-border px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-base"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-3 w-64 md:w-80 relative">
              <Search className="absolute left-3 text-text-muted h-4 w-4" />
              <input
                type="text"
                placeholder="Cari modul atau data..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/40 focus:ring-2 focus:ring-accent-cyan/5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="p-2.5 rounded-xl border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-base transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-cyan" />
            </button>

            {/* Account Info on Header */}
            <div className="flex items-center gap-2.5 text-right pl-2 border-l border-dark-border">
              <div>
                <span className="block text-[10px] font-bold text-accent-cyan uppercase tracking-wide">{roleBadge.label}</span>
                <span className="block text-xs font-extrabold text-text-primary">{name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Work Screen */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Active Tab Router */}
          {activeTab === "Ringkasan" || activeTab === "Dashboard Operasional" ? (
            dashboardLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 min-h-[60vh] w-full">
                <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-text-secondary font-bold animate-pulse">Memuat data...</span>
              </div>
            ) : dashboardError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 card-surface p-6 bg-white min-h-[60vh] w-full">
                <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Terjadi kesalahan. Silakan coba lagi.</h3>
                  <p className="text-xs text-text-secondary mt-1">{dashboardError !== "Terjadi kesalahan. Silakan coba lagi." && dashboardError}</p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : dashboardEmpty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 card-surface p-6 bg-white min-h-[60vh] w-full">
                <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Belum ada data.</h3>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : role === "operator" ? (
              activeTab === "Ringkasan" ? (
                /* Custom Operator Dashboard - Ringkasan */
                <div className="space-y-6 animate-fade-in">
                  {/* Welcome Intro Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">Portal Operator Staf</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1">
                        Selamat Datang, {name}!
                      </h2>
                      <p className="text-text-secondary text-xs mt-1">
                        Hak akses login aktif sebagai <strong>{roleBadge.label}</strong>. Pantau modul informasi dan berkas perusahaan TerraTech.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-dark-border rounded-xl shadow-sm text-xs font-semibold text-text-secondary">
                      <Clock className="h-4 w-4 text-accent-cyan" />
                      <span>Akses Sistem: <strong className="text-emerald-600">{metrics.systemStatus}</strong></span>
                    </div>
                  </div>

                  {/* Responsibility Card */}
                  <div className="card-surface p-6 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border-accent-cyan/20 space-y-3">
                    <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                      <User className="h-5 w-5 text-accent-cyan" />
                      <span>Tanggung Jawab Operator</span>
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Sebagai staf **Operator**, Anda memiliki tugas dan tanggung jawab untuk mengawasi status publikasi pengumuman penting, timeline tahapan kegiatan/milestone perusahaan, serta memantau File Manager (direktori dokumen & berkas) agar semua informasi tetap sinkron dan dapat diakses dengan baik oleh pengguna.
                    </p>
                  </div>

                  {/* Status Summaries */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Pengumuman */}
                    <div className="card-surface p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Status Pengumuman</span>
                        <Megaphone className="h-5 w-5 text-accent-cyan" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-3xl font-bold font-display text-text-primary">{metrics.totalAnnouncements}</h4>
                        <p className="text-[11px] text-text-secondary">Total pengumuman terdaftar di portal.</p>
                      </div>
                      <div className="pt-2 border-t border-dark-border flex justify-between text-[11px] font-semibold text-text-muted">
                        <span>Metrik Pengumuman:</span>
                        <span className="text-accent-cyan">Ditinjau berkala</span>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="card-surface p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Status Timeline</span>
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-3xl font-bold font-display text-text-primary">{metrics.totalTimelines}</h4>
                        <p className="text-[11px] text-text-secondary">Milestone peta jalan aktif perusahaan.</p>
                      </div>
                      <div className="pt-2 border-t border-dark-border flex justify-between text-[11px] font-semibold text-text-muted">
                        <span>Urutan Agenda:</span>
                        <span className="text-purple-600">Sesuai timeline</span>
                      </div>
                    </div>

                    {/* Status File Manager */}
                    <div className="card-surface p-6 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Status File Manager</span>
                        <FolderOpen className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-3xl font-bold font-display text-text-primary">{metrics.totalFiles}</h4>
                        <p className="text-[11px] text-text-secondary">Dokumen & berkas file arsip terunggah.</p>
                      </div>
                      <div className="pt-2 border-t border-dark-border flex justify-between text-[11px] font-semibold text-text-muted">
                        <span>Total Downloads:</span>
                        <span className="text-emerald-600 font-bold">{metrics.totalFileDownloads} kali</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Custom Operator Dashboard - Dashboard Operasional */
                <div className="space-y-6 animate-fade-in">
                  {/* Operational Intro Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">Dashboard Operasional</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1">
                        Pemantauan Kegiatan Operasional
                      </h2>
                      <p className="text-text-secondary text-xs mt-1">
                        Laporan aktivitas server, kinerja sistem real-time, dan status logs portal TerraTech.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-dark-border rounded-xl shadow-sm text-xs font-semibold text-text-secondary">
                      <Activity className="h-4.5 w-4.5 text-accent-cyan animate-pulse" />
                      <span>Uptime: <strong className="text-emerald-600">99.98% (Online)</strong></span>
                    </div>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Database Latency */}
                    <div className="card-surface p-5 bg-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-text-muted">Database Latency</span>
                        <h3 className="text-2xl font-bold font-display text-text-primary mt-1">34 ms</h3>
                        <span className="text-[10px] font-semibold text-emerald-600">Sangat Cepat</span>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                    </div>

                    {/* System Latency */}
                    <div className="card-surface p-5 bg-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-text-muted">Beban CPU Server</span>
                        <h3 className="text-2xl font-bold font-display text-text-primary mt-1">12.4%</h3>
                        <span className="text-[10px] font-semibold text-text-secondary">Optimal</span>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity className="h-5 w-5" />
                      </div>
                    </div>

                    {/* File Storage Used */}
                    <div className="card-surface p-5 bg-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-text-muted">Storage Terpakai</span>
                        <h3 className="text-2xl font-bold font-display text-text-primary mt-1">4.2 GB</h3>
                        <span className="text-[10px] font-semibold text-text-secondary">Maks kapasitas 50GB</span>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Active API Operations */}
                    <div className="card-surface p-5 bg-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-text-muted">API Connections</span>
                        <h3 className="text-2xl font-bold font-display text-text-primary mt-1">154 / mnt</h3>
                        <span className="text-[10px] font-semibold text-purple-600">Aktif & Stabil</span>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Layers className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Logs & Tasks */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card-surface p-6 bg-white space-y-4">
                      <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                        <span>Log Aktivitas Sistem (Real-time Logs)</span>
                      </h3>
                       <div className="space-y-2.5 font-mono text-[11px] max-h-[220px] overflow-y-auto pr-1 bg-dark-base p-4 rounded-xl border border-dark-border text-text-secondary">
                        {getCombinedActivities().length > 0 ? (
                          getCombinedActivities().map((log, idx) => (
                            <div key={idx} className="flex gap-2 text-left">
                              <span className="text-text-muted">[{new Date(log.time).toLocaleTimeString("id-ID")}]</span>
                              <span className={`${log.color} font-bold`}>[{log.label}]</span>
                              <span className="text-text-primary">{log.text}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-text-muted py-4 text-center">Belum ada aktivitas log terbaru dari server.</div>
                        )}
                      </div>
                    </div>

                    <div className="card-surface p-6 bg-white space-y-4">
                      <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                        <CheckSquare className="h-4.5 w-4.5 text-accent-cyan" />
                        <span>Agenda Tugas Operator</span>
                      </h3>
                      <div className="space-y-3.5 text-xs text-text-secondary">
                        <div className="flex items-start gap-2.5">
                          <input type="checkbox" defaultChecked className="mt-0.5 rounded border-dark-border text-accent-cyan" />
                          <span>Verifikasi & publikasikan berkas pengumuman bulanan</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <input type="checkbox" defaultChecked className="mt-0.5 rounded border-dark-border text-accent-cyan" />
                          <span>Pantau total unduhan berkas PDF staf</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <input type="checkbox" defaultChecked className="mt-0.5 rounded border-dark-border text-accent-cyan" />
                          <span>Sinkronkan tanggal mulai & selesai timeline</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <input type="checkbox" className="mt-0.5 rounded border-dark-border text-accent-cyan" />
                          <span>Kelompokkan file arsip berdasarkan kategori baru</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Welcome Intro Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">CMS Portal Utama</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1">
                      Selamat Datang, {name}!
                    </h2>
                    <p className="text-text-secondary text-xs mt-1">
                      Hak akses login aktif sebagai <strong>{roleBadge.label}</strong>. Gunakan panel navigasi samping untuk mengelola seluruh modul data Terra Tech.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-dark-border rounded-xl shadow-sm text-xs font-semibold text-text-secondary">
                    <Clock className="h-4 w-4 text-accent-cyan" />
                    <span>Akses Sistem: <strong className="text-emerald-600">{metrics.systemStatus}</strong></span>
                  </div>
                </div>

              {/* Metrics Summary Cards */}
              {role === "admin" || role === "editor" ? (
                /* Admin role metrics cards: 8 summary metrics */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Total Pengguna</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalUsers}</h3>
                      <span className="text-[10px] font-semibold text-text-secondary">Pengguna terdaftar</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Artikel Informasi</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalArticles}</h3>
                      <span className="text-[10px] font-semibold text-text-secondary">Klip artikel blog</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Pengumuman Resmi</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalAnnouncements}</h3>
                      <span className="text-[10px] font-semibold text-emerald-600">Terbit di portal</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Megaphone className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Agenda Timeline</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalTimelines}</h3>
                      <span className="text-[10px] font-semibold text-purple-600">Milestone aktif</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Berkas Dokumen</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalFiles}</h3>
                      <span className="text-[10px] font-semibold text-text-secondary">Arsip file diunduh</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Alur Pendaftaran</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalRegistrationSteps}</h3>
                      <span className="text-[10px] font-semibold text-indigo-600">Tahap registrasi</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Unduhan Dokumen</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalFileDownloads}</h3>
                      <span className="text-[10px] font-semibold text-emerald-600">Total didownload</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Download className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Unduhan Lampiran</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalAnnDownloads}</h3>
                      <span className="text-[10px] font-semibold text-pink-600 font-sans">Lampiran diunduh</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                      <Paperclip className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Super Admin/Default role metrics cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Total User CMS</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.totalUsers}</h3>
                      <span className="text-[10px] font-semibold text-text-secondary">Akun staf terdaftar</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Jumlah Role Aktif</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">{metrics.activeRoles}</h3>
                      <span className="text-[10px] font-semibold text-emerald-600">Super, Admin, Operator, Editor</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Status Keamanan</span>
                      <h3 className="text-2xl font-bold font-display text-text-primary mt-1">Aktif</h3>
                      <span className="text-[10px] font-semibold text-emerald-600">SSL & Firewall diproteksi</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <UserCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="card-surface p-5 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted">Versi CMS</span>
                      <h3 className="text-xl font-bold font-display text-text-primary mt-1.5">{metrics.cmsVersion}</h3>
                      <span className="text-[10px] font-semibold text-text-muted">Rilis stabil terbaru</span>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                      <Settings className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Core Information Panel & Draft Monitoring */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Draft Monitoring Panel */}
                  {renderDraftsPanel()}

                  {/* Operational Instructions */}
                  <div className="card-surface p-6 bg-white space-y-4">
                    <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                      <Building2 className="h-4.5 w-4.5 text-accent-cyan" />
                      <span>Petunjuk Operasional Portal {roleBadge.label}</span>
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Sebagai <strong>{roleBadge.label}</strong>, Anda memiliki otorisasi penuh untuk mengonfigurasi website dan mengelola seluruh modul data Terra Tech. Gunakan sidebar sebelah kiri untuk menavigasi ke menu manajemen yang Anda inginkan:
                    </p>
                    <ul className="text-xs text-text-secondary space-y-2.5 pl-5 list-disc leading-relaxed">
                      <li><strong>Profil Perusahaan</strong>: Konfigurasikan identitas visual seperti logo, slogan, favicon, dan kontak.</li>
                      <li><strong>Manajemen Informasi</strong>: Buat, edit kategori, dan publikasikan artikel portal utama.</li>
                      <li><strong>Manajemen Pengumuman</strong>: Buat pengumuman prioritas staf dengan berkas lampiran.</li>
                      <li><strong>Manajemen Timeline</strong>: Kelola peta jalan perusahaan dari tahap kickoff hingga selesai.</li>
                      <li><strong>Manajemen Dokumen File</strong>: Direktori file arsip administrasi & teknis yang dilengkapi folder kategori file.</li>
                      <li><strong>Manajemen Alur Pendaftaran</strong>: Konfigurasikan alur pendaftaran berurutan untuk calon mitra.</li>
                    </ul>
                  </div>
                </div>

                 {/* Right Column: Brief logs */}
                <div className="card-surface p-6 bg-white space-y-4 h-fit text-left">
                  <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                    <span>Log Aktivitas Singkat</span>
                  </h3>
                  <div className="space-y-3">
                    {getCombinedActivities().length > 0 ? (
                      getCombinedActivities().map((log, idx) => (
                        <div key={idx} className="p-3 bg-dark-base rounded-xl border border-dark-border text-[11px] leading-relaxed">
                          <span className="block font-bold text-text-primary">{log.text}</span>
                          <span className="text-text-muted">{new Date(log.time).toLocaleString("id-ID")}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-text-muted text-[11px] py-4 text-center">Belum ada aktivitas log terbaru.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) ) : activeTab === "CMS Halaman Utama" ? (
            <CmsLandingPage role={role} showToast={showToast} />
          ) : role === "super_admin" ? (
            /* Render active tab for Super Admin */
            <div className="card-surface p-6 md:p-8 bg-white min-h-[60vh] animate-fade-in">
              {activeTab === "Kelola Pengguna" && renderComingSoon("Kelola Pengguna")}
              {activeTab === "Profil Perusahaan" && renderComingSoon("Profil Perusahaan")}
              {activeTab === "Informasi Perusahaan" && <InformationManagement showToast={showToast} />}
              {activeTab === "Pengumuman Staf" && <AnnouncementsManagement showToast={showToast} />}
              {activeTab === "Timeline & Milestone" && <TimelineManagement showToast={showToast} />}
              {activeTab === "Dokumen & File" && <DocumentManagement showToast={showToast} />}
              {activeTab === "Kategori Dokumen" && renderComingSoon("Kategori Dokumen")}
            </div>
          ) : role === "admin" || role === "editor" ? (
            /* Render active tab for Admin and Editor */
            <div className="card-surface p-6 md:p-8 bg-white min-h-[60vh] animate-fade-in">
              {activeTab === "Profil Perusahaan" && renderComingSoon("Profil Perusahaan")}
              {activeTab === "Manajemen Informasi" && <InformationManagement showToast={showToast} />}
              {activeTab === "Manajemen Pengumuman" && <AnnouncementsManagement showToast={showToast} />}
              {activeTab === "Manajemen Timeline" && <TimelineManagement showToast={showToast} />}
              {activeTab === "Manajemen Dokumen File" && <DocumentManagement showToast={showToast} />}
              {activeTab === "Manajemen Kategori File" && renderComingSoon("Manajemen Kategori File")}
              {activeTab === "Manajemen Alur Pendaftaran" && <RegistrationFlowManagement showToast={showToast} />}
              {activeTab === "Akun Saya" && <MyAccount showToast={showToast} onLogout={handleLogout} />}
            </div>
          ) : role === "operator" ? (
            /* Render active tab for Operator (Read Only for all views) */
            <div className="card-surface p-6 md:p-8 bg-white min-h-[60vh] animate-fade-in">
              {activeTab === "Lihat Informasi" && <InformationManagement showToast={showToast} readOnly={true} />}
              {activeTab === "Manajemen Pengumuman" && <AnnouncementsManagement showToast={showToast} readOnly={true} />}
              {activeTab === "Manajemen Timeline" && <TimelineManagement showToast={showToast} readOnly={true} />}
              {activeTab === "Manajemen Dokumen File" && <DocumentManagement showToast={showToast} readOnly={true} />}
              {activeTab === "Manajemen Alur Pendaftaran" && <RegistrationFlowManagement showToast={showToast} readOnly={true} />}
            </div>
          ) : (
            /* Fallback Placeholders for Other Roles (Operator, Editor) */
            <div className="card-surface p-6 md:p-8 bg-white min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                <RoleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">
                  Modul {activeTab} — Portal {roleBadge.label}
                </h3>
                <p className="text-text-secondary text-xs mt-1.5 leading-relaxed max-w-sm">
                  Otoritas akses login aktif sebagai <strong>{roleBadge.label}</strong> ({email}). Modul data spesifik dan fungsionalitas detail untuk peran ini akan dikonfigurasi pada tahap berikutnya.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Keluar / Ganti Akun
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
