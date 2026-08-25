import { useState, useEffect } from "react"
import { defaultFooter } from "../../utils/cmsDefaults"
import { Save, AlertCircle } from "lucide-react"

export default function CmsFooter({ readOnly = false, showToast }) {
  const [footerData, setFooterData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("cms_footer")
    if (saved) {
      setFooterData(JSON.parse(saved))
    } else {
      setFooterData(defaultFooter)
      localStorage.setItem("cms_footer", JSON.stringify(defaultFooter))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFooterData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (index, value) => {
    setFooterData((prev) => {
      const social = [...prev.social_media]
      social[index] = { ...social[index], href: value }
      return { ...prev, social_media: social }
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    setError("")
    if (!footerData.address || !footerData.email || !footerData.phone || !footerData.copyright) {
      setError("Semua bidang teks (Alamat, Email, Telepon, Hak Cipta) wajib diisi.")
      return
    }

    localStorage.setItem("cms_footer", JSON.stringify(footerData))
    showToast("Konfigurasi Footer berhasil diperbarui!", "success")
  }

  if (!footerData) {
    return <div className="text-xs text-text-muted">Memuat data...</div>
  }

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-text-primary font-display">Footer Configuration</h3>
        <p className="text-text-muted text-xs mt-1">
          Ubah detail kontak perusahaan, tautan media sosial, alamat kantor, dan hak cipta (copyright) di bagian terbawah website.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Alamat Kantor</label>
            <input
              type="text"
              name="address"
              disabled={readOnly}
              value={footerData.address}
              onChange={handleChange}
              placeholder="Contoh: Jakarta, Indonesia"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Email Kontak</label>
            <input
              type="email"
              name="email"
              disabled={readOnly}
              value={footerData.email}
              onChange={handleChange}
              placeholder="Contoh: hello@terratech.id"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">No. Telepon / WhatsApp</label>
            <input
              type="text"
              name="phone"
              disabled={readOnly}
              value={footerData.phone}
              onChange={handleChange}
              placeholder="Contoh: +62 812-3456-7890"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Teks Hak Cipta (Copyright)</label>
          <input
            type="text"
            name="copyright"
            disabled={readOnly}
            value={footerData.copyright}
            onChange={handleChange}
            placeholder="Contoh: Terra Tech. All rights reserved."
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
          />
        </div>

        <div className="space-y-3.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide border-b border-dark-border/40 pb-2">Tautan Media Sosial</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {footerData.social_media.map((social, idx) => (
              <div key={social.label} className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">{social.label} URL</label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={social.href}
                  onChange={(e) => handleSocialChange(idx, e.target.value)}
                  placeholder={`Masukkan URL ${social.label}`}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </div>

        {!readOnly && (
          <div className="pt-2 border-t border-dark-border flex justify-end">
            <button
              type="submit"
              className="px-4 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan/90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
