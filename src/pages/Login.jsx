import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, Shield, UserCheck, Radio, FileEdit, AlertCircle } from "lucide-react"
import { authService } from "@/services/api.service"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeRole, setActiveRole] = useState(null)

  const roles = [
    {
      id: "super_admin",
      title: "Super Admin",
      email: "superadmin@terratech.test",
      password: "Password123!",
      icon: Shield,
      color: "from-blue-600 to-indigo-600",
      lightColor: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
      description: "Akses penuh sistem, konfigurasi, & log",
    },
    {
      id: "admin",
      title: "Admin",
      email: "admin@terratech.com",
      password: "admin123",
      icon: UserCheck,
      color: "from-emerald-500 to-teal-600",
      lightColor: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300",
      description: "Kelola layanan, portofolio, & statistik",
    },
    {
      id: "operator",
      title: "Operator",
      email: "operator@terratech.com",
      password: "operator123",
      icon: Radio,
      color: "from-amber-500 to-orange-600",
      lightColor: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300",
      description: "Respon pesan kontak & antrean chat",
    },
    {
      id: "editor",
      title: "Editor",
      email: "editor@terratech.com",
      password: "editor123",
      icon: FileEdit,
      color: "from-pink-500 to-rose-600",
      lightColor: "bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300",
      description: "Edit konten, artikel, & media galeri",
    },
  ]

  const performLogin = async (loginEmail, loginPassword) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await authService.login(loginEmail, loginPassword)
      if (res.success && res.data && res.data.token) {
        localStorage.setItem("api_token", res.data.token)
        
        const profileRes = await authService.refreshCurrentUser()
        if (profileRes.success) {
          setIsLoading(false)
          navigate("/dashboard")
        } else {
          setIsLoading(false)
          setError(profileRes.error || "Gagal mensinkronisasikan profil akun dari server.")
        }
      } else {
        setIsLoading(false)
        if (res.errors && res.errors.email) {
          setError(res.errors.email[0])
        } else if (res.errors && res.errors.password) {
          setError(res.errors.password[0])
        } else {
          setError(res.message || "Email atau password salah.")
        }
      }
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setError("Gagal menghubungi server. Silakan periksa koneksi Anda.")
    }
  }

  const handleQuickLogin = (role) => {
    setError("")
    setActiveRole(role.id)
    setEmail(role.email)
    setPassword(role.password)
    performLogin(role.email, role.password)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Silakan isi semua bidang input.")
      return
    }

    performLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 relative overflow-hidden bg-dark-base">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Brand info & Quick Login Tiles */}
        <div className="md:col-span-6 space-y-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.25)]">
              <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
              Terra<span className="text-accent-cyan">Tech</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-text-primary font-display tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-text-secondary text-sm">
              Silakan login untuk mengelola portal administrasi TerraTech. Pilih salah satu **Akun Demo** untuk login cepat tanpa mengisi form secara manual.
            </p>
          </div>

          {/* Quick Login Tiles Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {roles.map((role) => {
              const IconComponent = role.icon
              const isCurrentActive = activeRole === role.id && isLoading
              return (
                <button
                  key={role.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(role)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${role.lightColor} group relative overflow-hidden`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="p-2 rounded-xl bg-white border border-dark-border shadow-sm group-hover:scale-105 transition-transform">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 text-text-muted" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-text-primary mb-1">
                    {role.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">
                    {role.description}
                  </p>
                  
                  {isCurrentActive && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="md:col-span-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="card-surface bg-white/80 backdrop-blur-xl border border-dark-border p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan" />
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary font-display">
                Portal Login Staf
              </h2>
              <p className="text-text-muted text-xs mt-1">
                Masukkan kredensial Anda untuk masuk ke sistem.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="nama@terratech.com"
                    disabled={isLoading}
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-dark-border bg-white text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/10 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary" htmlFor="password">
                    Password / Kata Sandi
                  </label>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-accent-cyan hover:underline font-semibold">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10.5 pr-11 py-3 rounded-xl border border-dark-border bg-white text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/10 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-dark-border text-accent-cyan focus:ring-accent-cyan/20"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-text-secondary select-none">
                  Ingat perangkat ini selama 30 hari
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent-cyan text-white font-bold rounded-xl py-3 px-4 shadow-[0_4px_18px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
