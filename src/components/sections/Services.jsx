import { useState, useEffect } from "react"
import { ArrowUpRight, Code2, Smartphone, Palette, HeadphonesIcon, Database, Cloud, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"
import { defaultServices } from "../../utils/cmsDefaults"

const iconMap = {
  Code2,
  Smartphone,
  Palette,
  HeadphonesIcon,
  Database,
  Cloud
}

export const serviceCategories = [
  { id: "all", label: "Semua" },
  { id: "development", label: "Pengembangan" },
  { id: "design", label: "Desain" },
  { id: "consulting", label: "Konsultasi" },
]

export const servicesData = [
  {
    id: "web-development",
    icon: Code2,
    category: "development",
    image: "https://picsum.photos/seed/terraweb/900/500",
    title: "Web Development",
    description: "Website perusahaan, e-commerce, dan custom web app performa tinggi dengan tech stack modern. SEO-ready dan mobile-first.",
    longDescription: "Kami membangun website yang tidak hanya terlihat modern, tetapi juga cepat, aman, dan terukur. Dari company profile hingga platform e-commerce skala enterprise, setiap proyek dikerjakan dengan standar kode terbaik, praktik SEO, dan optimasi performa. Tech stack utama kami meliputi React, Next.js, Node.js, dan database relasional maupun NoSQL sesuai kebutuhan.",
    badge: "Terlaris",
    badgeClass: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
    features: [
      "Frontend: React, Next.js, TypeScript, Tailwind CSS",
      "Backend: Node.js, Express, NestJS, RESTful & GraphQL API",
      "Database: PostgreSQL, MySQL, MongoDB",
      "SEO Optimization & Core Web Vitals",
      "Mobile Responsive & PWA Ready",
    ],
    benefits: [
      "Performa website loading <2 detik",
      "Skalabilitas untuk jutaan pengguna",
      "Keamanan berlapis (SSL, CORS, sanitasi input)",
      "Maintenance & update berkala",
    ],
    techSpecs: {
      "Frontend Framework": "React 19 / Next.js 15",
      "Backend": "Node.js 20+, NestJS / Express",
      "Database": "PostgreSQL 16 / MongoDB 7",
      "Deployment": "Vercel / AWS / GCP",
      "CI/CD": "GitHub Actions, Docker",
    },
    caseStudy: {
      title: "E-Commerce Fashion Retail",
      description: "Membangun platform e-commerce dengan 100k+ produk terintegrasi payment gateway, inventory system, dan dashboard admin. Meningkatkan konversi 45% dan rata-rata loading page 1.8 detik.",
    },
    priceStart: "Rp 25.000.000",
  },
  {
    id: "mobile-app-development",
    icon: Smartphone,
    category: "development",
    image: "https://picsum.photos/seed/terramobile/900/500",
    title: "Mobile App Development",
    description: "Aplikasi Android & iOS cross-platform dan native. UX halus, stabil, dan siap scaling jutaan user dengan push notification & offline support.",
    longDescription: "Layanan pengembangan aplikasi mobile untuk Android dan iOS dengan pendekatan cross-platform (Flutter, React Native) atau native (Kotlin, Swift). Kami memastikan aplikasi Anda memiliki performa yang smooth, UI/UX yang memanjakan pengguna, stabil di berbagai device, dan siap di-scale untuk jutaan active user. Termasuk integrasi push notification, analytics, dan offline-first architecture.",
    badge: "Baru",
    badgeClass: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
    features: [
      "Cross-platform: Flutter, React Native",
      "Native: Kotlin (Android), Swift (iOS)",
      "Push Notification & Deep Linking",
      "Offline Storage & Sync",
      "App Store & Play Store Deployment",
    ],
    benefits: [
      "Satu codebase untuk 2 platform (cross-platform)",
      "Performa mendekati native",
      "Crash rate <0.5%",
      "Integrasi mudah dengan backend existing",
    ],
    techSpecs: {
      "Cross-platform": "Flutter 3.x / React Native 0.76+",
      "Native Android": "Kotlin, Jetpack Compose",
      "Native iOS": "Swift, SwiftUI",
      "State Management": "Bloc / Riverpod / Redux",
      "Backend Integration": "REST API, GraphQL, Firebase",
    },
    caseStudy: {
      title: "Fintech Wallet App",
      description: "Aplikasi dompet digital dengan fitur transfer, top-up, payment QRIS, dan virtual account. Berhasil onboarding 50rb+ user dalam 3 bulan pertama dengan rating Play Store 4.7/5.",
    },
    priceStart: "Rp 40.000.000",
  },
  {
    id: "ui-ux-design",
    icon: Palette,
    category: "design",
    image: "https://picsum.photos/seed/terradesign/900/500",
    title: "UI / UX Design",
    description: "Desain antarmuka modern, user-friendly, dan on-brand. Dari riset pengguna, wireframe, hingga design system production-ready.",
    longDescription: "Tim desain kami mengubah ide abstrak menjadi pengalaman pengguna yang intuitif dan menyenangkan. Mulai dari user research, persona mapping, user flow, wireframe low-high fidelity, prototype interaktif, hingga design system yang reusable untuk developer. Setiap keputusan desain berbasis data dan testing, bukan hanya estetika semata.",
    badge: null,
    badgeClass: "",
    features: [
      "User Research & Persona Mapping",
      "Wireframe Low-High Fidelity",
      "Prototype Interaktif (Figma)",
      "Design System & Component Library",
      "Usability Testing & Iteration",
    ],
    benefits: [
      "Meningkatkan user retention hingga 30%",
      "Mengurangi learning curve pengguna",
      "Konsistensi brand di semua touchpoint",
      "Handoff mudah dengan developer",
    ],
    techSpecs: {
      "Tools": "Figma, Maze, Hotjar, Adobe Illustrator",
      "Design System": "Custom Token-based System",
      "Prototype": "Figma Interactive + Micro-interactions",
      "Handoff Format": "Figma Dev Mode, Storybook",
      "Accessibility": "WCAG 2.1 AA Compliance",
    },
    caseStudy: {
      title: "Redesign Dashboard SaaS HRIS",
      description: "Redesign dashboard HRIS untuk 5000+ employee. Setelah usability testing, task completion rate naik dari 68% menjadi 94% dan rata-rata waktu operasional turun 40%.",
    },
    priceStart: "Rp 15.000.000",
  },
  {
    id: "it-consulting-support",
    icon: HeadphonesIcon,
    category: "consulting",
    image: "https://picsum.photos/seed/terrait/900/500",
    title: "IT Consulting & Support",
    description: "Konsultasi arsitektur sistem, migrasi cloud, DevOps, dan tim support standby 24/7 untuk kelancaran operasional sistem produksi Anda.",
    longDescription: "Dapatkan panduan dari senior tech consultant untuk merancang arsitektur sistem yang scalable, melakukan migrasi cloud dengan zero/minimal downtime, menerapkan DevOps best practice, dan mendapatkan dukungan teknis 24/7. Cocok untuk perusahaan yang ingin memodernisasi infrastruktur IT tanpa mengganggu operasional bisnis.",
    badge: "Enterprise",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    features: [
      "Arsitektur Sistem & Tech Stack Advisory",
      "Cloud Migration (AWS, GCP, Azure)",
      "DevOps & CI/CD Pipeline Setup",
      "Security Audit & Penetration Testing",
      "Technical Support 24/7 On-Call",
    ],
    benefits: [
      "Mengurangi downtime sistem hingga 80%",
      "Efisiensi biaya infrastruktur 30-50%",
      "Mitigasi risiko keamanan data",
      "Akses senior engineer on-demand",
    ],
    techSpecs: {
      "Cloud Provider": "AWS, GCP, Alibaba Cloud, Azure",
      "Containerization": "Docker, Kubernetes, ECS",
      "IaC": "Terraform, Pulumi, Ansible",
      "Monitoring": "Prometheus, Grafana, Sentry, New Relic",
      "Security": "OWASP Top 10, WAF, Zero Trust",
    },
    caseStudy: {
      title: "Cloud Migration Fintech Unicorn",
      description: "Migrasi infrastruktur on-prem ke AWS dengan zero-downtime strategy. Hasil: saving biaya server 42%, auto-scaling handle 10x traffic, dan MTTR incident turun dari 2 jam menjadi 8 menit.",
    },
    priceStart: "Rp 50.000.000",
  },
  {
    id: "database-management",
    icon: Database,
    category: "consulting",
    image: "https://picsum.photos/seed/terradb/900/500",
    title: "Database Management",
    description: "Optimasi performa database, desain skala enterprise, migration, backup & disaster recovery untuk data mission-critical.",
    longDescription: "Layanan manajemen database end-to-end: dari desain schema yang efisien, query optimization, indexing strategy, replication & sharding untuk skala besar, backup otomatis, dan disaster recovery plan dengan RPO <1 menit. Tim kami bersertifikasi PostgreSQL, MongoDB, dan Redis.",
    badge: null,
    badgeClass: "",
    features: [
      "Schema Design & Normalization",
      "Query Optimization & Index Tuning",
      "Replication, Sharding & Clustering",
      "Automated Backup & Point-in-Time Recovery",
      "Database Audit & Health Check",
    ],
    benefits: [
      "Query speedup 5x-50x",
      "Uptime database 99.99% SLA",
      "Hemat storage 30-60%",
      "Data loss risk minimal",
    ],
    techSpecs: {
      "RDBMS": "PostgreSQL 16, MySQL 8, SQL Server",
      "NoSQL": "MongoDB 7, Redis 7, Cassandra",
      "Data Warehouse": "BigQuery, Snowflake, Redshift",
      "Backup Tool": "pgBackRest, Percona, mongodump",
      "Monitoring": "pg_stat_statements, PMM, Datadog",
    },
    caseStudy: {
      title: "DB Optimization Marketplace",
      description: "Optimasi database PostgreSQL marketplace yang menangani 100k+ transaksi/hari. Setelah tuning & indexing, query checkout turun dari 1200ms menjadi 80ms, sehingga menaikkan conversion rate.",
    },
    priceStart: "Rp 20.000.000",
  },
  {
    id: "cloud-infrastructure",
    icon: Cloud,
    category: "development",
    image: "https://picsum.photos/seed/terracloud/900/500",
    title: "Cloud Infrastructure",
    description: "Arsitektur cloud yang scalable, secure, dan cost-efficient di AWS, GCP, atau Azure dengan Infrastructure as Code (IaC).",
    longDescription: "Bangun fondasi cloud yang reliable untuk aplikasi bisnis Anda. Kami bantu merancang VPC, subnet, security group, load balancer, CDN, object storage, dan auto-scaling group dengan prinsip Well-Architected Framework. Semua dikelola dengan Terraform/Pulumi untuk reproducibility dan version control.",
    badge: null,
    badgeClass: "",
    features: [
      "AWS / GCP / Azure Architecture Design",
      "Infrastructure as Code (Terraform, Pulumi)",
      "Kubernetes & Container Orchestration",
      "CDN & Edge Computing (Cloudflare, Akamai)",
      "Cost Optimization & FinOps",
    ],
    benefits: [
      "Auto-scale handle traffic spike",
      "Saving cost cloud 30-50%",
      "Zero-downtime deployment dengan Blue/Green",
      "Keamanan jaringan berlapis",
    ],
    techSpecs: {
      "IaC": "Terraform 1.x, Pulumi, AWS CDK",
      "Orchestration": "EKS, GKE, AKS, Docker Swarm",
      "CDN": "Cloudflare, AWS CloudFront, GCP CDN",
      "Storage": "S3, GCS, Blob Storage, EFS",
      "Networking": "VPC, VPN, Direct Connect, WAF",
    },
    caseStudy: {
      title: "Multi-Cloud Architecture EdTech",
      description: "Rancang arsitektur multi-cloud AWS + GCP untuk platform EdTech dengan 2jt+ user. High availability cross-region, RTO <30 menit, dan biaya operasional 35% lebih efisien.",
    },
    priceStart: "Rp 35.000.000",
  },
]

export function Services({ showFilters = true, maxItems = null }) {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true })
  const [activeCategory, setActiveCategory] = useState("all")
  const [servicesList, setServicesList] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("cms_services")
    if (saved) {
      setServicesList(JSON.parse(saved))
    } else {
      setServicesList(defaultServices)
      localStorage.setItem("cms_services", JSON.stringify(defaultServices))
    }
  }, [])

  const activeServices = servicesList
    .filter((s) => s.status === "Published")
    .map((s) => {
      let normalizedId = s.id
      if (s.id === "mobile-development") normalizedId = "mobile-app-development"
      if (s.id === "uiux-design") normalizedId = "ui-ux-design"
      
      const originalDefault = servicesData.find((ds) => ds.id === normalizedId) || servicesData[0]
      return {
        ...originalDefault,
        ...s,
        id: normalizedId,
        title: s.name,
        icon: iconMap[s.icon] || Code2
      }
    })

  const filteredServices = activeServices.filter(
    (svc) => activeCategory === "all" || svc.category === activeCategory
  )

  const displayServices = maxItems ? filteredServices.slice(0, maxItems) : filteredServices

  return (
    <section id="layanan" ref={ref} className="relative section-container">
      <div className="absolute inset-x-0 top-24 -z-10 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 md:mb-16">
        <div className="max-w-2xl">
          <span
            className={cn("section-label", inView ? "animate-fade-up" : "opacity-0")}
            style={{ animationDelay: "80ms" }}
          >
            Layanan Kami
          </span>
          <h2
            className={cn("section-title !mb-5", inView ? "animate-fade-up" : "opacity-0")}
            style={{ animationDelay: "160ms" }}
          >
            Solusi Digital <span className="glow-text">End-to-End</span>
          </h2>
          <p
            className={cn("section-subtitle", inView ? "animate-fade-up" : "opacity-0")}
            style={{ animationDelay: "220ms" }}
          >
            Satu mitra untuk seluruh kebutuhan digital bisnis Anda. Dari tahap perencanaan, pengembangan, hingga pemeliharaan jangka panjang.
          </p>
        </div>
        <Link
          to="/kontak"
          className={cn(
            "group inline-flex items-center gap-2 text-accent-cyan font-semibold",
            "hover:gap-3 transition-all w-fit",
            inView ? "animate-fade-up" : "opacity-0"
          )}
          style={{ animationDelay: "280ms" }}
        >
          Butuh solusi kustom? Diskusikan sekarang
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>

      {showFilters && (
        <div
          className={cn(
            "flex flex-wrap gap-3 mb-10",
            inView ? "animate-fade-up" : "opacity-0"
          )}
          style={{ animationDelay: "300ms" }}
        >
          {serviceCategories.map((cat) => (
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
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
        {displayServices.map((svc, i) => {
          const Icon = svc.icon
          return (
            <Card
              key={svc.id}
              className={cn(
                "group overflow-hidden flex flex-col",
                "hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-[0_20px_60px_rgba(37,99,235,0.15)]",
                "transition-all duration-500",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: `${320 + i * 90}ms` }}
            >
              <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                <img
                  src={svc.image}
                  alt={svc.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-dark-surface/80 backdrop-blur border border-dark-border flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent-cyan" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold text-white font-display drop-shadow">
                    {svc.title}
                  </h3>
                </div>
                {svc.badge && (
                  <span
                    className={cn(
                      "absolute top-4 right-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur",
                      svc.badgeClass
                    )}
                  >
                    {svc.badge}
                  </span>
                )}
              </div>
              <CardContent className="p-7 pt-6 space-y-5 flex-1 flex flex-col">
                <p className="text-text-secondary leading-relaxed">
                  {svc.description}
                </p>

                <ul className="space-y-2.5">
                  {svc.features && svc.features.slice(0, 4).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4.5 w-4.5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5 border-t border-dark-border/70 flex items-center justify-between">
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wider mb-1">Mulai dari</span>
                    <span className="text-lg font-bold text-text-primary font-display">{svc.priceStart}</span>
                  </div>
                  <Link to={`/layanan/${svc.id}`}>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-accent-cyan group/btn"
                    >
                      Detail
                      <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
