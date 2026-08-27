import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Lock, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authService } from "@/services/api.service"

export default function MyAccount({ showToast, onLogout }) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  // Password fields
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Modals / states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [errorProfile, setErrorProfile] = useState("")
  const [errorPassword, setErrorPassword] = useState("")

  useEffect(() => {
    setName(localStorage.getItem("userName") || "")
    setEmail(localStorage.getItem("userEmail") || "")
    const savedRole = localStorage.getItem("userRole") || ""
    setRole(savedRole === "super_admin" ? "Super Admin" : savedRole === "admin" ? "Administrator" : savedRole)
  }, [])

  // Handle Profile Update (Name & Email)
  const handleUpdateProfile = (e) => {
    e.preventDefault()
    setErrorProfile("")

    if (!name.trim() || !email.trim()) {
      setErrorProfile("Nama dan Email wajib diisi.")
      return
    }

    const currentEmail = localStorage.getItem("userEmail")
    
    // Update local storage session
    localStorage.setItem("userName", name.trim())
    localStorage.setItem("userEmail", email.trim())

    // Sync to cms_users list if exists
    const savedUsers = localStorage.getItem("cms_users")
    if (savedUsers) {
      const usersList = JSON.parse(savedUsers)
      const updatedList = usersList.map((u) => 
        u.email.toLowerCase() === currentEmail.toLowerCase()
          ? { ...u, name: name.trim(), email: email.trim() }
          : u
      )
      localStorage.setItem("cms_users", JSON.stringify(updatedList))
    }

    showToast("Profil akun berhasil diperbarui!", "success")
    
    // Small timeout to refresh dashboard header state
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrorPassword("")

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorPassword("Semua field kata sandi wajib diisi.")
      return
    }

    if (newPassword.length < 6) {
      setErrorPassword("Kata sandi baru minimal 6 karakter.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorPassword("Konfirmasi kata sandi baru tidak cocok.")
      return
    }

    try {
      const res = await authService.changePassword(oldPassword, newPassword, confirmPassword)

      if (!res.success) {
        if (res.status === 422) {
          // Validation error from backend
          if (res.errors && res.errors.current_password) {
            setErrorPassword(
              Array.isArray(res.errors.current_password)
                ? res.errors.current_password[0]
                : res.errors.current_password
            )
          } else if (res.errors && res.errors.password) {
            setErrorPassword(
              Array.isArray(res.errors.password)
                ? res.errors.password[0]
                : res.errors.password
            )
          } else {
            setErrorPassword(res.message || "Validasi gagal. Silakan periksa input Anda.")
          }
          return
        } else if (res.status === 429) {
          // Rate limit
          setErrorPassword("Terlalu banyak percobaan. Silakan coba lagi nanti.")
          return
        } else if (res.status === 401) {
          // Unauthorized - token expired or session invalid
          setErrorPassword("Sesi Anda telah berakhir. Silakan login kembali.")
          setTimeout(() => {
            navigate("/login")
          }, 1500)
          return
        } else {
          setErrorPassword(res.message || "Gagal mengubah kata sandi. Silakan coba lagi.")
          return
        }
      }

      // Success - clear form
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      showToast("Kata sandi berhasil diperbarui. Silakan login kembali.", "success")

      // Clear auth state and redirect to login
      // Backend has already revoked the token
      setTimeout(() => {
        localStorage.removeItem("api_token")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userName")
        navigate("/login")
      }, 1500)
    } catch (err) {
      console.error("Password change error:", err)
      setErrorPassword("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  // Handle Account Deletion
  const handleDeleteAccount = () => {
    const currentEmail = localStorage.getItem("userEmail")
    
    // Remove from users list
    const savedUsers = localStorage.getItem("cms_users")
    if (savedUsers) {
      const usersList = JSON.parse(savedUsers)
      const updatedList = usersList.filter(u => u.email.toLowerCase() !== currentEmail.toLowerCase())
      localStorage.setItem("cms_users", JSON.stringify(updatedList))
    }

    setIsDeleteOpen(false)
    showToast("Akun administrator Anda telah dihapus secara permanen.", "success")
    
    // Trigger logout redirection
    setTimeout(() => {
      onLogout()
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-text-primary">Akun Saya</h2>
        <p className="text-text-muted text-xs mt-0.5">Kelola informasi pribadi, ubah kredensial kata sandi keamanan, atau hapus akun admin Anda.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Form: Profile Details */}
        <div className="md:col-span-6 card-surface p-6 bg-white space-y-4">
          <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2 border-b border-dark-border pb-3">
            <User className="h-4.5 w-4.5 text-accent-cyan" />
            <span>Detail Informasi Akun</span>
          </h3>

          {errorProfile && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorProfile}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Nama Pengguna</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Hak Akses Peran (Role)</label>
              <input
                type="text"
                value={role}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-dark-border bg-dark-base/50 text-xs text-text-muted cursor-not-allowed font-semibold"
              />
            </div>

            <button
              type="submit"
              className="btn-primary py-2.5 px-4 text-xs font-bold rounded-xl w-full"
            >
              Simpan Perubahan Profil
            </button>
          </form>
        </div>

        {/* Right Form: Change Password & Danger Zone */}
        <div className="md:col-span-6 space-y-6">
          <div className="card-surface p-6 bg-white space-y-4">
            <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2 border-b border-dark-border pb-3">
              <Lock className="h-4.5 w-4.5 text-accent-cyan" />
              <span>Ubah Kata Sandi Keamanan</span>
            </h3>

            {errorPassword && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorPassword}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kata Sandi Lama</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    placeholder="Masukkan kata sandi lama Anda"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary py-2.5 px-4 text-xs font-bold rounded-xl w-full font-display"
              >
                Ganti Kata Sandi
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card-surface p-6 border-rose-200 bg-rose-50/20 space-y-4">
            <h3 className="font-display font-bold text-sm text-rose-600 flex items-center gap-2 border-b border-rose-100 pb-3">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Zona Bahaya (Danger Zone)</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Menghapus akun administrator Anda akan menghapus data akses login secara permanen dari server lokal. Anda tidak akan bisa login kembali menggunakan akun ini.
            </p>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
            >
              Hapus Akun Administrator
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white border border-dark-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto animate-glow-pulse">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm text-text-primary">Konfirmasi Hapus Akun</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun admin <strong>{name}</strong> ({email}) secara permanen? Sesi login Anda akan langsung dihentikan.
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
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 transition-all"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
