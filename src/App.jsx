import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BackToTop } from "@/components/BackToTop"
import { ScrollToTop } from "@/components/ScrollToTop"
import { Landing } from "@/pages/Landing"
import { ServicesPage } from "@/pages/Services"
import { ServiceDetailPage } from "@/pages/ServiceDetail"
import { PortfolioPage } from "@/pages/Portfolio"
import { ContactPage } from "@/pages/Contact"
import { LoginPage } from "@/pages/Login"
import { DashboardPage } from "@/pages/Dashboard"
import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation()
  const isDashboardOrLogin = location.pathname.startsWith("/dashboard") || location.pathname === "/login"

  return (
    <div className="min-h-screen bg-dark-base">
      <ScrollToTop />
      {!isDashboardOrLogin && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/layanan" element={<ServicesPage />} />
        <Route path="/layanan/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/portofolio" element={<PortfolioPage />} />
        <Route path="/kontak" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      {!isDashboardOrLogin && <Footer />}
      {!isDashboardOrLogin && <BackToTop />}
    </div>
  )
}

export default App
