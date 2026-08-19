import { useState, useEffect } from "react"
import { defaultPortfolio } from "../utils/cmsDefaults"
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/utils/cn"
import { useInView } from "@/hooks/useInView"
import { CallToAction } from "@/components/sections/CallToAction"
import { Link } from "react-router-dom"

const portfolioCategories = [
  { id: "all", label: "Semua" },
  { id: "web", label: "Website" },
  { id: "mobile", label: "Mobile App" },
  { id: "design", label: "Desain UI/UX" },
  { id: "enterprise", label: "Enterprise" },
]

const portfolioProjects = [
  {
    id: 1,
    title: "E-Commerce Fashion Retail",
    category: "web",
    description:
      "Platform e-commerce dengan 100rb+ produk, terintegrasi payment gateway, inventory system, dan dashboard admin. Loading page 1.8 detik dengan Core Web Vitals 95+.",
    fullDescription:
      "Membangun platform e-commerce end-to-end untuk brand fashion lokal ternama. Fokus pada kecepatan loading, checkout experience, dan inventory management real-time. Menggunakan Next.js 15 dengan App Router, tRPC, dan PostgreSQL.",
    client: "UrbanStyle Indonesia",
    year: "2024",
    tags: ["Next.js", "tRPC", "PostgreSQL", "Midtrans", "Tailwind"],
    image: "https://picsum.photos/seed/terraport1/1200/900",
    gallery: [
      "https://picsum.photos/seed/terraport1a/1600/1000",
      "https://picsum.photos/seed/terraport1b/1600/1000",
      "https://picsum.photos/seed/terraport1c/1600/1000",
      "https://picsum.photos/seed/terraport1d/1600/1000",
    ],
    result: "Conversion rate naik 45%, bounce rate turun 38%, rata-rata order/hari 2.5x lipat.",
    height: "tall",
  },
  {
    id: 2,
    title: "Fintech Wallet App",
    category: "mobile",
    description:
      "Aplikasi dompet digital dengan transfer, top-up, QRIS payment, dan virtual account. Onboarding 50rb+ user 3 bulan pertama.",
    fullDescription:
      "Pengembangan aplikasi fintech wallet untuk Android & iOS dengan pendekatan Flutter cross-platform. Integrasi dengan berbagai bank & e-money di Indonesia, serta sistem keamanan berlapis (biometric, OTP, PIN).",
    client: "PayAja Fintech",
    year: "2024",
    tags: ["Flutter", "Dart", "Firebase", "Node.js", "Redis"],
    image: "https://picsum.photos/seed/terraport2/1000/1400",
    gallery: [
      "https://picsum.photos/seed/terraport2a/1200/2000",
      "https://picsum.photos/seed/terraport2b/1600/1000",
      "https://picsum.photos/seed/terraport2c/1200/2000",
    ],
    result: "Rating Play Store 4.7/5, crash rate <0.3%, 50rb+ user dalam 3 bulan.",
    height: "tall",
  },
  {
    id: 3,
    title: "HRIS Dashboard SaaS",
    category: "design",
    description:
      "Redesign dashboard HRIS untuk 5000+ employee. Task completion rate naik dari 68% ke 94%.",
    fullDescription:
      "Proyek redesign komprehensif mencakup user research, persona mapping, 50+ wireframe, prototype interaktif, hingga design system lengkap dengan 120+ komponen reusable untuk tim developer.",
    client: "HRM Corp Asia",
    year: "2024",
    tags: ["Figma", "Design System", "User Research", "Usability Test"],
    image: "https://picsum.photos/seed/terraport3/1200/800",
    gallery: [
      "https://picsum.photos/seed/terraport3a/1600/1000",
      "https://picsum.photos/seed/terraport3b/1600/1000",
      "https://picsum.photos/seed/terraport3c/1600/1000",
    ],
    result: "Task completion rate 68% → 94%, waktu operasional turun 40%, NPS design +68.",
    height: "short",
  },
  {
    id: 4,
    title: "EdTech Learning Platform",
    category: "enterprise",
    description:
      "Platform pembelajaran online multi-tenant untuk 2jt+ user. Arsitektur multi-cloud AWS + GCP.",
    fullDescription:
      "Merancang & membangun platform EdTech skala enterprise dengan multi-tenant architecture. Fitur video streaming HD, live class interaktif, quiz engine, sertifikat digital, dan laporan analitik lengkap.",
    client: "EduPrime Indonesia",
    year: "2023",
    tags: ["Next.js", "AWS", "GCP", "Kubernetes", "WebRTC", "BigQuery"],
    image: "https://picsum.photos/seed/terraport4/1200/1000",
    gallery: [
      "https://picsum.photos/seed/terraport4a/1600/1000",
      "https://picsum.photos/seed/terraport4b/1600/1000",
      "https://picsum.photos/seed/terraport4c/1600/1000",
      "https://picsum.photos/seed/terraport4d/1600/1000",
      "https://picsum.photos/seed/terraport4e/1600/1000",
    ],
    result: "Support 2jt+ MAU, uptime 99.97%, RTO <30 menit, cost saving 35%.",
    height: "medium",
  },
  {
    id: 5,
    title: "Corporate Website Group",
    category: "web",
    description:
      "Website company profile untuk holding company dengan 12 anak perusahaan. Multibahasa ID-EN-CN.",
    fullDescription:
      "Pengembangan corporate website group dengan sistem multisite untuk 12 anak perusahaan di bawah satu holding. Fokus pada SEO multibahasa, performance, dan kemudahan maintain konten melalui CMS custom.",
    client: "Surya Nusantara Group",
    year: "2024",
    tags: ["Next.js", "Strapi CMS", "i18n", "SEO", "Cloudflare"],
    image: "https://picsum.photos/seed/terraport5/1200/700",
    gallery: [
      "https://picsum.photos/seed/terraport5a/1600/1000",
      "https://picsum.photos/seed/terraport5b/1600/1000",
      "https://picsum.photos/seed/terraport5c/1600/1000",
    ],
    result: "Lighthouse score 98, organic traffic +180% 6 bulan pertama, PageSpeed 95+.",
    height: "short",
  },
  {
    id: 6,
    title: "Marketplace Mobile App",
    category: "mobile",
    description:
      "Marketplace C2C dengan 500k+ UMKM seller. Fitur live streaming jualan & COD 30 kota.",
    fullDescription:
      "Aplikasi marketplace berbasis React Native dengan integrasi live streaming jualan (livestream commerce). Backend microservices di Kubernetes dengan auto-scaling untuk menangani flash sale traffic 10x lipat.",
    client: "LokalMart Marketplace",
    year: "2023",
    tags: ["React Native", "TypeScript", "Kubernetes", "Ant Media", "Go"],
    image: "https://picsum.photos/seed/terraport6/1000/1500",
    gallery: [
      "https://picsum.photos/seed/terraport6a/1200/2000",
      "https://picsum.photos/seed/terraport6b/1600/1000",
      "https://picsum.photos/seed/terraport6c/1200/2000",
    ],
    result: "500k+ seller terdaftar, 3jt+ transaksi/bulan, peak flash sale 120k concurrent user.",
    height: "tall",
  },
  {
    id: 7,
    title: "SaaS Product Design System",
    category: "design",
    description:
      "Design system enterprise untuk suite produk SaaS dengan 40+ designer & 120+ engineer.",
    fullDescription:
      "Membangun design system terpusat yang mencakup token-based theming (light/dark mode), 150+ komponen Figma + React, dokumentasi Storybook, dan governance untuk tim lintas produk.",
    client: "StackFlow SaaS",
    year: "2024",
    tags: ["Design Tokens", "Figma", "Storybook", "React", "a11y WCAG 2.1"],
    image: "https://picsum.photos/seed/terraport7/1200/900",
    gallery: [
      "https://picsum.photos/seed/terraport7a/1600/1000",
      "https://picsum.photos/seed/terraport7b/1600/1000",
      "https://picsum.photos/seed/terraport7c/1600/1000",
      "https://picsum.photos/seed/terraport7d/1600/1000",
    ],
    result: "Design-to-dev handoff time turun 60%, konsistensi UI +85%, bug UI turun 72%.",
    height: "medium",
  },
  {
    id: 8,
    title: "Cloud Migration Enterprise",
    category: "enterprise",
    description:
      "Migrasi infrastruktur on-prem 10 tahun ke AWS zero-downtime. 42% saving biaya server.",
    fullDescription:
      "Proyek migrasi besar-besaran dari on-prem data center ke AWS untuk fintech unicorn. Strategy: lift-then-shift untuk aplikasi legacy, dan re-architect untuk 3 service core. Dengan RTO <30 menit dan RPO <1 menit.",
    client: "Fintech Unicorn (confidential)",
    year: "2023",
    tags: ["AWS", "Terraform", "Kubernetes", "Zero-Downtime", "DR Plan"],
    image: "https://picsum.photos/seed/terraport8/1200/800",
    gallery: [
      "https://picsum.photos/seed/terraport8a/1600/1000",
      "https://picsum.photos/seed/terraport8b/1600/1000",
      "https://picsum.photos/seed/terraport8c/1600/1000",
    ],
    result: "Saving biaya 42%, MTTR incident 2jam→8menit, auto-scale handle 10x traffic.",
    height: "short",
  },
  {
    id: 9,
    title: "Travel Booking Web App",
    category: "web",
    description:
      "Platform booking tiket & hotel terintegrasi dengan 200+ supplier. Realtime inventory 5jt+ kamar.",
    fullDescription:
      "Mengembangkan OTA (Online Travel Agency) platform dengan integrasi ke 200+ supplier hotel & airline melalui API XML/JSON. Sistem caching & queue untuk harga realtime dan booking engine yang reliable.",
    client: "GoTravel Indonesia",
    year: "2024",
    tags: ["Next.js", "NestJS", "RabbitMQ", "Elasticsearch", "Redis"],
    image: "https://picsum.photos/seed/terraport9/1200/1000",
    gallery: [
      "https://picsum.photos/seed/terraport9a/1600/1000",
      "https://picsum.photos/seed/terraport9b/1600/1000",
      "https://picsum.photos/seed/terraport9c/1600/1000",
      "https://picsum.photos/seed/terraport9d/1600/1000",
    ],
    result: "Search response <300ms, booking success rate 99.2%, GMV $1.2jt/bulan pertama.",
    height: "medium",
  },
]

