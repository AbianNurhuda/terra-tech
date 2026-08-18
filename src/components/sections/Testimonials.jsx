import * as React from "react"
import { Quote } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/components/ui/Carousel"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"

const testimonials = [
  {
    name: "Andi Pratama",
    title: "CEO, Nusantara E-Commerce",
    avatar: "https://picsum.photos/seed/terra1/160/160",
    content:
      "Terra Tech benar-benar mengubah cara bisnis kami beroperasi. Website baru meningkatkan konversi 3x lipat. Timnya responsif, detail, dan sangat profesional. Rekomendasi terbaik!",
    rating: 5,
    accent: "border-accent-cyan/40",
  },
  {
    name: "Siti Rahmawati",
    title: "Direktur Operasional, Logistik Hub",
    avatar: "https://picsum.photos/seed/terra2/160/160",
    content:
      "Pengembangan mobile app internal kami selesai tepat waktu. Fitur sesuai ekspektasi, bahkan melebihi. Support after-sales cepat, bug langsung dibetulkan dalam hitungan jam.",
    rating: 5,
    accent: "border-accent-purple/40",
  },
  {
    name: "Reynaldi Wijaya",
    title: "CTO, FinTech Startup",
    avatar: "https://picsum.photos/seed/terra3/160/160",
    content:
      "Arsitektur sistem yang direkomendasikan Terra Tech solid banget. Dari 20k menjadi 300k concurrent users tanpa masalah. Konsultasi IT mereka benar-benar berkelas.",
    rating: 5,
    accent: "border-emerald-500/40",
  },
  {
    name: "Dewi Lestari",
    title: "Founder, Fashion Brand Lokal",
    avatar: "https://picsum.photos/seed/terra4/160/160",
    content:
      "Desain UI/UX yang dibuat sangat user friendly. Sejak launch toko online dari Terra Tech, omzet mingguan kami bertambah 170%. Worth every penny!",
    rating: 5,
    accent: "border-amber-500/40",
  },
  {
    name: "Budi Santoso",
    title: "General Manager, Ritel Chain",
    avatar: "https://picsum.photos/seed/terra5/160/160",
    content:
      "Integrasi sistem POS dengan inventory berhasil. Sebelumnya ribet manual, sekarang semua realtime dalam satu dashboard. Produktivitas cabang meningkat drastis.",
    rating: 5,
    accent: "border-sky-500/40",
  },
]

function StarRating({ count = 5 }) {
  return (
    <div className="flex items-center gap-1 text-rating-yellow">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M10.868 2.464c.27-.842 1.494-.842 1.764 0l1.473 4.536a1 1 0 00.95.692h4.771c.88 0 1.245 1.127.537 1.652l-3.864 2.807a1 1 0 00-.363 1.119l1.472 4.536c.27.842-.723 1.54-1.43 1.042l-3.865-2.807a1 1 0 00-1.175 0l-3.865 2.807c-.706.498-1.7-.199-1.43-1.042l1.472-4.536a1 1 0 00-.363-1.119L2.636 9.344c-.708-.525-.343-1.652.537-1.652h4.771a1 1 0 00.95-.692l1.474-4.536z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [api, setApi] = React.useState(null)

  React.useEffect(() => {
    if (!api) return
    const timer = setInterval(() => {
      api.scrollNext()
    }, 6000)
    return () => clearInterval(timer)
  }, [api])

  return (
    <section id="testimoni" ref={ref} className="relative section-container">
      <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent -z-10" />
      <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
        <span
          className={cn("section-label", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "80ms" }}
        >
          Testimoni Klien
        </span>
        <h2
          className={cn(
            "section-title !mb-5 text-center mx-auto",
            inView ? "animate-fade-up" : "opacity-0"
          )}
          style={{ animationDelay: "160ms" }}
        >
          Apa Kata <span className="glow-text">Klien Kami</span>
        </h2>
        <p
          className={cn("section-subtitle mx-auto text-center", inView ? "animate-fade-up" : "opacity-0")}
          style={{ animationDelay: "220ms" }}
        >
          Kisah sukses kolaborasi Terra Tech dengan bisnis dari berbagai skala dan industri.
        </p>
      </div>

      <div
        className={cn(
          "relative max-w-5xl mx-auto",
          inView ? "animate-fade-up" : "opacity-0"
        )}
        style={{ animationDelay: "280ms" }}
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
            startIndex: 0,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((t, i) => (
              <CarouselItem
                key={i}
                className="pl-2 md:pl-4 md:basis-1/2 xl:basis-1/2"
              >
                <div
                  className={cn(
                    "relative h-full p-7 md:p-9 rounded-3xl bg-dark-surface/90 border backdrop-blur-sm",
                    "transition-all duration-500 hover:-translate-y-1",
                    "shadow-[0_10px_40px_rgba(15,23,42,0.08)]",
                    t.accent,
                    "hover:shadow-[0_20px_60px_rgba(37,99,235,0.12)]"
                  )}
                >
                  <Quote
                    className="absolute top-6 right-6 h-10 w-10 text-accent-cyan/20"
                    strokeWidth={1.5}
                  />
                  <StarRating count={t.rating} />
                  <p className="mt-5 text-text-secondary leading-relaxed text-[15px] md:text-base min-h-[96px]">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-7 pt-6 border-t border-dark-border/70 flex items-center gap-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      className="h-13 w-13 h-[52px] w-[52px] rounded-full object-cover ring-2 ring-dark-border"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary font-display truncate">
                        {t.name}
                      </p>
                      <p className="text-sm text-text-muted truncate">{t.title}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
          <CarouselDots />
        </Carousel>
      </div>
    </section>
  )
}
