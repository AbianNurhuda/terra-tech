import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, FileQuestion, Home, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { navigationService, pageService } from "@/services/api.service"

const allowedTags = new Set(["A", "B", "BR", "CODE", "DIV", "EM", "H2", "H3", "H4", "LI", "OL", "P", "PRE", "STRONG", "UL"])
const allowedAttributes = new Set(["href", "title", "target", "rel"])

const sanitizeContent = (content) => {
  if (typeof content !== "string" || typeof DOMParser === "undefined") return ""
  const parsed = new DOMParser().parseFromString(content, "text/html")
  parsed.querySelectorAll("script, style, iframe, object, embed, form").forEach((node) => node.remove())
  parsed.body.querySelectorAll("*").forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(parsed.createTextNode(node.textContent || ""))
      return
    }
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      const safeUrl = name !== "href" || /^(https?:|mailto:|tel:|#|\/)/i.test(value)
      if (name.startsWith("on") || !allowedAttributes.has(name) || !safeUrl) node.removeAttribute(attribute.name)
    })
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer")
  })
  return parsed.body.innerHTML
}

const getPage = (data) => data?.page || data?.item || data

const getNavigationItems = (data) => {
  if (Array.isArray(data)) return data
  return data?.items || data?.navigations || data?.data || []
}

const normalizePath = (path) => {
  const value = String(path || "").split("?")[0].split("#")[0]
  const normalized = value.replace(/\/+$/, "")
  return normalized || "/"
}

export function DynamicCmsPage() {
  const { pathname } = useLocation()
  const [page, setPage] = useState(null)
  const [state, setState] = useState("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let isMounted = true
    const loadPage = async () => {
      setState("loading")
      setPage(null)
      setMessage("")

      let decodedPath = pathname
      try {
        decodedPath = decodeURIComponent(pathname)
      } catch {
        if (isMounted) {
          setMessage("Alamat halaman tidak valid.")
          setState("not-found")
        }
        return
      }

      const navigationResponse = await navigationService.getPublicNavigation()
      if (!isMounted) return
      if (!navigationResponse.success) {
        setMessage(navigationResponse.message || "Gagal memuat navigasi.")
        setState("error")
        return
      }

      const navigation = getNavigationItems(navigationResponse.data).find(
        (item) => normalizePath(item.path) === normalizePath(decodedPath)
      )

      if (!navigation || navigation.type !== "internal") {
        setState("not-found")
        return
      }

      const navigationPage = navigation.page
      if (!navigationPage || !navigationPage.slug) {
        setMessage("Navigasi ini belum terhubung ke halaman CMS yang tersedia.")
        setState("not-found")
        return
      }

      const pageResponse = await pageService.getPageBySlug(navigationPage.slug)
      if (!isMounted) return
      if (pageResponse.success) {
        const nextPage = getPage(pageResponse.data)
        if (nextPage && String(nextPage.status || "").toLowerCase() === "published") {
          setPage(nextPage)
          setState("ready")
        } else setState("not-found")
      } else if (pageResponse.status === 403) {
        setMessage("Anda tidak memiliki izin untuk mengakses halaman ini.")
        setState("forbidden")
      } else if (pageResponse.status === 404) setState("not-found")
      else {
        setMessage(pageResponse.message || "Gagal memuat halaman.")
        setState("error")
      }
    }

    loadPage().catch(() => {
      if (isMounted) {
        setMessage("Gagal memuat halaman.")
        setState("error")
      }
    })
    return () => { isMounted = false }
  }, [pathname])

  if (state === "loading") {
    return (
      <main className="relative pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-text-secondary animate-pulse">Memuat halaman...</span>
        </div>
      </main>
    )
  }

  if (state === "ready") {
    return (
      <main className="relative pt-28 pb-20 min-h-screen">
        <div className="container pt-6 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-text-muted mb-8 animate-fade-up">
            <Link to="/" className="hover:text-accent-cyan transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Beranda</Link>
            <ChevronRight className="h-3.5 w-3.5 text-dark-border" />
            <span className="text-text-primary font-medium">{page.title}</span>
          </nav>
          <header className="space-y-3 mb-10 animate-fade-up"><span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">Halaman CMS Terra Tech</span><h1 className="text-3xl sm:text-5xl font-extrabold font-display text-text-primary">{page.title}</h1><p className="font-mono text-xs text-text-muted">/{page.slug}</p></header>
          <article className="card-surface p-6 sm:p-8 rounded-2xl border border-dark-border bg-dark-surface/90 text-text-secondary leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeContent(page.content) }} />
        </div>
      </main>
    )
  }
  if (state === "forbidden") return <main className="relative pt-28 pb-20 min-h-screen flex items-center"><div className="container text-center max-w-xl mx-auto space-y-5"><AlertTriangle className="h-12 w-12 mx-auto text-amber-400" /><h1 className="text-3xl font-extrabold font-display text-text-primary">Akses Ditolak</h1><p className="text-sm text-text-secondary">{message}</p><Link to="/"><Button size="md"><Home className="h-4 w-4 mr-2" /> Kembali ke Beranda</Button></Link></div></main>
  if (state === "error") return <main className="relative pt-28 pb-20 min-h-screen flex items-center"><div className="container text-center max-w-xl mx-auto space-y-5"><AlertTriangle className="h-12 w-12 mx-auto text-rose-400" /><h1 className="text-3xl font-extrabold font-display text-text-primary">Gagal Memuat Halaman</h1><p className="text-sm text-text-secondary">{message}</p><Link to="/"><Button size="md"><Home className="h-4 w-4 mr-2" /> Kembali ke Beranda</Button></Link></div></main>
  return <main className="relative pt-28 pb-20 min-h-screen flex items-center"><div className="container text-center max-w-xl mx-auto space-y-5"><FileQuestion className="h-12 w-12 mx-auto text-rose-400" /><h1 className="text-3xl font-extrabold font-display text-text-primary">Halaman Tidak Ditemukan</h1><p className="text-sm text-text-secondary">Halaman CMS dengan alamat <code className="font-mono text-text-primary">{pathname}</code> tidak tersedia atau belum dipublikasikan.</p><Link to="/" className="inline-flex"><Button size="md"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Beranda</Button></Link></div></main>
}
