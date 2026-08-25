import { useState, useEffect } from "react"
import { ShieldCheck, Clock, Award, BadgeDollarSign } from "lucide-react"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"
import { defaultAbout } from "../../utils/cmsDefaults"

const values = [
  {
    icon: Award,
    title: "Berpengalaman",
    description: "Tim profesional dengan lebih dari 8+ tahun pengalaman menangani puluhan proyek enterprise & startup.",
    accent: "from-accent-cyan/20 to-accent-cyan/5",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description: "Manajemen proyek agile yang transparan. Kami menjamin delivery sesuai timeline tanpa kompromi kualitas.",
    accent: "from-accent-purple/20 to-accent-purple/5",
  },
  {
    icon: ShieldCheck,
    title: "Kualitas Terjamin",
    description: "Standar industri terbaik, code review ketat, testing menyeluruh, dan dukungan purna jual responsif.",
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: BadgeDollarSign,
    title: "Harga Kompetitif",
    description: "Paket solusi fleksibel yang menyesuaikan skala bisnis. ROI maksimal dengan biaya yang efisien.",
    accent: "from-amber-500/20 to-amber-500/5",
  },
]

export function ValueProposition() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [about, setAbout] = useState(defaultAbout)

  useEffect(() => {
    const saved = localStorage.getItem("cms_about_company")
    if (saved) {
      setAbout(JSON.parse(saved))
    } else {
      localStorage.setItem("cms_about_company", JSON.stringify(defaultAbout))
    }
  }, [])

  if (about.status !== "Published") return null

  return (
    <section id="keunggulan" ref={ref} className="relative section-container">
      <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
        <span
          className={cn("section-label", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "80ms" }}
        >
          Mengapa Memilih Kami
        </span>
        <h2
          className={cn(
            "section-title !mb-5 text-center mx-auto",
            inView ? "animate-fade-up" : "opacity-0"
          )}
          style={{ animationDelay: "160ms" }}
          dangerouslySetInnerHTML={{ __html: about.title }}
        />
        <p
          className={cn("section-subtitle mx-auto text-center", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "220ms" }}
        >
          {about.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
        {values.map((value, i) => {
          const Icon = value.icon
          return (
            <div
              key={value.title}
              className={cn(
                "group relative p-7 card-surface",
                "hover:-translate-y-1.5 hover:border-accent-cyan/40 hover:shadow-[0_15px_45px_rgba(37,99,235,0.1)]",
                "transition-all duration-500",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className={cn(
                  "relative h-16 w-16 rounded-2xl mb-6 flex items-center justify-center",
                  "bg-gradient-to-br",
                  value.accent,
                  "border border-dark-border group-hover:border-accent-cyan/50",
                  "transition-all duration-300 group-hover:scale-105"
                )}
              >
                <Icon className="h-7 w-7 text-accent-cyan" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3 font-display">
                {value.title}
              </h3>
              <p className="text-text-secondary leading-relaxed text-sm">{value.description}</p>
            </div>
          )
        })}
      </div>

      {/* Vision & Mission Row with image */}
      <div
        className={cn(
          "mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-t border-dark-border/40 pt-16 text-left",
          inView ? "animate-fade-up" : "opacity-0"
        )}
        style={{ animationDelay: "600ms" }}
      >
        <div className="lg:col-span-5 h-[320px] rounded-3xl overflow-hidden border border-dark-border shadow-lg relative bg-dark-base">
          <img
            src={about.image}
            alt="Terra Tech"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://placehold.co/600x400/27272a/a1a1aa?text=Terra+Tech"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/60 to-transparent" />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="card-surface p-7 bg-white/40 border-dark-border/50">
            <h3 className="text-xl font-bold text-text-primary font-display flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-accent-cyan" />
              Visi Kami
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm">{about.vision}</p>
          </div>
          <div className="card-surface p-7 bg-white/40 border-dark-border/50">
            <h3 className="text-xl font-bold text-text-primary font-display flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-accent-purple" />
              Misi Kami
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm">{about.mission}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
