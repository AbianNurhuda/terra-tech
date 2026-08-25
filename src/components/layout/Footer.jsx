import { useState, useEffect } from "react"
import { Sparkles, Mail, Phone, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/utils/cn"
import { defaultFooter } from "../../utils/cmsDefaults"

const IconGithub = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 007.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.49.11-3.1 0 0 .97-.31 3.18 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.61.23 2.8.11 3.1.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.26 5.69.41.35.78 1.05.78 2.11v3.13c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
  </svg>
)

const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2H21.5l-7.5 8.575L22.75 22H16.1l-5.13-6.71L5.1 22H1.84l8.02-9.166L1.25 2H8.1l4.635 6.102L18.244 2zm-2.384 18h1.805L7.27 4H5.365l10.495 16z" />
  </svg>
)

const IconLinkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const IconInstagram = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.17.055 1.805.248 2.227.415.56.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.059 1.266.07 1.646.07 4.849s-.012 3.585-.07 4.849c-.055 1.17-.249 1.805-.415 2.227-.217.562-.479.96-.896 1.381-.422.42-.82.679-1.381.896-.422.164-1.057.36-2.227.413-1.265.059-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.17-.054-1.805-.249-2.227-.415-.56-.217-.96-.479-1.381-.896-.421-.42-.68-.82-.896-1.382-.164-.422-.36-1.056-.413-2.227-.058-1.264-.07-1.645-.07-4.849s.012-3.584.07-4.849c.053-1.17.248-1.805.415-2.227.217-.56.477-.96.896-1.382.42-.419.82-.679 1.381-.896.422-.164 1.056-.36 2.228-.413 1.265-.058 1.645-.07 4.849-.07zM12 0C8.741 0 8.332.014 7.052.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.059 1.277.26 2.148.559 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.559C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.277-.06 2.148-.262 2.913-.559.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.559-2.913.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.06-1.277-.262-2.149-.559-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.861.63c-.765-.297-1.636-.499-2.913-.559C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const socialLinks = [
  { label: "GitHub", icon: IconGithub },
  { label: "X / Twitter", icon: IconX },
  { label: "LinkedIn", icon: IconLinkedin },
  { label: "Instagram", icon: IconInstagram },
]

export function Footer() {
  const [footer, setFooter] = useState(defaultFooter)

  useEffect(() => {
    const saved = localStorage.getItem("cms_footer")
    if (saved) {
      setFooter(JSON.parse(saved))
    } else {
      setFooter(defaultFooter)
      localStorage.setItem("cms_footer", JSON.stringify(defaultFooter))
    }
  }, [])

  const dynamicFooterLinks = [
    {
      title: "Navigasi",
      items: [
        { label: "Beranda", to: "/" },
        { label: "Layanan / Produk", to: "/layanan" },
        { label: "Portofolio", to: "/portofolio" },
        { label: "Kontak", to: "/kontak" },
      ],
    },
    {
      title: "Layanan",
      items: [
        { label: "Web Development", to: "/layanan" },
        { label: "Mobile App", to: "/layanan" },
        { label: "UI / UX Design", to: "/layanan" },
        { label: "IT Consulting", to: "/layanan" },
      ],
    },
    {
      title: "Kontak",
      items: [
        { label: footer.email, href: `mailto:${footer.email}`, icon: Mail },
        { label: footer.phone, href: `tel:${footer.phone.replace(/[^0-9+]/g, "")}`, icon: Phone },
        { label: footer.address, href: "#", icon: MapPin },
      ],
    },
  ]

  const dynamicSocialLinks = socialLinks.map((link) => {
    const found = footer.social_media.find(
      (sm) =>
        sm.label.toLowerCase().includes(link.label.toLowerCase().split(" ")[0]) ||
        link.label.toLowerCase().includes(sm.label.toLowerCase())
    )
    return {
      ...link,
      href: found ? found.href : "#",
    }
  })

  return (
    <footer className="relative border-t border-dark-border bg-dark-surface">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.3)]">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-display font-bold text-xl tracking-tight">
                Terra<span className="glow-text">Tech</span>
              </span>
            </Link>
            <p className="text-text-secondary leading-relaxed max-w-sm">
              Solusi digital terintegrasi untuk memajukan bisnis Anda. Dari pengembangan website, aplikasi mobile, hingga desain dan konsultasi IT.
            </p>
            <div className="flex items-center gap-3">
              {dynamicSocialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "h-10 w-10 inline-flex items-center justify-center rounded-xl",
                    "border border-dark-border text-text-secondary",
                    "hover:border-accent-cyan/50 hover:text-accent-cyan hover:bg-accent-cyan/5",
                    "transition-all duration-300 hover:-translate-y-0.5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {dynamicFooterLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-text-primary mb-5">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.label}>
                      {item.to ? (
                        <Link
                          to={item.to}
                          className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                        >
                          {Icon && <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                          <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                        >
                          {Icon && <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                          <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-dark-border/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} {footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-secondary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-text-secondary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
