import { useState, useEffect, useCallback } from "react"
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Save,
  Upload,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Linkedin,
  Youtube
} from "lucide-react"
import { companyProfileService } from "@/services/api.service"

export default function CompanyProfileConfig({ showToast, readOnly = false }) {
  const [profile, setProfile] = useState({
    name: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    logo: "",
    favicon: ""
  })

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState({})

  // File uploads
  const [logoFile, setLogoFile] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [faviconPreview, setFaviconPreview] = useState("")

  // Fetch Company Profile from Backend API
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await companyProfileService.getProfile()
      if (res.success && res.data) {
        const d = res.data
        setProfile({
          name: d.name || d.company_name || "",
          tagline: d.tagline || d.slogan || "",
          description: d.description || "",
          email: d.email || "",
          phone: d.phone || d.telephone || "",
          address: d.address || "",
          website: d.website || "",
          facebook: d.facebook || d.social_facebook || "",
          instagram: d.instagram || d.social_instagram || "",
          linkedin: d.linkedin || d.social_linkedin || "",
          youtube: d.youtube || d.social_youtube || "",
          logo: d.logo || d.logo_url || "",
          favicon: d.favicon || d.favicon_url || ""
        })

        if (d.logo || d.logo_url) setLogoPreview(d.logo || d.logo_url)
        if (d.favicon || d.favicon_url) setFaviconPreview(d.favicon || d.favicon_url)
      } else if (!res.success) {
        if (res.status === 404) {
          setError("Endpoint profil perusahaan belum tersedia di API backend. Silakan hubungi administrator/backend developer.")
        } else if (res.status === 401) {
          setError("Sesi Anda telah berakhir. Silakan login kembali.")
        } else if (res.status === 403) {
          setError("Anda tidak memiliki izin (otorisasi) untuk mengakses konfigurasi profil perusahaan.")
        } else {
          setError(res.message || "Gagal mengambil data profil perusahaan dari server.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("Tidak dapat terhubung ke server backend. Periksa koneksi internet atau konfigurasi API.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Handle file input changes with validation
  const handleFileChange = (type, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      showToast("Gagal: Ukuran file maksimal adalah 2 MB.", "error")
      return
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/webp"
    ]

    if (!allowedTypes.includes(file.type)) {
      showToast("Gagal: Format file harus berupa PNG, JPG, SVG, WEBP, atau ICO.", "error")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    if (type === "logo") {
      setLogoFile(file)
      setLogoPreview(previewUrl)
      showToast("File logo siap diunggah!", "success")
    } else {
      setFaviconFile(file)
      setFaviconPreview(previewUrl)
      showToast("File favicon siap diunggah!", "success")
    }
  }

  // Submit Save/Update to API
  const handleSave = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setError("")

    // Form validation
    const errs = {}
    if (!profile.name.trim()) errs.name = "Nama perusahaan wajib diisi."
    if (!profile.email.trim()) errs.email = "Alamat email resmi wajib diisi."
    if (!profile.phone.trim()) errs.phone = "Nomor telepon wajib diisi."
    if (!profile.address.trim()) errs.address = "Alamat kantor wajib diisi."

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    setIsSaving(true)
    try {
      let payload
      if (logoFile || faviconFile) {
        const formData = new FormData()
        formData.append("name", profile.name)
        formData.append("tagline", profile.tagline || "")
        formData.append("description", profile.description || "")
        formData.append("email", profile.email)
        formData.append("phone", profile.phone)
        formData.append("address", profile.address)
        formData.append("website", profile.website || "")
        formData.append("facebook", profile.facebook || "")
        formData.append("instagram", profile.instagram || "")
        formData.append("linkedin", profile.linkedin || "")
        formData.append("youtube", profile.youtube || "")

        if (logoFile) formData.append("logo", logoFile)
        if (faviconFile) formData.append("favicon", faviconFile)
        payload = formData
      } else {
        payload = {
          name: profile.name,
          tagline: profile.tagline,
          description: profile.description,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          website: profile.website,
          facebook: profile.facebook,
          instagram: profile.instagram,
          linkedin: profile.linkedin,
          youtube: profile.youtube
        }
      }

      const res = await companyProfileService.updateProfile(payload)
      if (res.success) {
        showToast("Profil perusahaan berhasil diperbarui!", "success")
        // Reset staged files
        setLogoFile(null)
        setFaviconFile(null)
        fetchProfile()
        if (res.errors && typeof res.errors === "object") {
          const apiErrs = {}
          Object.keys(res.errors).forEach((key) => {
            apiErrs[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key]
          })
          setFormErrors(apiErrs)
        }
        if (res.status === 404) {
          setError("Endpoint penyimpanan profil perusahaan belum tersedia di API backend.")
        } else {
          setError(res.message || "Gagal menyimpan perubahan profil perusahaan.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("Terjadi kendala jaringan saat menghubungi server backend.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 card-surface bg-white p-8 text-left">
        <div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-text-secondary font-bold animate-pulse">
          Memuat konfigurasi profil perusahaan dari server...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-accent-cyan" />
            <span>Konfigurasi Profil Perusahaan</span>
          </h2>
          <p className="text-text-muted text-xs mt-1">
            Atur identitas merek, kontak resmi, alamat kantor, dan media sosial Terra Tech yang terhubung ke database.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading || isSaving}
          title="Muat ulang data"
          className="p-2 rounded-xl border border-dark-border bg-dark-base hover:bg-white text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent-cyan" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Column Left: Brand Identity & File Uploads */}
          <div className="md:col-span-7 space-y-6">
            <div className="card-surface bg-white border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Identitas Utama Perusahaan</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Perusahaan *</label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Terra Tech"
                  className={`w-full px-3.5 py-2 rounded-xl border ${
                    formErrors.name ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                  } text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60 font-bold`}
                />
                {formErrors.name && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.name}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Slogan / Tagline</label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="Solusi Digital Terintegrasi & Modern"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Perusahaan</label>
                <textarea
                  rows="4"
                  disabled={readOnly}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Deskripsi singkat mengenai profil, layanan, dan keunggulan perusahaan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 leading-relaxed resize-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Website Resmi</label>
                <input
                  type="url"
                  disabled={readOnly}
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://terratech.id"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Media Sosial */}
            <div className="card-surface bg-white border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Media Sosial & Tautan Eksternal</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="url"
                    disabled={readOnly}
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="https://facebook.com/terratech.id"
                    className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    disabled={readOnly}
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="https://instagram.com/terratech.id"
                    className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    disabled={readOnly}
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/terratech"
                    className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                    <Youtube className="h-3.5 w-3.5 text-rose-600" />
                    <span>YouTube Channel</span>
                  </label>
                  <input
                    type="url"
                    disabled={readOnly}
                    value={profile.youtube}
                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                    placeholder="https://youtube.com/@terratech"
                    className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-base text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Contact Info & Brand Assets */}
          <div className="md:col-span-5 space-y-6">
            {/* Contact Details */}
            <div className="card-surface bg-white border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Kontak & Alamat Resmi</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Email Resmi *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="email"
                    disabled={readOnly}
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="info@terratech.com"
                    className={`w-full pl-8 pr-3.5 py-2 rounded-xl border ${
                      formErrors.email ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                    } text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60`}
                  />
                </div>
                {formErrors.email && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.email}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Telepon / WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    disabled={readOnly}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+62 21 555 1234"
                    className={`w-full pl-8 pr-3.5 py-2 rounded-xl border ${
                      formErrors.phone ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                    } text-xs focus:outline-none focus:border-accent-cyan/60 disabled:opacity-60`}
                  />
                </div>
                {formErrors.phone && <span className="text-[11px] text-rose-500 font-semibold">{formErrors.phone}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Alamat Kantor *</label>
                <div className="relative">
                  <textarea
                    rows="3"
                    disabled={readOnly}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Gedung Cyber 2 Lantai 15, Jl. H. R. Rasuna Said, Jakarta Selatan"
                    className={`w-full px-3.5 py-2 rounded-xl border ${
                      formErrors.address ? "border-rose-400 bg-rose-50/30" : "border-dark-border bg-dark-base"
                    } text-xs focus:outline-none focus:border-accent-cyan/60 leading-relaxed resize-none disabled:opacity-60`}
                  />
                </div>
                {formErrors.address && (
                  <span className="text-[11px] text-rose-500 font-semibold">{formErrors.address}</span>
                )}
              </div>
            </div>

            {/* Brand Visual Assets Upload */}
            <div className="card-surface bg-white border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Aset Visual (Logo & Favicon)</span>
              </h3>

              {/* Logo Upload & Preview */}
              <div className="space-y-2 p-3 bg-dark-base rounded-xl border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">Logo Perusahaan</span>
                  <label
                    htmlFor="logo-upload"
                    className={`cursor-pointer px-2.5 py-1 bg-white border border-dark-border rounded-lg text-[10px] font-bold text-text-primary hover:bg-dark-base flex items-center gap-1 transition-colors ${
                      readOnly ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3 text-accent-cyan" />
                    <span>Pilih Logo</span>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    disabled={readOnly}
                    onChange={(e) => handleFileChange("logo", e)}
                    className="hidden"
                  />
                </div>
                {logoPreview ? (
                  <div className="h-16 w-full rounded-lg bg-white border border-dark-border flex items-center justify-center p-2">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://placehold.co/150x50/27272a/a1a1aa?text=Logo+TerraTech"
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted italic block">Belum ada logo terunggah.</span>
                )}
              </div>

              {/* Favicon Upload & Preview */}
              <div className="space-y-2 p-3 bg-dark-base rounded-xl border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">Favicon Tab</span>
                  <label
                    htmlFor="favicon-upload"
                    className={`cursor-pointer px-2.5 py-1 bg-white border border-dark-border rounded-lg text-[10px] font-bold text-text-primary hover:bg-dark-base flex items-center gap-1 transition-colors ${
                      readOnly ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3 text-accent-cyan" />
                    <span>Pilih Favicon</span>
                  </label>
                  <input
                    id="favicon-upload"
                    type="file"
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                    disabled={readOnly}
                    onChange={(e) => handleFileChange("favicon", e)}
                    className="hidden"
                  />
                </div>
                {faviconPreview ? (
                  <div className="h-12 w-12 rounded-lg bg-white border border-dark-border flex items-center justify-center p-1.5">
                    <img
                      src={faviconPreview}
                      alt="Favicon Preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://placehold.co/32x32/27272a/a1a1aa?text=Fav"
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted italic block">Belum ada favicon terunggah.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="pt-4 border-t border-dark-border flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
