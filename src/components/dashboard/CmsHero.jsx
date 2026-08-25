import { useState, useEffect } from "react"
import { defaultHero } from "../../utils/cmsDefaults"
import { Save, AlertCircle, Image as ImageIcon } from "lucide-react"

export default function CmsHero({ readOnly = false, showToast }) {
  const [heroData, setHeroData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("cms_hero")
    if (saved) {
      setHeroData(JSON.parse(saved))
    } else {
      setHeroData(defaultHero)
      localStorage.setItem("cms_hero", JSON.stringify(defaultHero))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setHeroData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setError("")
    if (!heroData.title || !heroData.description) {
      setError("Judul dan Deskripsi wajib diisi.")
      return
    }

    localStorage.setItem("cms_hero", JSON.stringify(heroData))
    showToast("Konfigurasi Hero Section berhasil diperbarui!", "success")
  }

  if (!heroData) {
    return <div className="text-xs text-text-muted">Memuat data...</div>
  }

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-text-primary font-display">Hero Section Configuration</h3>
        <p className="text-text-muted text-xs mt-1">
          Ubah judul utama, deskripsi, tombol tindakan, dan gambar latar belakang yang tampil di bagian teratas Landing Page.
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
            <label className="text-xs font-semibold text-text-secondary">Sub-title (Badge Atas)</label>
            <input
              type="text"
              name="subtitle"
              disabled={readOnly}
              value={heroData.subtitle}
              onChange={handleChange}
              placeholder="Contoh: Tersedia untuk proyek baru 2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Status Publikasi</label>
            <select
              name="status"
              disabled={readOnly}
              value={heroData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            >
              <option value="Published">Published (Tampilkan)</option>
              <option value="Draft">Draft (Sembunyikan)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Judul Utama (Title)</label>
          <textarea
            name="title"
            rows="2"
            disabled={readOnly}
            value={heroData.title}
            onChange={handleChange}
            placeholder="Gunakan teks yang menarik perhatian pengunjung"
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Deskripsi Singkat</label>
          <textarea
            name="description"
            rows="3"
            disabled={readOnly}
            value={heroData.description}
            onChange={handleChange}
            placeholder="Jelaskan secara singkat mengenai bisnis atau layanan Anda"
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Teks Tombol Aksi</label>
            <input
              type="text"
              name="button_text"
              disabled={readOnly}
              value={heroData.button_text}
              onChange={handleChange}
              placeholder="Contoh: Mulai Proyek Anda"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Tautan Tombol Aksi</label>
            <input
              type="text"
              name="button_link"
              disabled={readOnly}
              value={heroData.button_link}
              onChange={handleChange}
              placeholder="Contoh: #layanan atau /kontak"
              className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Tautan URL Gambar (Image)</label>
          <input
            type="text"
            name="image"
            disabled={readOnly}
            value={heroData.image}
            onChange={handleChange}
            placeholder="Contoh: https://picsum.photos/seed/terrahero/1000/1250"
            className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40 disabled:opacity-60"
          />
        </div>

        {/* Live Preview of image */}
        {heroData.image && (
          <div className="p-4 rounded-xl border border-dark-border bg-dark-base/50 space-y-2">
            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Preview Gambar Hero</span>
            </span>
            <div className="relative h-48 w-full max-w-[200px] rounded-xl overflow-hidden border border-dark-border bg-white shadow-sm">
              <img
                src={heroData.image}
                alt="Preview Hero"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://placehold.co/400x500/27272a/a1a1aa?text=Image+Not+Found"
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
