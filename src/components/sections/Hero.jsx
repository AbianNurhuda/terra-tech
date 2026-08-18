import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"

export function Hero() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-28 pb-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 h-[480px] w-[480px] rounded-full bg-accent-cyan/18 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[520px] w-[520px] rounded-full bg-accent-purple/16 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-dark-border bg-dark-surface/60 px-4 py-1.5 text-sm text-text-secondary backdrop-blur",
              inView ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: "80ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
            </span>
            Tersedia untuk proyek baru 2026
          </div>

          <div className="space-y-5">
            <h1
              className={cn(
                "font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-text-primary",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: "160ms" }}
            >
              Bangun Solusi Digital{" "}
              <span className="glow-text">Terpercaya</span> untuk Bisnis Masa Depan
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: "240ms" }}
            >
              Terra Tech membantu perusahaan transformasi digital dengan layanan pengembangan web, aplikasi mobile, desain UI/UX, dan konsultasi IT berkualitas enterprise.
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start",
              inView ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: "320ms" }}
          >
            <a href="#layanan" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Proyek Anda
                <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
              </Button>
            </a>
            <a href="#testimoni" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Play className="h-5 w-5" strokeWidth={2.25} />
                Lihat Testimoni
              </Button>
            </a>
          </div>

          <div
            className={cn(
              "flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 pt-6 border-t border-dark-border/60",
              inView ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center -space-x-2">
              {[30, 50, 70, 90, 110].map((seed) => (
                <img
                  key={seed}
                  src={`https://picsum.photos/seed/terra${seed}/80/80`}
                  alt="Klien"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-dark-base"
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-rating-yellow">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.372 2.452a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.372-2.452a1 1 0 00-1.175 0l-3.372 2.452c-.784.57-1.838-.197-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.966z" />
                  </svg>
                ))}
                <span className="ml-1 font-semibold text-text-primary">4.9</span>
              </div>
              <p className="text-text-muted">Dari 150+ klien puas</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative",
            inView ? "animate-fade-in" : "opacity-0"
          )}
          style={{ animationDelay: "300ms" }}
        >
          <div className="relative mx-auto max-w-[520px] aspect-[4/5] w-full">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent-cyan/25 via-accent-purple/15 to-transparent blur-2xl" />
            <div className="relative h-full w-full card-surface overflow-hidden animate-float shadow-[0_20px_60px_rgba(37,99,235,0.15)] border border-accent-cyan/15">
              <img
                src="https://picsum.photos/seed/terrahero/1000/1250"
                alt="Tim Terra Tech bekerja"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/85 via-dark-surface/20 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-xl bg-dark-surface/85 backdrop-blur px-3 py-2 border border-dark-border shadow-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-text-secondary font-medium">Live: 8 Proyek Aktif</span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-dark-surface/90 backdrop-blur-xl p-4 border border-dark-border shadow-[0_10px_40px_rgba(37,99,235,0.1)]">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-white">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary font-display">Performance Proyek</p>
                    <p className="text-xs text-text-muted">Pencapaian Q3 2026</p>
                  </div>
                  <span className="text-xl font-bold text-accent-cyan font-display">+127%</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-dark-border overflow-hidden">
                  <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
