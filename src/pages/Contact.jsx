import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Briefcase,
  User,
  Building2,
  MessageSquare,
  Loader2,
  Sparkles,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CallToAction } from "@/components/sections/CallToAction"
import { servicesData } from "@/components/sections/Services"
import { cn } from "@/utils/cn"

const contactItems = [
  {
    label: "Email",
    value: "hello@terratech.id",
    valueSecondary: "sales@terratech.id (untuk penawaran)",
    href: "mailto:hello@terratech.id",
    icon: Mail,
    gradient: "from-accent-cyan/20 to-accent-cyan/5",
  },
  {
    label: "Telepon & WhatsApp",
    value: "+62 812 3456 7890",
    valueSecondary: "Senin–Jumat, 08.00–20.00 WIB",
    href: "tel:+6281234567890",
    icon: Phone,
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    label: "Kantor Pusat",
    value: "Jl. Jend. Sudirman Kav. 52-53, SCBD",
    valueSecondary: "Jakarta Selatan, DKI Jakarta 12190, Indonesia",
    href: "https://maps.google.com/?q=SCBD+Jakarta",
    target: "_blank",
    icon: MapPin,
    gradient: "from-accent-purple/20 to-accent-purple/5",
  },
  {
    label: "Jam Kerja",
    value: "Senin – Jumat: 08.00 – 20.00 WIB",
    valueSecondary: "Sabtu: 09.00 – 15.00 WIB | Minggu: Libur",
    href: "#",
    icon: Clock,
    gradient: "from-amber-500/20 to-amber-500/5",
  },
]

const packagesList = [
  { id: "basic", label: "Paket Basic" },
  { id: "pro", label: "Paket Pro" },
  { id: "enterprise", label: "Paket Enterprise" },
  { id: "custom", label: "Kustom (Saya akan jelaskan di pesan)" },
]

const projectTypes = [
  "Website Company Profile",
  "E-Commerce / Marketplace",
  "Mobile App (Android/iOS)",
  "UI/UX Design & Design System",
  "SaaS / Dashboard / Admin Panel",
  "Cloud Migration & DevOps",
  "Konsultasi IT & Audit",
  "Lainnya",
]

