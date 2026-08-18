import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Key, ToggleLeft, ToggleRight, Trash2, X, AlertCircle } from "lucide-react"

export default function UsersManagement({ showToast }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", role: "editor", password: "", status: "Active" })
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")

  const defaultUsers = [
    { id: 1, name: "Super Admin TerraTech", email: "superadmin@terratech.com", role: "super_admin", status: "Active", createdAt: "2026-08-01" },
    { id: 2, name: "Budi Santoso", email: "admin@terratech.com", role: "admin", status: "Active", createdAt: "2026-08-02" },
    { id: 3, name: "Dewi Lestari", email: "operator@terratech.com", role: "operator", status: "Active", createdAt: "2026-08-03" },
    { id: 4, name: "Rian Prasetyo", email: "editor@terratech.com", role: "editor", status: "Active", createdAt: "2026-08-04" },
    { id: 5, name: "Siti Rahma", email: "siti.rahma@terratech.com", role: "editor", status: "Nonaktif", createdAt: "2026-08-05" },
  ]

  useEffect(() => {
    const saved = localStorage.getItem("cms_users")
    if (saved) {
      setUsers(JSON.parse(saved))
    } else {
      setUsers(defaultUsers)
      localStorage.setItem("cms_users", JSON.stringify(defaultUsers))
    }
  }, [])

  const saveToStorage = (updatedList) => {
    setUsers(updatedList)
    localStorage.setItem("cms_users", JSON.stringify(updatedList))
  }

  // Handle Search & Filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesRole
  })

  // CRUD handlers
  const handleAdd = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.email || !formData.password) {
      setError("Semua field wajib diisi.")
      return
    }

    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setError("Email sudah digunakan oleh akun lain.")
      return
    }

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0]
    }

    const updated = [...users, newUser]
    saveToStorage(updated)
    setIsAddOpen(false)
    setFormData({ name: "", email: "", role: "editor", password: "", status: "Active" })
    showToast("User berhasil ditambahkan!", "success")
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.email) {
      setError("Nama dan Email wajib diisi.")
      return
    }

    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== selectedUser.id)) {
      setError("Email sudah digunakan oleh akun lain.")
      return
    }

    const updated = users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, name: formData.name, email: formData.email, role: formData.role, status: formData.status }
        : u
    )
    saveToStorage(updated)
    setIsEditOpen(false)
    showToast("Detail user berhasil diperbarui!", "success")
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }
    // In a real app we'd update password. For mock purposes:
    setIsPasswordOpen(false)
    setNewPassword("")
    showToast(`Password untuk ${selectedUser.name} berhasil diubah!`, "success")
  }

  const toggleStatus = (user) => {
    if (user.role === "super_admin") {
      showToast("Akun Super Admin tidak dapat dinonaktifkan!", "error")
      return
    }
    const newStatus = user.status === "Active" ? "Nonaktif" : "Active"
    const updated = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
    saveToStorage(updated)
    showToast(`User ${user.name} berhasil di-${newStatus === "Active" ? "aktifkan" : "nonaktifkan"}!`, "success")
  }

  const handleDelete = () => {
    if (selectedUser.role === "super_admin") {
      showToast("Akun Super Admin terlindungi dan tidak dapat dihapus!", "error")
      setIsDeleteOpen(false)
      return
    }
    const updated = users.filter(u => u.id !== selectedUser.id)
    saveToStorage(updated)
    setIsDeleteOpen(false)
    showToast(`Akun ${selectedUser.name} berhasil dihapus.`, "success")
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status })
    setError("")
    setIsEditOpen(true)
  }

  const openPasswordModal = (user) => {
    setSelectedUser(user)
    setNewPassword("")
    setError("")
    setIsPasswordOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin": return "Super Admin"
      case "admin": return "Admin"
      case "operator": return "Operator"
      case "editor": return "Editor"
      default: return role
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin": return "bg-blue-100 text-blue-800 border-blue-200"
      case "admin": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "operator": return "bg-amber-100 text-amber-800 border-amber-200"
      case "editor": return "bg-pink-100 text-pink-800 border-pink-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Add User Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Users CMS</h2>
          <p className="text-text-muted text-xs mt-0.5">Daftar, tambahkan, edit, dan nonaktifkan akses akun staf CMS.</p>
        </div>
        <button
          onClick={() => {
            setError("")
            setFormData({ name: "", email: "", role: "editor", password: "", status: "Active" })
            setIsAddOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Filters & Search controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base/50 placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/40 focus:ring-2 focus:ring-accent-cyan/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-text-secondary font-semibold">Filter Peran:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs rounded-xl border border-dark-border px-3 py-2 bg-white text-text-secondary focus:outline-none focus:border-accent-cyan/40"
          >
            <option value="all">Semua Peran</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="editor">Editor</option>
          </select>
        </div>
      </div>

      {/* Table listing users */}
      <div className="bg-white border border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-base/30 border-b border-dark-border text-text-secondary font-bold text-xs">
                <th className="py-4 px-6">Nama Pengguna</th>
                <th className="py-4 px-6">Alamat Email</th>
                <th className="py-4 px-6">Peran (Role)</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6">Tanggal Dibuat</th>
                <th className="py-4 px-6 text-center">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs text-text-secondary">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-base/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary">{user.name}</td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {user.status === "Active" ? "Active" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-4 px-6">{user.createdAt}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-dark-base rounded-lg transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          title="Ubah Password"
                          className="p-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(user)}
                          title={user.status === "Active" ? "Nonaktifkan" : "Aktifkan"}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.status === "Active" ? "text-emerald-600 hover:bg-emerald-50" : "text-text-muted hover:bg-dark-base"
                          }`}
                        >
                          {user.status === "Active" ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={user.role === "super_admin"}
                          title={user.role === "super_admin" ? "Terlindungi" : "Hapus User"}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.role === "super_admin" ? "text-text-muted/30 cursor-not-allowed" : "text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah User Baru */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Tambah User Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama staf"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Alamat Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@terratech.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Password Awal</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Hak Akses (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Awal</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
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
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Edit User: {selectedUser?.name}</h3>
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama staf"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Alamat Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled={selectedUser?.role === "super_admin"}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@terratech.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none disabled:opacity-60"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Peran (Role)</label>
                  <select
                    value={formData.role}
                    disabled={selectedUser?.role === "super_admin"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none disabled:opacity-60"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Status Akun</label>
                  <select
                    value={formData.status}
                    disabled={selectedUser?.role === "super_admin"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs bg-white focus:outline-none disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
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
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah Password */}
      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 bg-dark-base/50 border-b border-dark-border flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-text-primary">Ganti Password: {selectedUser?.name}</h3>
              <button onClick={() => setIsPasswordOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru minimal 6 karakter"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  className="px-4 py-2 border border-dark-border rounded-xl text-xs font-bold text-text-secondary hover:bg-dark-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600"
                >
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus User (Confirmation) */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-dark-border w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary">Konfirmasi Hapus Akun</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email})? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  )
}
