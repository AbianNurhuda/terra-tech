import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  Edit2,
  Key,
  Trash2,
  X,
  AlertCircle,
  Users,
  Shield,
  UserCheck,
  Radio,
  FileEdit,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { userService } from "@/services/api.service"

export default function UsersManagement({ showToast, readOnly = false }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Filter
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor",
    password: "",
    status: "Active"
  })
  const [newPassword, setNewPassword] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [modalGeneralError, setModalGeneralError] = useState("")

  // Logged-in user context
  const currentUserEmail = localStorage.getItem("userEmail") || ""
  const currentUserRole = localStorage.getItem("userRole") || ""

  // Fetch Users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await userService.getUsers({
        search: search.trim() || undefined,
        role: filterRole !== "all" ? filterRole : undefined,
        page: currentPage
      })

      if (res.success) {
        const rawData = res.data
        let userList = []
        if (Array.isArray(rawData)) {
          userList = rawData
          setTotalItems(rawData.length)
          setTotalPages(1)
        } else if (rawData && Array.isArray(rawData.data)) {
          userList = rawData.data
          setCurrentPage(rawData.current_page || 1)
          setTotalPages(rawData.last_page || 1)
          setTotalItems(rawData.total || rawData.data.length)
        } else if (rawData && typeof rawData === "object") {
          userList = rawData.users || []
          setTotalItems(userList.length)
          setTotalPages(1)
        }
        setUsers(userList)
      } else {
        if (res.status === 404) {
          setError("Endpoint data pengguna tidak ditemukan. Silakan hubungi administrator/backend developer.")
        } else if (res.status === 401) {
          setError("Sesi Anda telah berakhir. Silakan login kembali.")
        } else if (res.status === 403) {
          setError("Anda tidak memiliki izin (otorisasi) untuk mengakses data pengguna.")
        } else if (res.status === 503 || res.status === 500) {
          setError("Server backend sedang mengalami kendala atau tidak dapat dihubungi. Silakan coba beberapa saat lagi.")
        } else {
          setError(res.message || "Gagal memuat data pengguna dari server.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("Tidak dapat terhubung ke server backend. Periksa koneksi atau konfigurasi API.")
    } finally {
      setLoading(false)
    }
  }, [search, filterRole, currentPage])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Helper for Role UI styling
  const getRoleBadge = (roleKey) => {
    switch (roleKey?.toLowerCase()) {
      case "super_admin":
      case "super admin":
        return { label: "Super Admin", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Shield }
      case "admin":
      case "administrator":
        return { label: "Administrator", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: UserCheck }
      case "operator":
        return { label: "Operator Staf", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Radio }
      case "editor":
        return { label: "Editor Konten", color: "bg-pink-50 text-pink-700 border-pink-200", icon: FileEdit }
      default:
        return { label: roleKey || "User", color: "bg-gray-50 text-gray-700 border-gray-200", icon: Users }
    }
  }

  // Create User
  const handleAdd = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setModalGeneralError("")

    // Local validation
    const errs = {}
    if (!formData.name.trim()) errs.name = "Nama lengkap wajib diisi."
    if (!formData.email.trim()) errs.email = "Alamat email wajib diisi."
    if (!formData.password) errs.password = "Kata sandi wajib diisi (minimal 6 karakter)."
    else if (formData.password.length < 6) errs.password = "Kata sandi minimal 6 karakter."

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await userService.createUser(formData)
      if (res.success) {
        setIsAddOpen(false)
        setFormData({ name: "", email: "", role: "editor", password: "", status: "Active" })
        showToast("Pengguna baru berhasil ditambahkan!", "success")
        fetchUsers()
      } else {
        if (res.errors && typeof res.errors === "object" && Object.keys(res.errors).length > 0) {
          const apiErrs = {}
          Object.keys(res.errors).forEach((key) => {
            apiErrs[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          })
          setFormErrors(apiErrs)
        }
        if (res.status === 404) {
          setModalGeneralError("Endpoint tambah pengguna tidak ditemukan pada server API.")
        } else {
          setModalGeneralError(res.message || "Gagal menambahkan pengguna baru.")
        }
      }
    } catch (err) {
      console.error(err)
      setModalGeneralError("Terjadi kendala jaringan saat menghubungi server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit User
  const handleEdit = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setModalGeneralError("")

    const errs = {}
    if (!formData.name.trim()) errs.name = "Nama lengkap wajib diisi."
    if (!formData.email.trim()) errs.email = "Alamat email wajib diisi."

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      }
      const res = await userService.updateUser(selectedUser.id, payload)
      if (res.success) {
        setIsEditOpen(false)
        showToast("Data pengguna berhasil diperbarui!", "success")
        fetchUsers()
      } else {
        if (res.errors && typeof res.errors === "object") {
          const apiErrs = {}
          Object.keys(res.errors).forEach((key) => {
            apiErrs[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          })
          setFormErrors(apiErrs)
        }
        if (res.status === 404) {
          setModalGeneralError("Endpoint perbarui pengguna tidak ditemukan pada server API.")
        } else {
          setModalGeneralError(res.message || "Gagal memperbarui data pengguna.")
        }
      }
    } catch (err) {
      console.error(err)
      setModalGeneralError("Terjadi kendala jaringan saat menghubungi server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setModalGeneralError("")

    if (!newPassword || newPassword.length < 6) {
      setFormErrors({ password: "Kata sandi baru minimal 6 karakter." })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await userService.changePassword(selectedUser.id, newPassword)
      if (res.success) {
        setIsPasswordOpen(false)
        setNewPassword("")
        showToast(`Kata sandi untuk ${selectedUser.name} berhasil diubah!`, "success")
      } else {
        if (res.status === 404) {
          setModalGeneralError("Endpoint ubah kata sandi tidak ditemukan pada server API.")
        } else {
          setModalGeneralError(res.message || "Gagal mengubah kata sandi.")
        }
      }
    } catch (err) {
      console.error(err)
      setModalGeneralError("Terjadi kendala jaringan saat menghubungi server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Status
  const toggleStatus = async (user) => {
    if (user.role === "super_admin") {
      showToast("Akun Super Admin tidak dapat dinonaktifkan!", "error")
      return
    }

    const newStatus = user.status === "Active" || user.status === "active" ? "Nonaktif" : "Active"
    try {
      const res = await userService.toggleUserStatus(user.id, newStatus)
      if (res.success) {
        showToast(`Status pengguna ${user.name} berhasil diubah ke ${newStatus}!`, "success")
        fetchUsers()
      } else {
        if (res.status === 404) {
          showToast("Endpoint ubah status pengguna tidak ditemukan pada server API.", "error")
        } else {
          showToast(res.message || "Gagal mengubah status pengguna.", "error")
        }
      }
    } catch (err) {
      console.error(err)
      showToast("Terjadi kendala jaringan saat menghubungi server.", "error")
    }
  }

  // Delete User
  const handleDelete = async () => {
    if (!selectedUser) return

    if (selectedUser.role === "super_admin") {
      showToast("Akun Super Admin terlindungi dan tidak dapat dihapus!", "error")
      setIsDeleteOpen(false)
      return
    }

    if (selectedUser.email === currentUserEmail) {
      showToast("Anda tidak dapat menghapus akun Anda sendiri!", "error")
      setIsDeleteOpen(false)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await userService.deleteUser(selectedUser.id)
      if (res.success) {
        setIsDeleteOpen(false)
        showToast(`Akun ${selectedUser.name} berhasil dihapus.`, "success")
        fetchUsers()
      } else {
        if (res.status === 404) {
          showToast("Endpoint hapus pengguna tidak ditemukan pada server API.", "error")
        } else {
          showToast(res.message || "Gagal menghapus pengguna.", "error")
        }
      }
    } catch (err) {
      console.error(err)
      showToast("Terjadi kendala jaringan saat menghubungi server.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || user.roles?.[0] || "editor",
      status: user.status || "Active"
    })
    setFormErrors({})
    setModalGeneralError("")
    setIsEditOpen(true)
  }

  const openPasswordModal = (user) => {
    setSelectedUser(user)
    setNewPassword("")
    setFormErrors({})
    setModalGeneralError("")
    setIsPasswordOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2.5">
            <Users className="h-5 w-5 text-accent-cyan" />
            <span>Kelola Pengguna CMS</span>
          </h2>
          <p className="text-text-muted text-xs mt-1">
            Kelola akun staf, hak akses peran sistem (Role & Permission), dan status keaktifan akun.
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={() => {
              setFormData({ name: "", email: "", role: "editor", password: "", status: "Active" })
              setFormErrors({})
              setModalGeneralError("")
              setIsAddOpen(true)
            }}
            className="px-4 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3.5 py-2 text-xs rounded-xl border border-dark-border bg-dark-base text-text-secondary focus:outline-none focus:border-accent-cyan/60"
          >
            <option value="all">Semua Peran (Role)</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Administrator</option>
            <option value="operator">Operator Staf</option>
            <option value="editor">Editor Konten</option>
          </select>

          <button
            onClick={fetchUsers}
            disabled={loading}
            title="Muat ulang data"
            className="p-2 rounded-xl border border-dark-border bg-dark-base hover:bg-white text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent-cyan" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content / Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 card-surface bg-white p-8">
          <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-secondary font-bold animate-pulse">Memuat daftar pengguna dari server...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Gagal Mengambil Data Pengguna</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-md">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 card-surface p-6 bg-white">
          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">Tidak Ada Pengguna Ditemukan</h3>
            <p className="text-xs text-text-secondary mt-1">
              {search || filterRole !== "all"
                ? "Tidak ada hasil yang sesuai dengan kriteria pencarian Anda."
                : "Belum ada data pengguna yang terdaftar di database backend."}
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={() => {
                setFormData({ name: "", email: "", role: "editor", password: "", status: "Active" })
                setFormErrors({})
                setIsAddOpen(true)
              }}
              className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors"
            >
              Tambah Pengguna Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="card-surface bg-white border border-dark-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-border bg-dark-base/50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  {!readOnly && <th className="py-3.5 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-text-secondary">
                {users.map((u) => {
                  const roleBadge = getRoleBadge(u.role || u.roles?.[0])
                  const RoleIcon = roleBadge.icon
                  const isActive = u.status === "Active" || u.status === "active" || u.status === 1 || u.status === true
                  const isSelf = u.email === currentUserEmail
                  const isSuperAdmin = u.role === "super_admin" || u.roles?.[0] === "super_admin"

                  return (
                    <tr key={u.id} className="hover:bg-dark-base/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center font-bold text-accent-cyan font-display shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 text-[9px] font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-text-muted block mt-0.5">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${roleBadge.color}`}>
                          <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{roleBadge.label}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => !readOnly && toggleStatus(u)}
                          disabled={readOnly || isSuperAdmin}
                          title={isSuperAdmin ? "Status Super Admin tidak dapat diubah" : "Klik untuk mengubah status"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          } ${isSuperAdmin || readOnly ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span>{isActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted text-[11px]">
                        {u.created_at || u.createdAt
                          ? new Date(u.created_at || u.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </td>

                      {!readOnly && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openPasswordModal(u)}
                              title="Ubah Kata Sandi"
                              className="p-1.5 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Key className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(u)}
                              title="Edit Pengguna"
                              className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(u)}
                              disabled={isSuperAdmin || isSelf}
                              title={
                                isSuperAdmin
                                  ? "Super Admin tidak dapat dihapus"
                                  : isSelf
                                  ? "Tidak dapat menghapus akun sendiri"
                                  : "Hapus Pengguna"
                              }
                              className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-dark-border flex items-center justify-between text-xs text-text-muted">
              <span>
                Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({totalItems} total pengguna)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 border border-dark-border rounded-lg hover:bg-dark-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1.5 border border-dark-border rounded-lg hover:bg-dark-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Tambah User */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Plus className="h-4 w-4 text-accent-cyan" />
                <span>Tambah Pengguna Baru</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {modalGeneralError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalGeneralError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rian Prasetyo"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.name && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Alamat Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contoh@terratech.com"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.email ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.email && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.email}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Peran (Role) *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/60"
                  >
                    <option value="editor">Editor Konten</option>
                    <option value="operator">Operator Staf</option>
                    <option value="admin">Administrator</option>
                    {currentUserRole === "super_admin" && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/60"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kata Sandi Default *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.password ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.password && (
                  <span className="text-[11px] text-rose-500 font-semibold">{formErrors.password}</span>
                )}
              </div>

              <div className="pt-3 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Pengguna</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-accent-cyan" />
                <span>Edit Data Pengguna</span>
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {modalGeneralError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalGeneralError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.name && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Alamat Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.email ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.email && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.email}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Peran (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={selectedUser.role === "super_admin" && currentUserRole !== "super_admin"}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/60"
                  >
                    <option value="editor">Editor Konten</option>
                    <option value="operator">Operator Staf</option>
                    <option value="admin">Administrator</option>
                    {currentUserRole === "super_admin" && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={selectedUser.role === "super_admin"}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/60"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah Password */}
      {isPasswordOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" />
                <span>Ubah Kata Sandi: {selectedUser.name}</span>
              </h3>
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {modalGeneralError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalGeneralError}</span>
                </div>
              )}

              <p className="text-xs text-text-secondary leading-relaxed">
                Tetapkan kata sandi baru untuk akun <strong>{selectedUser.email}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kata Sandi Baru *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.password ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } focus:outline-none focus:border-accent-cyan/60`}
                />
                {formErrors.password && (
                  <span className="text-[11px] text-rose-500 font-semibold">{formErrors.password}</span>
                )}
              </div>

              <div className="pt-3 border-t border-dark-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Perbarui Kata Sandi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus User (Confirmation Dialog) */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-display font-bold text-sm text-text-primary">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>{selectedUser.name}</strong> ({selectedUser.email})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-dark-border text-text-secondary rounded-xl text-xs font-bold hover:bg-dark-base transition-colors flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Permanen</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
