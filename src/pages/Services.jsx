import { Services } from "@/components/sections/Services"
import { Pricing } from "@/components/sections/Pricing"
import { CallToAction } from "@/components/sections/CallToAction"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/utils/cn"

export function ServicesPage() {
  return (
    <main className="relative pt-28">
      <section className="container pt-8 pb-6">
        <div className="max-w-3xl">
          <span className="section-label animate-fade-up">Layanan & Produk</span>
          <h1 className="section-title !mb-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Solusi Digital <span className="glow-text">Lengkap</span> untuk Setiap Kebutuhan
          </h1>
          <p className="section-subtitle animate-fade-up" style={{ animationDelay: "180ms" }}>
            Pilih layanan yang sesuai dengan tujuan bisnis Anda. Dari pengembangan website, aplikasi mobile, desain UI/UX, hingga konsultasi IT enterprise.
          </p>
          <div
            className={cn("mt-8 flex flex-wrap gap-3 animate-fade-up")}
            style={{ animationDelay: "260ms" }}
          >
            <Link to="/kontak">
              <button className="btn-primary">
                Konsultasi Gratis
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </Link>
            <a
              href="#harga"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("harga")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="btn-secondary"
            >
              Lihat Paket Harga
            </a>
          </div>
        </div>
      </section>

      <Services showFilters={true} />
      <Pricing />
      <CallToAction />
    </main>
  )
}
