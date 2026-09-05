import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Edit2, Eye, FileText, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"
import { pageService } from "@/services/api.service"
import RichTextEditor from "../ui/RichTextEditor"
import RichTextContent from "../ui/RichTextContent"

const initialForm = { title: "", slug: "", content: "", status: "draft" }

const getItems = (data) => {
  if (Array.isArray(data)) return data
  return data?.items || data?.data || data?.pages || []
}

const getPageStatus = (page) => String(page.status || "draft").toLowerCase()

const getErrorMessage = (res, fallback) => {
  if (res?.status === 403) return "Anda tidak memiliki izin untuk melakukan tindakan ini."
  if (res?.status === 409 || res?.status === 422) {
    const slugError = res.errors?.slug?.[0]
    return slugError || res.message || "Data halaman tidak valid atau slug sudah digunakan."
  }
  return res?.message || fallback
}

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("id-ID")
}

export default function CmsPages({ role = "operator", showToast }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [selectedPage, setSelectedPage] = useState(null)
  const [modal, setModal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate = role === "super_admin" || role === "admin"
  const canEdit = canCreate || role === "editor"
  const canDelete = canCreate
  const canChangeStatus = canCreate || role === "editor"

  const fetchPages = async () => {
    setLoading(true)
    setError("")
    const res = await pageService.getPages({ search, status: statusFilter })
    if (res.success) {
      setPages(getItems(res.data))
    } else {
      setError(getErrorMessage(res, "Gagal memuat halaman."))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPages()
  }, [search, statusFilter])

  const openCreate = () => {
    setSelectedPage(null)
    setForm(initialForm)
    setFormErrors({})
    setModal("form")
  }

  const openEdit = (page) => {
    setSelectedPage(page)
    setForm({
      title: page.title || "",
      slug: page.slug || "",
      content: page.content || "",
      status: getPageStatus(page)
    })
    setFormErrors({})
    setModal("form")
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = "Judul wajib diisi."
    if (!form.slug.trim()) nextErrors.slug = "Slug wajib diisi."
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung."
    }
    if (!form.content.trim()) nextErrors.content = "Content wajib diisi."
    if (!["draft", "published", "inactive"].includes(form.status)) nextErrors.status = "Status tidak valid."
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content,
      status: form.status
    }
    const res = selectedPage
      ? await pageService.updatePage(selectedPage.id, payload)
      : await pageService.createPage(payload)

    if (res.success) {
      showToast?.(selectedPage ? "Halaman berhasil diperbarui." : "Halaman berhasil dibuat.", "success")
      setModal(null)
      await fetchPages()
    } else {
      setFormErrors({ form: getErrorMessage(res, "Gagal menyimpan halaman.") })
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedPage) return
    setIsSubmitting(true)
    const res = await pageService.deletePage(selectedPage.id)
    if (res.success) {
      showToast?.("Halaman berhasil dihapus.", "success")
      setModal(null)
      await fetchPages()
    } else {
      showToast?.(getErrorMessage(res, "Gagal menghapus halaman."), "error")
    }
    setIsSubmitting(false)
  }

  const handleStatus = async (page) => {
    if (!canChangeStatus) return
    const nextStatus = getPageStatus(page) === "published" ? "draft" : "published"
    const res = await pageService.updatePageStatus(page.id, nextStatus)
    if (res.success) {
      showToast?.("Status halaman berhasil diperbarui.", "success")
      fetchPages()
    } else {
      showToast?.(getErrorMessage(res, "Gagal mengubah status halaman."), "error")
    }
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-border pb-5">
        <div>
          <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">CMS Control Panel</span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1 flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-accent-cyan" /> CMS Pages
          </h2>
          <p className="text-text-secondary text-xs mt-1">Kelola halaman generik yang terhubung dengan Navigation CMS.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPages} disabled={loading} className="px-3.5 py-2 rounded-xl border border-dark-border bg-white text-text-secondary text-xs font-bold flex items-center gap-2 disabled:opacity-60" title="Refresh halaman">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          {canCreate && <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-accent-cyan text-white text-xs font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Halaman</button>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau slug..." className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-dark-border bg-dark-base focus:outline-none focus:border-accent-cyan/40" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-white text-text-secondary">
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>}
      {loading ? <div className="py-20 flex flex-col items-center gap-3 text-xs text-text-secondary"><div className="h-8 w-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" /> Memuat halaman...</div> : pages.length === 0 ? <div className="py-20 text-center text-xs text-text-secondary border border-dashed border-dark-border rounded-2xl">Belum ada halaman CMS.</div> : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-base/50 text-text-muted border-b border-dark-border text-[11px] uppercase tracking-wider font-bold"><tr><th className="px-4 py-3.5 text-center">No</th><th className="px-4 py-3.5">Title</th><th className="px-4 py-3.5">Slug</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Updated At</th><th className="px-4 py-3.5 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-dark-border">{pages.map((page, index) => { const status = getPageStatus(page); return <tr key={page.id} className="hover:bg-dark-base/30"><td className="px-4 py-4 text-center text-text-muted">{index + 1}</td><td className="px-4 py-4 font-bold text-text-primary">{page.title}</td><td className="px-4 py-4 font-mono text-text-secondary">/{page.slug}</td><td className="px-4 py-4">{canChangeStatus ? <button onClick={() => handleStatus(page)} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{status}</button> : <span className="px-2.5 py-1 rounded-full border text-[10px] font-bold bg-gray-100 text-gray-600 border-gray-200">{status}</span>}</td><td className="px-4 py-4 text-text-secondary">{formatDate(page.updated_at || page.updatedAt)}</td><td className="px-4 py-4"><div className="flex justify-end gap-1.5">{canEdit && <button onClick={() => openEdit(page)} className="p-1.5 rounded-lg border border-dark-border text-text-secondary hover:text-accent-cyan" title="Edit halaman"><Edit2 className="h-4 w-4" /></button>}<button onClick={() => { setSelectedPage(page); setModal("preview") }} className="p-1.5 rounded-lg border border-dark-border text-text-secondary hover:text-accent-cyan" title="Preview halaman"><Eye className="h-4 w-4" /></button>{canDelete && <button onClick={() => { setSelectedPage(page); setModal("delete") }} className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50" title="Hapus halaman"><Trash2 className="h-4 w-4" /></button>}</div></td></tr> })}</tbody>
          </table>
        </div>
      )}

      {modal === "form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h3 className="font-bold text-base text-text-primary">{selectedPage ? "Edit Halaman" : "Tambah Halaman"}</h3>
              <button onClick={() => setModal(null)} title="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formErrors.form && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formErrors.form}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-dark-border"
                />
                {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  placeholder="tentang-kami"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-dark-border font-mono"
                />
                {formErrors.slug && <p className="text-[11px] text-rose-600 mt-1">{formErrors.slug}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Content</label>
                <div className="mt-1">
                  <RichTextEditor
                    value={form.content}
                    onChange={(content) => setForm({ ...form, content })}
                    placeholder="Tulis konten halaman secara lengkap di sini..."
                    error={formErrors.content}
                    minHeight="220px"
                  />
                </div>
                {formErrors.content && <p className="text-[11px] text-rose-600 mt-1">{formErrors.content}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-dark-border"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-dark-border text-xs font-bold">
                  Batal
                </button>
                <button disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-accent-cyan text-white text-xs font-bold disabled:opacity-60">
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modal === "preview" && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-text-primary">{selectedPage.title}</h3>
              <button onClick={() => setModal(null)} title="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="font-mono text-xs text-accent-cyan">/{selectedPage.slug}</p>
            <RichTextContent content={selectedPage.content} className="text-sm text-text-secondary leading-relaxed" />
          </div>
        </div>
      )}
      {modal === "delete" && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-bold text-sm text-text-primary">Hapus halaman?</h3>
            </div>
            <p className="text-xs text-text-secondary">Halaman <strong>{selectedPage.title}</strong> akan dihapus melalui API backend.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-dark-border text-xs font-bold">
                Batal
              </button>
              <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-60">
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
