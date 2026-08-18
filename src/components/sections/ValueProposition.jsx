import { ShieldCheck, Clock, Award, BadgeDollarSign } from "lucide-react"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"

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
        >
          Keunggulan <span className="glow-text">Terra Tech</span>
        </h2>
        <p
          className={cn("section-subtitle mx-auto text-center", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "220ms" }}
        >
          Kami bukan sekadar vendor, melainkan mitra strategis yang akan membawa bisnis Anda melampaui batasan melalui inovasi teknologi.
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
    </section>
  )
}