export function ContactPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const preSelectedPackage = params.get("paket") || ""
  const preSelectedService = params.get("layanan") || ""

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    service: preSelectedService,
    package: preSelectedPackage,
    budget: "",
    timeline: "",
    message: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({ type: "", title: "", message: "", show: false })

  useEffect(() => {
    const hash = location.hash
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [location.hash])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = "Nama lengkap harus diisi"
    else if (form.name.trim().length < 2) errors.name = "Nama terlalu pendek"

    if (!form.email.trim()) errors.email = "Email harus diisi"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Format email tidak valid"

    if (!form.message.trim()) errors.message = "Pesan harus diisi"
    else if (form.message.trim().length < 10) errors.message = "Pesan minimal 10 karakter"

    if (form.phone && !/^[0-9+\-\s()]{8,}$/.test(form.phone)) {
      errors.phone = "Format nomor telepon tidak valid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      setNotification({
        type: "error",
        title: "Periksa kembali formulir",
        message: "Beberapa field masih kosong atau tidak valid. Silakan periksa kembali.",
        show: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1600))

      if (Math.random() > 0.05) {
        setNotification({
          type: "success",
          title: "Pesan berhasil dikirim! 🎉",
          message: `Terima kasih ${form.name.split(" ")[0] || "kak"}! Tim kami akan merespons pesan Anda dalam maksimal 1x24 jam melalui email atau WhatsApp.`,
          show: true,
        })
        setForm({
          name: "",
          email: "",
          company: "",
          phone: "",
          projectType: "",
          service: "",
          package: "",
          budget: "",
          timeline: "",
          message: "",
        })
      } else {
        throw new Error("Simulated network error")
      }
    } catch {
      setNotification({
        type: "error",
        title: "Gagal mengirim pesan",
        message: "Terjadi kendala saat mengirim pesan. Silakan coba beberapa saat lagi, atau hubungi kami langsung via WhatsApp/email.",
        show: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  return (
    <main className="relative pt-28">
      <section className="container pt-8 pb-12">
        <div className="max-w-3xl">
          <span className="section-label animate-fade-up">Kontak Kami</span>
          <h1
            className="section-title !mb-5 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Mari Diskusi <span className="glow-text">Kebutuhan</span> Proyek Anda
          </h1>
          <p
            className="section-subtitle animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            Ceritakan tujuan bisnis, timeline, dan fitur utama yang dibutuhkan. Tim Terra Tech akan merespons dalam
            maksimal 1x24 jam dengan proposal & estimasi yang transparan.
          </p>
        </div>
      </section>

      <section id="info" className="container pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactItems.map((item, i) => {
            const Icon = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.target || "_self"}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={cn(
                  "group relative card-surface p-6 overflow-hidden hover:-translate-y-1 hover:border-accent-cyan/40 transition-all duration-500",
                  "animate-fade-up opacity-0"
                )}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div
                  className={cn(
                    "absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl pointer-events-none group-hover:opacity-100 transition-opacity",
                    item.gradient
                  )}
                />
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center mb-4 group-hover:border-accent-cyan/40 transition-colors shadow-sm">
                    <Icon className="h-6 w-6 text-accent-cyan" strokeWidth={2.25} />
                  </div>
                  <span className="block text-xs uppercase tracking-wider text-text-muted mb-2">
                    {item.label}
                  </span>
                  <span className="block text-sm md:text-base text-text-primary font-semibold mb-1 leading-snug">
                    {item.value}
                  </span>
                  {item.valueSecondary && (
                    <span className="block text-xs text-text-muted leading-relaxed">
                      {item.valueSecondary}
                    </span>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                    Hubungi
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      <section id="form" className="container pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-7 items-start">
          <div className="lg:col-span-3 space-y-6">
            <Card className="overflow-hidden border-dark-border/80">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(0,229,255,0.1),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.08),_transparent_55%)] pointer-events-none" />
              <CardHeader className="pb-4 border-b border-dark-border/80 bg-dark-surface/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">Formulir Konsultasi</CardTitle>
                    <p className="text-sm text-text-secondary">
                      Isi data di bawah ini. Semua field dengan <span className="text-accent-cyan font-semibold">*</span> wajib diisi.
                    </p>
                  </div>
                  <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs font-semibold text-accent-cyan">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Gratis & Tanpa Kewajiban
                  </span>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <User className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Nama Lengkap <span className="text-accent-cyan">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all",
                        formErrors.name
                          ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60"
                          : "border-dark-border hover:border-dark-border/90"
                      )}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Mail className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Email Aktif <span className="text-accent-cyan">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="budi@perusahaan.com"
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all",
                        formErrors.email
                          ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60"
                          : "border-dark-border hover:border-dark-border/90"
                      )}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Building2 className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Perusahaan / Instansi
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={form.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Opsional: Nama perusahaan Anda"
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all border-dark-border hover:border-dark-border/90"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Phone className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Nomor WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+62 8xx xxxx xxxx"
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all",
                        formErrors.phone
                          ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60"
                          : "border-dark-border hover:border-dark-border/90"
                      )}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="service" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Briefcase className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Layanan yang Dibutuhkan
                    </label>
                    <select
                      id="service"
                      value={form.service}
                      onChange={(e) => handleChange("service", e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all border-dark-border hover:border-dark-border/90",
                        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2300e5ff%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                      )}
                    >
                      <option value="">-- Pilih layanan (opsional) --</option>
                      {servicesData.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="package" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Sparkles className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Paket Harga
                    </label>
                    <select
                      id="package"
                      value={form.package}
                      onChange={(e) => handleChange("package", e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all border-dark-border hover:border-dark-border/90",
                        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2300e5ff%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                      )}
                    >
                      <option value="">-- Pilih paket (opsional) --</option>
                      {packagesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="projectType" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <MessageSquare className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Jenis Proyek
                    </label>
                    <select
                      id="projectType"
                      value={form.projectType}
                      onChange={(e) => handleChange("projectType", e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all border-dark-border hover:border-dark-border/90",
                        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2300e5ff%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                      )}
                    >
                      <option value="">-- Pilih jenis proyek --</option>
                      {projectTypes.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timeline" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Calendar className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                      Target Timeline
                    </label>
                    <select
                      id="timeline"
                      value={form.timeline}
                      onChange={(e) => handleChange("timeline", e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary",
                        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all border-dark-border hover:border-dark-border/90",
                        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2300e5ff%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10"
                      )}
                    >
                      <option value="">-- Tentukan target waktu --</option>
                      <option value="urgent">Urgent ({'<'} 1 bulan)</option>
                      <option value="1-2">1 – 2 bulan</option>
                      <option value="3-4">3 – 4 bulan</option>
                      <option value="5-6">5 – 6 bulan</option>
                      <option value="longterm">Jangka panjang ({'>'}6 bulan)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                    <MessageCircle className="h-4 w-4 text-accent-cyan" strokeWidth={2.25} />
                    Ceritakan Detail Proyek <span className="text-accent-cyan">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder={`Contoh: "Kami butuh website company profile untuk startup fintech, dengan fitur blog, karir, dan formulir kontak. Desain modern tema gelap, target launch 2 bulan lagi. Budget sekitar 30-50jt."`}
                    className={cn(
                      "w-full resize-none rounded-xl border bg-dark-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 leading-relaxed",
                      "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/60 transition-all",
                      formErrors.message
                        ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60"
                        : "border-dark-border hover:border-dark-border/90"
                    )}
                  />
                  <div className="flex items-center justify-between">
                    {formErrors.message ? (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.message}
                      </p>
                    ) : (
                      <span className="text-xs text-text-muted">
                        Sertakan tujuan, target user, fitur utama, dan (jika ada) budget agar kami bisa merespons lebih cepat.
                      </span>
                    )}
                    <span className="text-xs text-text-muted shrink-0 ml-4">
                      {form.message.length} karakter
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[220px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                        Mengirim Pesan...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" strokeWidth={2.25} />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Tim on-call • Rata-rata respons {'<'} 2 jam di jam kerja
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6 sticky top-28">
            <Card className="overflow-hidden border-dark-border/80">
              <div className="relative h-60 md:h-72 overflow-hidden border-b border-dark-border/80">
                <iframe
                  title="Lokasi Kantor Terra Tech"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.292171425239!2d106.8059733759535!3d-6.226641160950632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3f3c27e0377%3A0x4030bfbca7e69a0!2sSCBD%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1719999999999!5m2!1sid!2sid"
                  className="w-full h-full border-0 grayscale contrast-125 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-xl bg-dark-surface/90 backdrop-blur border border-dark-border px-4 py-2 shadow-lg">
                  <div className="relative">
                    <MapPin className="h-5 w-5 text-accent-cyan fill-accent-cyan/20" strokeWidth={2.25} />
                    <span className="absolute inset-0 rounded-full bg-accent-cyan/30 animate-ping" />
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-text-muted">Lokasi</span>
                    <span className="block text-sm font-semibold text-text-primary">Terra Tech HQ</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                    Kontak Langsung (Jalur Cepat)
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Terra%20Tech%2C%20saya%20ingin%20berkonsultasi%20tentang%20proyek%20digital"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full">
                        <MessageCircle className="h-5 w-5" strokeWidth={2.25} />
                        Chat WhatsApp (Prioritas)
                      </Button>
                    </a>
                    <a
                      href="mailto:hello@terratech.id?subject=Konsultasi%20Proyek%20Baru"
                      className="block"
                    >
                      <Button variant="secondary" className="w-full">
                        <Mail className="h-5 w-5" strokeWidth={2.25} />
                        Email Kami
                      </Button>
                    </a>
                    <a
                      href="tel:+6281234567890"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <Phone className="h-5 w-5" strokeWidth={2.25} />
                        Telepon Langsung
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5 p-5">
                  <h4 className="text-sm font-semibold text-accent-cyan mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" strokeWidth={2.25} />
                    Apa yang terjadi setelah submit?
                  </h4>
                  <ol className="space-y-2.5 text-sm text-text-secondary">
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-[11px] font-bold text-accent-cyan">1</span>
                      <span>Tim kami akan membaca brief Anda dalam 1-2 jam (jam kerja).</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-[11px] font-bold text-accent-cyan">2</span>
                      <span>Anda akan menerima email/WhatsApp berisi beberapa pertanyaan klarifikasi (jika diperlukan).</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-[11px] font-bold text-accent-cyan">3</span>
                      <span>Dalam maksimal 2 hari kerja, kami kirim proposal + estimasi harga + timeline detail.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-[11px] font-bold text-accent-cyan">4</span>
                      <span>Kickoff meeting via Google Meet (gratis) untuk menyelaraskan ekspektasi sebelum mulai kerja.</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {notification.show && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-dark-base/70 backdrop-blur-md"
            onClick={closeNotification}
          />
          <div
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl animate-fade-up",
              notification.type === "success"
                ? "bg-dark-surface border-emerald-500/40"
                : "bg-dark-surface border-red-500/40"
            )}
            style={{ animationDelay: "60ms" }}
          >
            {notification.type === "success" ? (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-accent-cyan to-emerald-400" />
            ) : (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
            )}

            <button
              onClick={closeNotification}
              className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-dark-base/60 border border-dark-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-dark-border/90 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4.5 w-4.5" strokeWidth={2.25} />
            </button>

            <div className="p-7 md:p-8 text-center">
              <div
                className={cn(
                  "mx-auto mb-5 h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center",
                  notification.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/40"
                    : "bg-red-500/15 border border-red-500/40"
                )}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" strokeWidth={2.25} />
                ) : (
                  <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-red-400" strokeWidth={2.25} />
                )}
              </div>

              <h3 className="text-xl md:text-2xl font-bold font-display text-text-primary mb-3">
                {notification.title}
              </h3>
              <p className="text-sm md:text-[15px] text-text-secondary leading-relaxed mb-6">
                {notification.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={closeNotification}
                  variant={notification.type === "success" ? "default" : "secondary"}
                  className={notification.type === "error" ? "sm:col-span-2" : ""}
                >
                  {notification.type === "success" ? "Mengerti, Terima kasih!" : "Tutup"}
                </Button>
                {notification.type === "success" && (
                  <Link
                    to="/portofolio"
                    onClick={(e) => {
                      e.preventDefault()
                      closeNotification()
                      setTimeout(() => navigate("/portofolio"), 150)
                    }}
                  >
                    <Button variant="secondary" className="w-full">
                      Lihat Portofolio
                      <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CallToAction />
    </main>
  )
}
