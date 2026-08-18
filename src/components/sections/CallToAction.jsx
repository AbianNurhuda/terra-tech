import { ArrowRight, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useInView } from "@/hooks/useInView"
import { cn } from "@/utils/cn"

export function CallToAction() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 -z-10 bg-dark-surface" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.16),_transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.05] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container">
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-accent-cyan/25 bg-gradient-to-br from-dark-surface/95 via-dark-base to-dark-surface/95 backdrop-blur p-8 md:p-14 lg:p-16 shadow-[0_20px_80px_rgba(37,99,235,0.12)]">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan" />
          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-accent-cyan/18 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-purple/15 blur-[120px]" />

          <div className="relative grid lg:grid-cols-[1.3fr,1fr] gap-10 lg:gap-8 items-center">
            <div className="space-y-5 text-center lg:text-left">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-1.5 text-sm text-accent-cyan font-semibold",
                  inView ? "animate-fade-up" : "opacity-0"
                )}
                style={{ animationDelay: "80ms" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
                </span>
                Konsultasi Gratis 30 Menit
              </span>
              <h2
                className={cn(
                  "font-display text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.15]",
                  inView ? "animate-fade-up" : "opacity-0"
                )}
                style={{ animationDelay: "160ms" }}
              >
                Siap <span className="glow-text">Bekerja Sama</span> Membangun Masa Depan Digital?
              </h2>
              <p
                className={cn(
                  "text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed",
                  inView ? "animate-fade-up" : "opacity-0"
                )}
                style={{ animationDelay: "220ms" }}
              >
                Konsultasikan ide dan kebutuhan proyek Anda dengan tim ahli kami. Gratis, tanpa komitmen, dan respon cepat dalam 1x24 jam.
              </p>
            </div>

            <div
              className={cn(
                "space-y-4 w-full",
                inView ? "animate-fade-up" : "opacity-0"
              )}
              style={{ animationDelay: "280ms" }}
            >
              <a
                href="https://wa.me/6281234567890?text=Halo%20Terra%20Tech%2C%20saya%20ingin%20berkonsultasi%20tentang%20proyek%20digital"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button size="lg" className="w-full h-14 text-base animate-glow-pulse">
                  <MessageCircle className="h-5 w-5" strokeWidth={2.25} />
                  Chat via WhatsApp
                  <ArrowRight className="h-5 w-5 ml-1" strokeWidth={2.25} />
                </Button>
              </a>
              <a href="mailto:hello@terratech.id?subject=Konsultasi%20Proyek%20Baru" className="block w-full">
                <Button size="lg" variant="secondary" className="w-full h-14 text-base">
                  <Mail className="h-5 w-5" strokeWidth={2.25} />
                  Email: hello@terratech.id
                </Button>
              </a>
              <p className="text-center text-sm text-text-muted pt-1">
                Atau telepon di{" "}
                <a href="tel:+6281234567890" className="text-accent-cyan hover:underline font-medium">
                  +62 812 3456 7890
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
