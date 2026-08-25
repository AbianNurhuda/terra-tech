import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/utils/cn"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 transition-all duration-500",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Button
        onClick={scrollTop}
        variant="default"
        size="icon"
        aria-label="Kembali ke atas"
        className="h-12 w-12 rounded-full shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] animate-glow-pulse"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </Button>
    </div>
  )
}
