import { CheckCircle2, X, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"
import { Link } from "react-router-dom"

const pricingPlans = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Untuk startup & UMKM baru mulai",
    price: "Rp 15.000.000",
    period: "/proyek",
    description: "Cocok untuk website company profile sederhana atau MVP dengan fitur dasar.",
    features: [
      { name: "1 Halaman Landing Page / Website", included: true },
      { name: "Responsive Mobile & Desktop", included: true },
      { name: "UI Design 3 Revisi", included: true },
      { name: "Basic SEO Setup", included: true },
      { name: "Integrasi WhatsApp/Email", included: true },
      { name: "Google Analytics", included: true },
      { name: "Source Code & Deployment", included: true },
      { name: "2 Minggu Purna Jual", included: true },
      { name: "Custom Web App / Dashboard", included: false },
      { name: "CMS / Admin Panel", included: false },
      { name: "Priority Support 24/7", included: false },
    ],
    cta: "Pilih Basic",
    ctaHref: "/kontak?paket=basic",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Paling populer untuk bisnis berkembang",
    price: "Rp 45.000.000",
    period: "/proyek",
    description: "Solusi lengkap untuk perusahaan yang butuh aplikasi custom & scalable.",
    badge: "Paling Diminati",
    features: [
      { name: "Hingga 15 Halaman / Modul", included: true },
      { name: "UI/UX Design + Prototype", included: true },
      { name: "Frontend + Backend + Database", included: true },
      { name: "Admin Panel / CMS", included: true },
      { name: "Advanced SEO + Performance", included: true },
      { name: "Integrasi Payment Gateway", included: true },
      { name: "Integrasi API Pihak Ketiga", included: true },
      { name: "1 Bulan Purna Jual Gratis", included: true },
      { name: "User Authentication System", included: true },
      { name: "Cloud Hosting Setup (AWS/Vercel)", included: true },
      { name: "Priority Support 24/7", included: false },
    ],
    cta: "Pilih Pro",
    ctaHref: "/kontak?paket=pro",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Kustom untuk skala korporasi",
    price: "Hubungi Kami",
    period: "",
    description: "Solusi enterprise dengan SLA, on-call support, dan dedicated team untuk project besar.",
    features: [
      { name: "Unlimited Halaman / Modul", included: true },
      { name: "Custom Design System", included: true },
      { name: "Microservices Architecture", included: true },
      { name: "Multi-tenant / Role Access", included: true },
      { name: "Enterprise-grade Security", included: true },
      { name: "SLA 99.99% Uptime", included: true },
      { name: "Dedicated Project Manager", included: true },
      { name: "On-call Support 24/7", included: true },
      { name: "Disaster Recovery & Backup", included: true },
      { name: "Training & Knowledge Transfer", included: true },
      { name: "NDA & Kontrak Formal", included: true },
    ],
    cta: "Ajukan Penawaran",
    ctaHref: "/kontak?paket=enterprise",
    highlight: false,
  },
]

export function Pricing() {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true })

  return (
    <section id="harga" ref={ref} className="relative section-container">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />

      <div className="max-w-2xl mb-14 md:mb-16 text-center mx-auto">
        <span
          className={cn("section-label", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "80ms" }}
        >
          Harga Paket
        </span>
        <h2
          className={cn("section-title !mb-5 mx-auto", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "160ms" }}
        >
          Pilih Paket <span className="glow-text">Terbaik</span> untuk Bisnis Anda
        </h2>
        <p
          className={cn("section-subtitle mx-auto text-center", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "220ms" }}
        >
          Transparan tanpa biaya tersembunyi. Butuh penyesuaian? Tim kami siap bikin penawaran kustom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
        {pricingPlans.map((plan, i) => (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col",
              plan.highlight && "lg:-translate-y-4 lg:scale-[1.02] border-accent-cyan/50 shadow-[0_20px_70px_rgba(37,99,235,0.18)]",
              "hover:-translate-y-1 hover:border-accent-cyan/40 transition-all duration-500",
              inView ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: `${280 + i * 110}ms` }}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-4 py-1.5 text-xs font-bold text-dark-base shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {plan.badge}
                </span>
              </div>
            )}

            {plan.highlight && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent-cyan/8 via-transparent to-accent-purple/8 pointer-events-none -z-0" />
            )}

            <CardHeader className={cn("pb-5 relative z-10", plan.highlight && "pt-8")}>
              <div className="mb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <p className="text-sm text-text-muted">{plan.tagline}</p>
              </div>
              <div className="flex items-end gap-1 mb-4">
                <span className={cn(
                  "text-4xl md:text-5xl font-bold font-display",
                  plan.highlight ? "text-accent-cyan glow-text" : "text-text-primary"
                )}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-text-muted text-sm pb-2 ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{plan.description}</p>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col flex-1 relative z-10">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 text-sm",
                      feature.included ? "text-text-secondary" : "text-text-muted/60"
                    )}
                  >
                    {feature.included ? (
                      <CheckCircle2 className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" strokeWidth={2.25} />
                    ) : (
                      <X className="h-5 w-5 shrink-0 mt-0.5 text-text-muted/50" strokeWidth={2} />
                    )}
                    <span className="leading-relaxed">{feature.name}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link to={plan.ctaHref} className="block">
                  <Button
                    variant={plan.highlight ? "default" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        className={cn(
          "mt-14 text-center text-sm text-text-muted",
          inView ? "animate-fade-up" : "opacity-0"
        )}
        style={{ animationDelay: "700ms" }}
      >
        Harga di atas bersifat estimasi. Untuk kebutuhan kustom, dapat{" "}
        <Link to="/kontak" className="text-accent-cyan hover:underline font-medium">
          menghubungi tim kami
        </Link>{" "}
        untuk penawaran yang lebih detail.
      </div>
    </section>
  )
}
