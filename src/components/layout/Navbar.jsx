import { useEffect, useState, useRef } from "react"
import { Menu, X, Sparkles, ExternalLink } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/Button"
import { navigationService } from "@/services/api.service"
import { defaultNavigations } from "@/utils/defaultNavigation"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navItems, setNavItems] = useState(defaultNavigations.filter((i) => i.status === "active"))
  const [comingSoonModal, setComingSoonModal] = useState({ open: false, item: null })
  const location = useLocation()
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)

  // Fetch active navigation links from backend API or baseline fallback
  useEffect(() => {
    let isMounted = true

    const loadNavigation = async () => {
      try {
        const res = await navigationService.getPublicNavigation()
        if (res.success && res.data && isMounted) {
          const items = Array.isArray(res.data) ? res.data : (res.data.items || defaultNavigations)
          const activeItems = items
            .filter((item) => item.status === "active")
            .sort((a, b) => Number(a.sort_order || a.order || 0) - Number(b.sort_order || b.order || 0))
          setNavItems(activeItems.length > 0 ? activeItems : defaultNavigations)
        } else {
          // Fallback to baseline default or stored config
          const savedFallback = localStorage.getItem("cms_navigation_fallback")
          if (savedFallback && isMounted) {
            try {
              const parsed = JSON.parse(savedFallback)
              const activeItems = parsed
                .filter((item) => item.status === "active")
                .sort((a, b) => Number(a.sort_order || a.order || 0) - Number(b.sort_order || b.order || 0))
              setNavItems(activeItems.length > 0 ? activeItems : defaultNavigations)
            } catch {
              if (isMounted) setNavItems(defaultNavigations)
            }
          }
        }
      } catch (err) {
        console.error("Navbar dynamic load fallback applied:", err)
        if (isMounted) setNavItems(defaultNavigations)
      }
    }

    loadNavigation()
    return () => {
      isMounted = false
    }
  }, [])

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

  const handleOpenComingSoon = (item) => {
    setMobileOpen(false)
    setComingSoonModal({ open: true, item })
  }

  // Helper to render NavLink item based on type
  const renderDesktopNavItem = (item) => {
    const isComingSoon = Boolean(item.is_coming_soon || item.type === "coming_soon")
    const isExternal = item.type === "external"

    if (isExternal) {
      return (
        <a
          key={item.id || item.path}
          href={item.path}
          target={item.target || "_blank"}
          rel="noopener noreferrer"
          className="relative px-4 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
        >
          <span>{item.label}</span>
          <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
        </a>
      )
    }

    if (isComingSoon && item.type === "coming_soon") {
      return (
        <button
          key={item.id || item.label}
          type="button"
          onClick={() => handleOpenComingSoon(item)}
          className="relative px-4 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-accent-cyan transition-colors flex items-center gap-1.5 cursor-pointer group"
          title="Klik untuk info menu"
        >
          <span>{item.label}</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold group-hover:bg-purple-500/30 transition-colors">
            Soon
          </span>
        </button>
      )
    }

    return (
      <NavLink
        key={item.id || item.path}
        to={item.path}
        end={item.path === "/"}
        className={({ isActive }) =>
          cn(
            "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5",
            isActive
              ? "text-accent-cyan"
              : "text-text-secondary hover:text-text-primary"
          )
        }
      >
        {({ isActive }) => (
          <>
            <span>{item.label}</span>
            {isComingSoon && (
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                Soon
              </span>
            )}
            {isActive && (
              <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-accent-cyan rounded-full" />
            )}
          </>
        )}
      </NavLink>
    )
  }

  // Helper to render Mobile NavLink item
  const renderMobileNavItem = (item, i) => {
    const isComingSoon = Boolean(item.is_coming_soon || item.type === "coming_soon")
    const isExternal = item.type === "external"

    if (isExternal) {
      return (
        <a
          key={item.id || item.path}
          href={item.path}
          target={item.target || "_blank"}
          rel="noopener noreferrer"
          style={{ animationDelay: `${i * 40}ms` }}
          className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-text-secondary hover:bg-dark-border/50 hover:text-text-primary animate-fade-up"
        >
          <span className="flex items-center gap-2">
            <span>{item.label}</span>
            <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
          </span>
          <span className="text-text-muted">↗</span>
        </a>
      )
    }

    if (isComingSoon && item.type === "coming_soon") {
      return (
        <button
          key={item.id || item.label}
          type="button"
          onClick={() => handleOpenComingSoon(item)}
          style={{ animationDelay: `${i * 40}ms` }}
          className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-text-secondary hover:bg-dark-border/50 hover:text-text-primary animate-fade-up text-left"
        >
          <span className="flex items-center gap-2">
            <span>{item.label}</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              Soon
            </span>
          </span>
          <span className="text-text-muted text-xs">Akan Datang</span>
        </button>
      )
    }

    return (
      <NavLink
        key={item.id || item.path}
        to={item.path}
        end={item.path === "/"}
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
        <span className="flex items-center gap-2">
          <span>{item.label}</span>
          {isComingSoon && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              Soon
            </span>
          )}
        </span>
        <span className="text-text-muted">→</span>
      </NavLink>
    )
  }

  return (
    <>
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
              <li key={item.id || item.path}>{renderDesktopNavItem(item)}</li>
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
              {navItems.map((item, i) => renderMobileNavItem(item, i))}
              <Link to="/kontak" className="mt-3 w-full">
                <Button className="w-full">Hubungi Kami</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Coming Soon Interactive Dialog Modal */}
      {comingSoonModal.open && comingSoonModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-base/80 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple shadow-inner">
              <Sparkles className="h-8 w-8 text-accent-cyan animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                Coming Soon
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                {comingSoonModal.item.label}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Halaman dan fitur ini sedang dalam tahap pengembangan aktif oleh tim Terra Tech. Nantikan inovasi dan konten terbaru kami dalam waktu dekat!
              </p>
            </div>

            <div className="pt-2 border-t border-dark-border/60 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setComingSoonModal({ open: false, item: null })}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-dark-border bg-dark-base text-text-secondary hover:text-text-primary hover:bg-dark-border/40 text-xs font-bold transition-colors"
              >
                Tutup
              </button>
              <Link
                to="/layanan"
                onClick={() => setComingSoonModal({ open: false, item: null })}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full h-10 px-5 text-xs font-bold">
                  Lihat Layanan Kami
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
