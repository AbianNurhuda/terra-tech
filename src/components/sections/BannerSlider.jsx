import { useState, useEffect } from "react"
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
import { defaultBanners } from "../../utils/cmsDefaults"

export function BannerSlider() {
  const [banners, setBanners] = useState([])
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    const saved = localStorage.getItem("cms_banners")
    if (saved) {
      setBanners(JSON.parse(saved))
    } else {
      setBanners(defaultBanners)
      localStorage.setItem("cms_banners", JSON.stringify(defaultBanners))
    }
  }, [])

  const activeBanners = banners.filter((b) => b.status === "Published")

  if (activeBanners.length === 0) return null

  return (
    <section
      ref={ref}
      className={cn(
        "relative py-8 overflow-hidden container",
        inView ? "animate-fade-up" : "opacity-0"
      )}
    >
      <div className="relative mx-auto w-full rounded-3xl overflow-hidden border border-dark-border/80 shadow-2xl bg-dark-surface/60 backdrop-blur-xl">
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {activeBanners.map((banner) => (
              <CarouselItem key={banner.id} className="relative w-full aspect-[21/9] md:aspect-[3/1] min-h-[220px]">
                {/* Background Banner Image */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/90 via-dark-surface/60 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-left max-w-xl space-y-3 z-10">
                  <h3 className="text-xl md:text-3xl font-extrabold font-display text-text-primary leading-tight">
                    {banner.title}
                  </h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                    {banner.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Controls */}
          {activeBanners.length > 1 && (
            <>
              <div className="absolute right-4 bottom-4 z-20 flex gap-2">
                <CarouselPrevious className="relative translate-y-0 left-0 right-0 border-dark-border text-text-secondary bg-dark-surface/85 hover:bg-accent-cyan hover:text-white" />
                <CarouselNext className="relative translate-y-0 left-0 right-0 border-dark-border text-text-secondary bg-dark-surface/85 hover:bg-accent-cyan hover:text-white" />
              </div>
              <div className="absolute left-8 md:left-16 bottom-4 z-20">
                <CarouselDots className="justify-start" />
              </div>
            </>
          )}
        </Carousel>
      </div>
    </section>
  )
}
export default BannerSlider
