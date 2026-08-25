import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Cpu,
  CaseSensitive,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { servicesData } from "@/components/sections/Services"
import { CallToAction } from "@/components/sections/CallToAction"
import { cn } from "@/utils/cn"

export function ServiceDetailPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const service = servicesData.find((s) => s.id === serviceId)

  if (!service) {
    return (
      <main className="relative pt-28 min-h-screen">
        <section className="container py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h1 className="section-title mb-5">Layanan Tidak Ditemukan</h1>
            <p className="section-subtitle mx-auto mb-8">
              Layanan yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Link to="/layanan">
              <Button>
                <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
                Kembali ke Daftar Layanan
              </Button>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const Icon = service.icon
  const relatedServices = servicesData.filter((s) => s.id !== service.id).slice(0, 3)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="relative pt-28">
      <section className="container py-10 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-text-secondary hover:text-accent-cyan font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" strokeWidth={2.25} />
          Kembali ke layanan
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-dark-border mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,229,255,0.2),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.18),_transparent_55%)]" />
          <div className="relative aspect-[21/9] overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/50 to-transparent" />
          </div>

          <div className="relative p-7 md:p-10 -mt-32 md:-mt-44">
            <div className="flex flex-wrap items-start justify-between gap-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-dark-surface/90 backdrop-blur border border-dark-border flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                  <Icon className="h-8 w-8 md:h-10 md:w-10 text-accent-cyan" strokeWidth={2} />
                </div>
                <div>
                  {service.badge && (
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-3",
                      service.badgeClass
                    )}>
                      {service.badge}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-bold font-display text-text-primary mb-2">
                    {service.title}
                  </h1>
                  <p className="text-text-secondary text-base md:text-lg max-w-2xl">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0 card-surface px-6 py-5">
                <span className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Investasi mulai dari</span>
                <span className="text-2xl md:text-3xl font-bold font-display text-accent-cyan glow-text">
                  {service.priceStart}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/kontak?layanan=${service.id}`}>
                <Button size="lg" className="gap-2.5">
                  <MessageSquare className="h-5 w-5" strokeWidth={2.25} />
                  Ajukan Penawaran
                  <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                </Button>
              </Link>
              <a
                href="#fitur"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <Button variant="secondary" size="lg">
                  Lihat Detail Fitur
                  <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <section id="deskripsi" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-cyan" strokeWidth={2.25} />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary">
                  Deskripsi Lengkap
                </h2>
              </div>
              <div className="card-surface p-7 space-y-4 leading-relaxed text-text-secondary text-[15px]">
                <p>{service.longDescription}</p>
                <p>
                  Dengan pendekatan kolaboratif yang transparan, kami melibatkan Anda di setiap tahap
                  — mulai dari discovery, prototipe, pengembangan, testing, sampai launch dan optimasi
                  pasca-rilis. Setiap milestone dilengkapi dengan demo, dokumentasi, dan ruang untuk
                  feedback agar hasil akhir benar-benar sesuai ekspektasi dan kebutuhan bisnis Anda.
                </p>
              </div>
            </section>

            <section id="fitur" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-accent-purple" strokeWidth={2.25} />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary">
                  Fitur Layanan
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feat, i) => (
                  <div key={i} className="card-surface p-5 flex items-start gap-3.5">
                    <CheckCircle2 className="h-5.5 w-5.5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                    <span className="text-text-secondary leading-relaxed text-[15px]">{feat}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="manfaat" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2.25} />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary">
                  Manfaat untuk Bisnis Anda
                </h2>
              </div>
              <Card>
                <CardContent className="p-7">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3.5">
                        <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-dark-border flex items-center justify-center text-accent-cyan font-bold text-sm font-display">
                          {i + 1}
                        </div>
                        <span className="text-text-secondary leading-relaxed text-[15px]">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="spesifikasi" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-accent-cyan" strokeWidth={2.25} />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary">
                  Spesifikasi Teknis
                </h2>
              </div>
              <Card>
                <CardContent className="p-0 overflow-hidden">
                  <div className="divide-y divide-dark-border">
                    {Object.entries(service.techSpecs).map(([key, value], i) => (
                      <div
                        key={key}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center px-7 py-5 gap-2 sm:gap-6 group",
                          i % 2 === 0 ? "bg-dark-surface" : "bg-dark-surface/50"
                        )}
                      >
                        <span className="text-text-muted text-sm uppercase tracking-wider sm:w-1/3 shrink-0">
                          {key}
                        </span>
                        <div className="flex items-center justify-between sm:w-2/3 gap-3">
                          <code
                            onClick={() => copyToClipboard(value)}
                            className="text-text-primary font-medium cursor-pointer hover:text-accent-cyan transition-colors select-all"
                            title="Klik untuk salin"
                          >
                            {value}
                          </code>
                          {copied && (
                            <span className="text-xs text-accent-cyan font-medium animate-fade-in">
                              Disalin!
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="studi-kasus" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center">
                  <CaseSensitive className="h-5 w-5 text-accent-purple" strokeWidth={2.25} />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-text-primary">
                  Studi Kasus Terkait
                </h2>
              </div>
              <Card className="group overflow-hidden hover:border-accent-cyan/40 transition-all duration-500">
                <div className="grid grid-cols-1 md:grid-cols-5">
                  <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${service.id}case/800/600`}
                      alt={service.caseStudy.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/60 via-transparent to-transparent md:bg-gradient-to-t" />
                  </div>
                  <div className="md:col-span-3">
                    <CardHeader className="pb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan w-fit mb-2">
                        Case Study
                      </span>
                      <CardTitle className="text-2xl">{service.caseStudy.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-7">
                      <p className="text-text-secondary leading-relaxed mb-6">
                        {service.caseStudy.description}
                      </p>
                      <Link to="/portofolio">
                        <Button variant="link" className="h-auto p-0 gap-2">
                          Lihat studi kasus lengkap
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </section>
          </div>

          <aside className="space-y-6 sticky top-28">
            <Card className="border-accent-cyan/30 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan" />
              <CardHeader className="pb-4 pt-7">
                <CardTitle className="text-xl">Tertarik dengan layanan ini?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Konsultasikan kebutuhan proyek Anda dengan tim ahli kami. Gratis tanpa kewajiban.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                    <span className="text-text-secondary">Konsultasi gratis 30 menit</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                    <span className="text-text-secondary">Proposal & estimasi harga detail</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                    <span className="text-text-secondary">Timeline & milestone jelas</span>
                  </li>
                </ul>
                <Link to={`/kontak?layanan=${service.id}`} className="block">
                  <Button className="w-full">
                    Ajukan Penawaran
                    <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                  </Button>
                </Link>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Terra%20Tech%2C%20saya%20tertarik%20dengan%20layanan%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="secondary" className="w-full">
                    Chat via WhatsApp
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Layanan Lainnya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-7">
                {relatedServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/layanan/${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-dark-border bg-dark-base/30 px-4 py-3 hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 group-hover:border-accent-cyan/40 transition-colors">
                      {(() => {
                        const RelIcon = s.icon
                        return <RelIcon className="h-5 w-5 text-accent-cyan" strokeWidth={2} />
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-text-primary truncate">
                        {s.title}
                      </span>
                      <span className="block text-xs text-text-muted truncate">
                        {s.priceStart}
                      </span>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-text-muted group-hover:text-accent-cyan transition-colors shrink-0" strokeWidth={2.25} />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <CallToAction />
    </main>
  )
}
