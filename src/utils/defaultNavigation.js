export const defaultNavigations = [
  {
    id: 1,
    label: "Beranda",
    path: "/",
    type: "internal",
    icon: "Home",
    sort_order: 1,
    target: "_self",
    status: "active",
    is_coming_soon: false
  },
  {
    id: 2,
    label: "Layanan / Produk",
    path: "/layanan",
    type: "internal",
    icon: "Briefcase",
    sort_order: 2,
    target: "_self",
    status: "active",
    is_coming_soon: false
  },
  {
    id: 3,
    label: "Portofolio",
    path: "/portofolio",
    type: "internal",
    icon: "FolderOpen",
    sort_order: 3,
    target: "_self",
    status: "active",
    is_coming_soon: false
  },
  {
    id: 4,
    label: "Kontak",
    path: "/kontak",
    type: "internal",
    icon: "Phone",
    sort_order: 4,
    target: "_self",
    status: "active",
    is_coming_soon: false
  }
]

export const registeredRoutes = [
  { path: "/", label: "Beranda (Landing Page)" },
  { path: "/layanan", label: "Halaman Layanan / Produk" },
  { path: "/layanan/:serviceId", label: "Detail Layanan (Dinamis)" },
  { path: "/portofolio", label: "Halaman Portofolio" },
  { path: "/kontak", label: "Halaman Kontak" },
  { path: "/login", label: "Halaman Login Staf" },
  { path: "/dashboard", label: "Dashboard CMS" }
]
