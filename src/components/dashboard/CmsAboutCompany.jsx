import { useState, useEffect } from "react"
import { defaultAbout } from "../../utils/cmsDefaults"
import { Save, AlertCircle, Image as ImageIcon } from "lucide-react"

export default function CmsAboutCompany({ readOnly = false, showToast }) {
  const [aboutData, setAboutData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("cms_about_company")
    if (saved) {
      setAboutData(JSON.parse(saved))
    } else {
      setAboutData(defaultAbout)
      localStorage.setItem("cms_about_company", JSON.stringify(defaultAbout))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setAboutData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setError("")
    if (!aboutData.title || !aboutData.description || !aboutData.vision || !aboutData.mission) {
      setError("Semua bidang teks (Judul, Deskripsi, Visi, Misi) wajib diisi.")
      return
    }

    localStorage.setItem("cms_about_company", JSON.stringify(aboutData))
    showToast("Profil Tentang Perusahaan berhasil diperbarui!", "success")
  }

  if (!aboutData) {
    return <div className="text-xs text-text-muted">Memuat data...</div>
  }

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-text-primary font-display">About Company Configuration</h3>
        <p className="text-text-muted text-xs mt-1">
          Konfigurasikan judul keunggulan, visi, misi, deskripsi profil, dan gambar utama instansi Terra Tech.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Judul Section (About Title)</label>
            <input
              type="text"
              name="title"
              disabled={readOnly}
              value={aboutData.title}
              onChange={handleChange}
              placeholder="Contoh: Keunggulan Terra Tech"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Status Tampilan</label>
            <select
              name="status"
              disabled={readOnly}
              value={aboutData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            >
              <option value="Published">Published (Aktif)</option>
              <option value="Draft">Draft (Disembunyikan)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Deskripsi Perusahaan / Sub-judul</label>
          <textarea
            name="description"
            rows="3"
            disabled={readOnly}
            value={aboutData.description}
            onChange={handleChange}
            placeholder="Jelaskan secara ringkas mengenai keunggulan atau profil perusahaan Anda..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Visi Perusahaan (Vision)</label>
            <textarea
              name="vision"
              rows="4"
              disabled={readOnly}
              value={aboutData.vision}
              onChange={handleChange}
              placeholder="Masukkan pernyataan visi perusahaan..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Misi Perusahaan (Mission)</label>
            <textarea
              name="mission"
              rows="4"
              disabled={readOnly}
              value={aboutData.mission}
              onChange={handleChange}
              placeholder="Masukkan pernyataan misi perusahaan..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">URL Gambar Utama</label>
          <input
            type="text"
            name="image"
            disabled={readOnly}
            value={aboutData.image}
            onChange={handleChange}
            placeholder="Contoh: https://picsum.photos/seed/terraabout/800/600"
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
          />
        </div>

        {/* Live Preview */}
        {aboutData.image && (
          <div className="p-4 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Preview Gambar Profile</span>
            </span>
            <div className="relative h-32 w-full max-w-[240px] rounded-xl overflow-hidden border border-dark-border bg-white shadow-sm">
              <img
                src={aboutData.image}
                alt="Preview About"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://placehold.co/400x300/27272a/a1a1aa?text=No+Image+Found"
                }}
              />
            </div>
          </div>
        )}

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
