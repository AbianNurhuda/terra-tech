import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  AlertCircle,
  X,
  HelpCircle
} from "lucide-react"
import { authService } from "@/services/api.service"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotModal, setShowForgotModal] = useState(false)

  const performLogin = async (loginEmail, loginPassword) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await authService.login(loginEmail, loginPassword)
      const token = res.data?.token || res.data?.access_token || res.data?.api_token
      if (res.success && token) {
        localStorage.setItem("api_token", token)

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
          setError(res.message || "Alamat email atau kata sandi yang Anda masukkan salah.")
        }
      }
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Silakan isi alamat email dan kata sandi Anda.")
      return
    }

    performLogin(email.trim(), password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-dark-base selection:bg-accent-cyan selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/6 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div
        className="absolute bottom-1/4 right-1/6 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* Left Side: Brand Showcase & Value Propositions */}
        <div className="lg:col-span-6 space-y-8 animate-fade-up">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent-cyan bg-white/60 hover:bg-white border border-dark-border px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Logo and Brand Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_8px_25px_rgba(37,99,235,0.25)]">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-text-primary block leading-none">
                  Terra<span className="text-accent-cyan">Tech</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-cyan mt-1 block">
                  Enterprise Management Portal
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight leading-tight pt-2">
              Akses Terpusat Pengelolaan <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Ekosistem Digital</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Selamat datang di portal administrasi internal Terra Tech. Masuk dengan akun resmi Anda untuk mengelola konten, layanan, portofolio, dan alur pendaftaran.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-dark-border/80 shadow-sm transition-all hover:border-accent-cyan/40">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-accent-cyan shrink-0">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-text-primary">Keamanan Standar Enterprise</h2>
                <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  Otentikasi terenkripsi JWT dengan proteksi sesi dan kontrol akses multi-level.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-dark-border/80 shadow-sm transition-all hover:border-accent-cyan/40">
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-accent-purple shrink-0">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-text-primary">Sinkronisasi Real-Time</h2>
                <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  Semua perubahan konten dan publikasi langsung terintegrasi dengan REST API v1.
                </p>
              </div>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted pt-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>API Server Online & Stabil • <strong className="text-text-secondary">v1.4.0</strong></span>
          </div>
        </div>

        {/* Right Side: Sleek Login Form Card */}
        <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="bg-white/95 backdrop-blur-2xl border border-dark-border p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.08)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan" />
            
            <div className="mb-7">
              <span className="px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                Otentikasi Pengguna
              </span>
              <h2 className="text-2xl font-bold text-text-primary font-display">
                Masuk ke Dashboard
              </h2>
              <p className="text-text-muted text-xs mt-1">
                Masukkan alamat email dan kata sandi akun staf Anda.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block" htmlFor="email">
                  Alamat Email Resmi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="nama@terratech.test"
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-dark-border bg-dark-base/50 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan focus:bg-white focus:ring-2 focus:ring-accent-cyan/10 transition-all disabled:opacity-60 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary block" htmlFor="password">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-accent-cyan hover:underline font-semibold"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-dark-border bg-dark-base/50 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-cyan focus:bg-white focus:ring-2 focus:ring-accent-cyan/10 transition-all disabled:opacity-60 font-medium"
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-0.5">
                <input
                  id="remember"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-3.5 w-3.5 rounded border-dark-border text-accent-cyan focus:ring-accent-cyan/20 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-text-secondary select-none cursor-pointer">
                  Ingat sesi login di perangkat ini
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-accent-purple hover:from-accent-cyan/90 hover:to-accent-purple/90 text-white font-bold rounded-xl py-3 px-4 shadow-[0_4px_18px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none text-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Confidentiality Notice */}
            <div className="mt-8 pt-5 border-t border-dark-border text-center">
              <p className="text-[11px] text-text-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Portal tertutup. Segala aktivitas login dicatat dan diawasi.</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-dark-border shadow-2xl p-6 text-left space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-accent-cyan">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-text-primary font-display">Bantuan Lupa Kata Sandi</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-dark-base transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Untuk alasan keamanan portal perusahaan, reset kata sandi staf hanya dapat dilakukan oleh **Super Administrator**.
            </p>
            <div className="p-3.5 rounded-xl bg-dark-base border border-dark-border text-xs space-y-1.5">
              <span className="block font-bold text-text-primary">Hubungi Tim IT Support / Super Admin:</span>
              <span className="block text-text-muted">Email: <strong className="text-accent-cyan">superadmin@terratech.test</strong></span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
