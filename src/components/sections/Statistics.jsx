import { useEffect, useState } from "react"
import { Users, Trophy, Briefcase, Calendar } from "lucide-react"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"

const stats = [
  {
    icon: Users,
    value: 150,
    suffix: "+",
    label: "Klien Puas",
    description: "Dari berbagai industri di seluruh Indonesia",
  },
  {
    icon: Trophy,
    value: 99,
    suffix: "%",
    label: "Tingkat Kepuasan",
    description: "Berdasarkan survei klien setelah proyek selesai",
  },
  {
    icon: Briefcase,
    value: 50,
    suffix: "+",
    label: "Proyek Berhasil",
    description: "Web, mobile app, hingga sistem enterprise skala besar",
  },
  {
    icon: Calendar,
    value: 8,
    suffix: "+",
    label: "Tahun Pengalaman",
    description: "Tim ahli yang terus berkembang sejak 2018",
  },
]

function Counter({ value, suffix = "", trigger, duration = 1600 }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let start = 0
    const startTime = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * value)
      setCurrent(start)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [trigger, value, duration])

  return (
    <span>
      {current}
      <span className="text-accent-cyan">{suffix}</span>
    </span>
  )
}

export function Statistics() {
  const [ref, inView] = useInView({ threshold: 0.25, triggerOnce: true })

  return (
    <section id="statistik" ref={ref} className="relative overflow-hidden py-24 md:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-dark-surface/40 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-accent-cyan/8 blur-[120px] -z-10" />

      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <span
            className={cn("section-label", inView ? "animate-fade-up" : "opacity-0")}
            style={{ animationDelay: "80ms" }}
          >
            Track Record Kami
          </span>
          <h2
            className={cn(
              "section-title !mb-5 text-center mx-auto",
              inView ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: "160ms" }}
          >
            Angka yang <span className="glow-text">Berbicara</span>
          </h2>
          <p
            className={cn("section-subtitle mx-auto text-center", inView ? "animate-fade-up" : "opacity-0")}
            style={{ animationDelay: "220ms" }}
          >
            Pencapaian ini adalah hasil dedikasi tim dan kepercayaan klien-klien kami selama bertahun-tahun.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={cn(
                  "relative p-7 md:p-8 rounded-3xl border border-dark-border bg-dark-surface/80 backdrop-blur text-center",
                  "hover:-translate-y-1 hover:border-accent-cyan/40 hover:shadow-[0_15px_50px_rgba(37,99,235,0.1)] transition-all duration-500",
                  inView ? "animate-fade-up" : "opacity-0"
                )}
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-accent-cyan/8 via-transparent to-transparent pointer-events-none" />
                <div className="relative h-14 w-14 mx-auto mb-5 rounded-2xl bg-dark-base border border-dark-border flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Icon className="h-7 w-7 text-accent-cyan" strokeWidth={2} />
                </div>
                <div className="relative font-display font-bold text-4xl md:text-5xl lg:text-6xl text-text-primary mb-2 leading-none">
                  <Counter trigger={inView} value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="relative text-lg font-semibold text-text-primary mb-2">
                  {stat.label}
                </div>
                <p className="relative text-sm text-text-muted leading-relaxed">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
