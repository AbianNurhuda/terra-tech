import { useState, useEffect } from "react"
import { Building2, Mail, Phone, MapPin, Globe, Save, Upload, AlertCircle, FileText, CheckCircle2 } from "lucide-react"

export default function CompanyProfileConfig({ showToast }) {
  const [profile, setProfile] = useState({
    name: "Terra Tech",
    tagline: "Solusi Digital Terintegrasi & Modern",
    description: "Kami menyediakan layanan pembuatan perangkat lunak, website perusahaan, e-commerce, optimasi mesin pencari (SEO), dan desain UI/UX kelas dunia untuk membantu bisnis Anda bertransformasi di era digital.",
    email: "info@terratech.com",
    phone: "+62 21 555 1234",
    address: "Gedung Cyber 2 Lantai 15, Jl. H. R. Rasuna Said No.13, Jakarta Selatan, 12950",
    facebook: "https://facebook.com/terratech.id",
    instagram: "https://instagram.com/terratech.id",
    linkedin: "https://linkedin.com/company/terratech",
    youtube: "https://youtube.com/c/terratech",
    logoName: "logo_terratech.png",
    logoSize: "18.4 KB",
    faviconName: "favicon.ico",
    faviconSize: "4.2 KB",
  })

  const [logoPreview, setLogoPreview] = useState("https://picsum.photos/seed/terralogo/300/300")
  const [faviconPreview, setFaviconPreview] = useState("https://picsum.photos/seed/terrafav/100/100")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("cms_company_profile")
    if (saved) {
      setProfile(JSON.parse(saved))
    }
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    setError("")

    if (!profile.name || !profile.email || !profile.phone || !profile.address) {
      setError("Nama perusahaan, email, telepon, dan alamat wajib diisi.")
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      localStorage.setItem("cms_company_profile", JSON.stringify(profile))
      setIsSaving(false)
      showToast("Profil perusahaan berhasil diperbarui!", "success")
    }, 1000)
  }

  const handleFileUpload = (type, e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit to 2MB for mock
    if (file.size > 2 * 1024 * 1024) {
      showToast("Gagal: Batas ukuran file adalah 2MB.", "error")
      return
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]
    if (!allowedTypes.includes(file.type)) {
      showToast("Gagal: Format file tidak didukung. Gunakan PNG, JPG, SVG, atau ICO.", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const sizeKB = (file.size / 1024).toFixed(1) + " KB"
      if (type === "logo") {
        setLogoPreview(event.target.result)
        setProfile({ ...profile, logoName: file.name, logoSize: sizeKB })
        showToast("Logo berhasil diunggah!", "success")
      } else {
        setFaviconPreview(event.target.result)
        setProfile({ ...profile, faviconName: file.name, faviconSize: sizeKB })
        showToast("Favicon berhasil diunggah!", "success")
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-text-primary">Konfigurasi Profil Perusahaan</h2>
        <p className="text-text-muted text-xs mt-0.5">Atur identitas merek, kontak resmi, alamat kantor, dan media sosial Terra Tech.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Column Left: Brand Identity & File Uploads */}
          <div className="md:col-span-7 space-y-6">
            <div className="card-surface bg-white border border-dark-border p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Identitas Utama Perusahaan</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Perusahaan</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Terra Tech"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Slogan / Tagline</label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="Tagline perusahaan"
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat Perusahaan</label>
                <textarea
                  rows="4"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Profil singkat yang akan tampil di footer dan halaman tentang kami."
                  className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none focus:border-accent-cyan/60 leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="card-surface bg-white border border-dark-border p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Media Sosial & Tautan Eksternal</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-text-secondary">Facebook</label>
                  <input
                    type="url"
                    value={profile.facebook || ""}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-text-secondary">Instagram</label>
                  <input
                    type="url"
                    value={profile.instagram || ""}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-text-secondary">LinkedIn</label>
                  <input
                    type="url"
                    value={profile.linkedin || ""}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-text-secondary">YouTube</label>
                  <input
                    type="url"
                    value={profile.youtube || ""}
                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Contact Details & Media Assets Upload */}
          <div className="md:col-span-5 space-y-6">
            {/* Contact details */}
            <div className="card-surface bg-white border border-dark-border p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Kontak & Alamat Kantor</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-text-muted" />
                    <span>Email Resmi</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="info@perusahaan.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-text-muted" />
                    <span>Nomor Telepon</span>
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+62..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-text-muted" />
                    <span>Alamat Lengkap Perusahaan</span>
                  </label>
                  <textarea
                    rows="3"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Alamat kantor..."
                    className="w-full px-3.5 py-2 rounded-xl border border-dark-border text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Logo and Favicon Asset Uploads */}
            <div className="card-surface bg-white border border-dark-border p-6 space-y-5">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-accent-cyan" />
                <span>Aset Gambar & Identitas Visual</span>
              </h3>

              {/* Logo File upload */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-secondary">Logo Perusahaan</span>
                  <span className="text-[10px] text-text-muted">Rasio 1:1 atau Lanskap (Maks 2MB, PNG/JPG)</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-dark-base rounded-xl border border-dark-border flex items-center justify-center p-1.5 overflow-hidden shadow-sm shrink-0">
                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-2 border border-dark-border hover:border-accent-cyan/40 bg-white hover:bg-dark-base/50 rounded-xl cursor-pointer text-xs font-bold text-text-secondary transition-all">
                      <Upload className="h-3.5 w-3.5 text-text-muted" />
                      <span>Pilih File Logo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={(e) => handleFileUpload("logo", e)}
                        className="hidden"
                      />
                    </label>
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[180px]">{profile.logoName} ({profile.logoSize})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon File upload */}
              <div className="space-y-3 pt-2 border-t border-dark-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-secondary">Favicon Tab Browser</span>
                  <span className="text-[10px] text-text-muted">Format .ico/.png (Maks 500KB)</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-dark-base rounded-xl border border-dark-border flex items-center justify-center p-2.5 overflow-hidden shadow-sm shrink-0">
                    <img src={faviconPreview} alt="Favicon Preview" className="h-full w-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dark-border hover:border-accent-cyan/40 bg-white hover:bg-dark-base/50 rounded-xl cursor-pointer text-xs font-bold text-text-secondary transition-all">
                      <Upload className="h-3.5 w-3.5 text-text-muted" />
                      <span>Pilih File Favicon</span>
                      <input
                        type="file"
                        accept="image/png, image/x-icon, image/vnd.microsoft.icon"
                        onChange={(e) => handleFileUpload("favicon", e)}
                        className="hidden"
                      />
                    </label>
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[180px]">{profile.faviconName} ({profile.faviconSize})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-accent-cyan text-white font-bold text-xs rounded-xl px-5 py-3 shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 focus:outline-none transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>Simpan Konfigurasi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
