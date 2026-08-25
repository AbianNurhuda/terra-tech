import { useState } from "react"
import { Shield, Sparkles, Building2, Megaphone, Calendar, Tags, FolderOpen, AlertCircle, BarChart3, Layers, BookOpen, Settings } from "lucide-react"

import CmsHero from "./CmsHero"
import CmsBannerSlider from "./CmsBannerSlider"
import CmsAboutCompany from "./CmsAboutCompany"
import CmsServices from "./CmsServices"
import CmsStatistics from "./CmsStatistics"
import CmsTestimonials from "./CmsTestimonials"
import CmsPortfolio from "./CmsPortfolio"
import CmsFooter from "./CmsFooter"

export default function CmsLandingPage({ role, showToast }) {
  const [activeTab, setActiveTab] = useState("Hero")

  const tabs = [
    { name: "Hero", label: "Hero Section", icon: Sparkles },
    { name: "Banner Slider", label: "Banner / Slider", icon: Layers },
    { name: "About Company", label: "About Company", icon: Building2 },
    { name: "Services", label: "Services", icon: Settings },
    { name: "Statistics", label: "Statistics", icon: BarChart3 },
    { name: "Testimonials", label: "Testimonials", icon: Megaphone },
    { name: "Portfolio", label: "Portfolio", icon: FolderOpen },
    { name: "Footer", label: "Footer", icon: Tags }
  ]

  // Determine read-only permission based on role matrix
  const isReadOnly = (tabName) => {
    if (role === "super_admin" || role === "admin") return false
    if (role === "operator") return true
    if (role === "editor") {
      // Editor is CRUD for all except Statistics
      return tabName === "Statistics"
    }
    return true
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-border pb-5">
        <div>
          <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">CMS Control Panel</span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-text-primary mt-1">
            CMS Halaman Utama (Landing Page)
          </h2>
          <p className="text-text-secondary text-xs mt-1">
            Kelola seluruh konten, gambar, teks, dan media pada halaman utama website Terra Tech.
          </p>
        </div>
      </div>

      {/* Horizontal Tabs Scrollable */}
      <div className="flex gap-2 border-b border-dark-border pb-px overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.name
          const readOnlyLabel = isReadOnly(tab.name)
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "border-accent-cyan text-accent-cyan"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-dark-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {readOnlyLabel && (
                <span className="ml-1.5 px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-bold">
                  Read Only
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Render Active Tab Component */}
      <div className="card-surface p-6 md:p-8 bg-white min-h-[50vh] transition-all">
        {activeTab === "Hero" && (
          <CmsHero readOnly={isReadOnly("Hero")} showToast={showToast} />
        )}
        {activeTab === "Banner Slider" && (
          <CmsBannerSlider readOnly={isReadOnly("Banner Slider")} showToast={showToast} />
        )}
        {activeTab === "About Company" && (
          <CmsAboutCompany readOnly={isReadOnly("About Company")} showToast={showToast} />
        )}
        {activeTab === "Services" && (
          <CmsServices readOnly={isReadOnly("Services")} showToast={showToast} />
        )}
        {activeTab === "Statistics" && (
          <CmsStatistics readOnly={isReadOnly("Statistics")} showToast={showToast} />
        )}
        {activeTab === "Testimonials" && (
          <CmsTestimonials readOnly={isReadOnly("Testimonials")} showToast={showToast} />
        )}
        {activeTab === "Portfolio" && (
          <CmsPortfolio readOnly={isReadOnly("Portfolio")} showToast={showToast} />
        )}
        {activeTab === "Footer" && (
          <CmsFooter readOnly={isReadOnly("Footer")} showToast={showToast} />
        )}
      </div>
    </div>
  )
}
