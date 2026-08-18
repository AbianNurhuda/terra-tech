import { useEffect, useState, useRef } from "react"
import { Menu, X, Sparkles } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/Button"

const navItems = [
  { label: "Beranda", to: "/", end: true },
  { label: "Layanan / Produk", to: "/layanan" },
  { label: "Portofolio", to: "/portofolio" },
  { label: "Kontak", to: "/kontak" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    const HIDE_THRESHOLD = 80
    const SHOW_THRESHOLD = 40

    const update = () => {
      const currentY = window.scrollY
      const lastY = lastScrollYRef.current
      const delta = currentY - lastY

      setScrolled(currentY > 20)

      if (mobileOpen) {
        lastScrollYRef.current = currentY
        tickingRef.current = false
        return
      }

      if (delta > 3 && currentY > HIDE_THRESHOLD) {
        setHidden(true)
      } else if (delta < -3) {
        setHidden(false)
      } else if (currentY < SHOW_THRESHOLD) {
        setHidden(false)
      }

      lastScrollYRef.current = currentY
      tickingRef.current = false
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(update)
        tickingRef.current = true
      }
    }

    update()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
    setHidden(false)
    lastScrollYRef.current = window.scrollY
  }, [location.pathname])

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out",
        scrolled
          ? "bg-dark-surface/92 backdrop-blur-xl border-b border-dark-border shadow-[0_4px_24px_rgba(37,99,235,0.08)]"
          : "bg-dark-base/80 backdrop-blur-sm border-b border-transparent",
        hidden ? "-translate-y-[130%] shadow-none" : "translate-y-0"
      )}
    >
      <nav className="container h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold text-xl tracking-tight">
            Terra<span className="glow-text">Tech</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-accent-cyan"
                      : "text-text-secondary hover:text-text-primary"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-accent-cyan rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link to="/kontak" className="inline-block">
            <Button size="sm" className="h-10 px-5">
              Hubungi Kami
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl text-text-primary hover:bg-dark-surface transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-dark-border bg-dark-surface/95 backdrop-blur-xl animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={{ animationDelay: `${i * 40}ms` }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium animate-fade-up",
                    isActive
                      ? "bg-accent-cyan/10 text-accent-cyan"
                      : "text-text-secondary hover:bg-dark-border/50 hover:text-text-primary"
                  )
                }
              >
                <span>{item.label}</span>
                <span className="text-text-muted">→</span>
              </NavLink>
            ))}
            <Link to="/kontak" className="mt-3 w-full">
              <Button className="w-full">Hubungi Kami</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