export function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [portfolioList, setPortfolioList] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("cms_portfolio")
    if (saved) {
      setPortfolioList(JSON.parse(saved))
    } else {
      setPortfolioList(defaultPortfolio)
      localStorage.setItem("cms_portfolio", JSON.stringify(defaultPortfolio))
    }
  }, [])

  const activePortfolios = portfolioList
    .filter((p) => p.status === "Published")
    .map((p) => {
      // Find matching item in portfolioProjects to get detailed fields like tags, gallery, fullDescription, client, year, result, height
      const numericId = typeof p.id === 'string' ? parseInt(p.id.replace('port-', '')) : p.id;
      const originalProject = portfolioProjects.find(
        (dp) => dp.id === numericId || dp.title?.trim().toLowerCase() === p.title?.trim().toLowerCase()
      ) || {};
      
      return {
        tags: [],
        gallery: [p.image || "https://picsum.photos/seed/terraport/1200/900"],
        fullDescription: p.description || "",
        client: "Klien Terra Tech",
        year: new Date().getFullYear().toString(),
        result: "Proyek diselesaikan dengan sukses dan memenuhi target.",
        height: "medium",
        ...originalProject,
        ...p,
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        project_url: p.project_url
      }
    })

  const filteredProjects = activePortfolios.filter(
    (project) => activeCategory === "all" || project.category === activeCategory
  )
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProject, setLightboxProject] = useState(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [ref, inView] = useInView({ threshold: 0.05, triggerOnce: true })

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  const openLightbox = (project, imageIndex = 0) => {
    setLightboxProject(project)
    setLightboxImageIndex(imageIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setTimeout(() => {
      setLightboxProject(null)
      setLightboxImageIndex(0)
    }, 300)
  }

  const nextImage = () => {
    if (!lightboxProject) return
    const galleryLength = (lightboxProject.gallery || []).length || 1
    setLightboxImageIndex((i) =>
      i >= galleryLength - 1 ? 0 : i + 1
    )
  }

  const prevImage = () => {
    if (!lightboxProject) return
    const galleryLength = (lightboxProject.gallery || []).length || 1
    setLightboxImageIndex((i) =>
      i <= 0 ? galleryLength - 1 : i - 1
    )
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen || !lightboxProject) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, lightboxProject, lightboxImageIndex])

  return (
    <main className="relative pt-28">
      <section className="container pt-8 pb-10">
        <div className="max-w-3xl">
          <span className="section-label animate-fade-up">Portofolio</span>
          <h1
            className="section-title !mb-5 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Proyek Kami yang <span className="glow-text">Telah Dipercaya</span>
          </h1>
          <p
            className="section-subtitle animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            Kumpulan hasil kolaborasi dengan berbagai klien — dari startup tahap awal, hingga
            enterprise skala nasional. Setiap proyek dikerjakan dengan standar kualitas tinggi.
          </p>
        </div>
      </section>

      <section ref={ref} className="container pb-14">
        <div
          className={cn(
            "flex flex-wrap gap-3 mb-10",
            inView ? "animate-fade-up" : "opacity-0"
          )}
        >
          {portfolioCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                activeCategory === cat.id
                  ? "bg-accent-cyan text-dark-base shadow-[0_0_25px_rgba(0,229,255,0.4)]"
                  : "bg-dark-surface border border-dark-border text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 text-sm text-text-muted px-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-accent-cyan animate-pulse" />
            {filteredProjects.length} proyek ditemukan
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 lg:gap-7 [column-fill:_balance] space-y-6 lg:space-y-7">
          {filteredProjects.map((project, i) => (
            <article
              key={project.id}
              onClick={() => openLightbox(project, 0)}
              className={cn(
                "group relative break-inside-avoid overflow-hidden rounded-2xl border border-dark-border bg-dark-surface cursor-pointer",
                "hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-[0_0_60px_rgba(0,229,255,0.18)]",
                "transition-all duration-500",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: `${180 + i * 70}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/30 to-transparent opacity-90" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-accent-cyan/30 bg-dark-surface/80 backdrop-blur px-3 py-1 text-xs font-semibold text-accent-cyan">
                    {portfolioCategories.find((c) => c.id === project.category)?.label}
                  </span>
                  <button
                    className="h-9 w-9 rounded-xl bg-dark-surface/80 backdrop-blur border border-dark-border flex items-center justify-center text-text-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:border-accent-cyan/40 hover:text-accent-cyan"
                    aria-label="Zoom gambar"
                  >
                    <ZoomIn className="h-4.5 w-4.5" strokeWidth={2.25} />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(project.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-dark-border/80 bg-dark-surface/60 backdrop-blur px-2.5 py-0.5 text-[11px] text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-display text-white mb-2 drop-shadow-lg leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-text-secondary/90 line-clamp-2 leading-relaxed mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs text-text-secondary/80">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.year}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {project.client}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-cyan opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                      Lihat detail
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-dark-surface border border-dark-border items-center justify-center mb-4 text-text-muted">
              <Tag className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Belum ada proyek</h3>
            <p className="text-text-secondary">
              Untuk kategori ini belum tersedia. Silakan pilih kategori lain.
            </p>
          </div>
        )}
      </section>

      {lightboxOpen && lightboxProject && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col md:flex-row bg-dark-base/98 backdrop-blur-xl transition-opacity duration-300",
            lightboxOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-50 h-11 w-11 rounded-xl bg-dark-surface/90 border border-dark-border flex items-center justify-center text-text-primary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <div className="relative flex-1 min-h-[50vh] md:min-h-0 flex items-center justify-center p-6 md:p-10 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-3 md:left-5 z-20 h-11 w-11 rounded-xl bg-dark-surface/90 border border-dark-border flex items-center justify-center text-text-primary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-3 md:right-5 z-20 h-11 w-11 rounded-xl bg-dark-surface/90 border border-dark-border flex items-center justify-center text-text-primary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
              aria-label="Gambar selanjutnya"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
            </button>

            <img
              src={(lightboxProject.gallery && lightboxProject.gallery[lightboxImageIndex]) || lightboxProject.image}
              alt={`${lightboxProject.title} - gambar ${lightboxImageIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "max-h-[45vh] md:max-h-[85vh] max-w-full object-contain rounded-xl border border-dark-border shadow-2xl",
                lightboxOpen ? "animate-fade-in" : "opacity-0"
              )}
              key={lightboxImageIndex}
            />

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {(lightboxProject.gallery || []).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxImageIndex(idx)
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === lightboxImageIndex
                      ? "w-8 bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                      : "w-2 bg-text-muted/50 hover:bg-text-muted"
                  )}
                  aria-label={`Buka gambar ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div
            className={cn(
              "w-full md:w-[460px] lg:w-[520px] shrink-0 border-t md:border-t-0 md:border-l border-dark-border bg-dark-surface/60 overflow-y-auto animate-fade-in",
              lightboxOpen ? "translate-y-0 md:translate-x-0" : "translate-y-8 md:translate-x-8"
            )}
          >
            <div className="sticky top-0 z-10 bg-dark-surface/95 backdrop-blur-md border-b border-dark-border px-6 py-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan mb-3">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                {portfolioCategories.find((c) => c.id === lightboxProject.category)?.label}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary mb-2">
                {lightboxProject.title}
              </h2>
              <p className="text-sm text-text-muted">
                {lightboxImageIndex + 1} / {(lightboxProject.gallery || []).length} foto
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wider">
                  Tentang Proyek
                </h4>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {lightboxProject.fullDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-surface p-4">
                  <span className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">
                    Klien
                  </span>
                  <span className="block text-sm font-semibold text-text-primary truncate">
                    {lightboxProject.client}
                  </span>
                </div>
                <div className="card-surface p-4">
                  <span className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">
                    Tahun
                  </span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {lightboxProject.year}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wider">
                  Teknologi yang Digunakan
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(lightboxProject.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-dark-border bg-dark-base/40 px-3 py-1 text-xs font-medium text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-surface border-accent-cyan/30 p-5 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5">
                <h4 className="text-sm font-semibold text-accent-cyan mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4" strokeWidth={2.25} />
                  Hasil & Dampak
                </h4>
                <p className="text-[15px] text-text-primary leading-relaxed font-medium">
                  {lightboxProject.result}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link to="/kontak" className="block col-span-full sm:col-span-1">
                  <Button className="w-full">
                    Proyek Serupa?
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
                  </Button>
                </Link>
                <Link to="/portofolio" className="block col-span-full sm:col-span-1">
                  <Button variant="secondary" className="w-full">
                    <ExternalLink className="h-5 w-5" strokeWidth={2.25} />
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <CallToAction />
    </main>
  )
}
