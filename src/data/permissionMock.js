// TEMPORARY MOCK DATA
// Backend permission API not connected yet.
// Backend remains the authorization source of truth.

export const permissionTypes = [
  "master",
  "read",
  "create",
  "update",
  "delete",
  "manage"
];

export const permissionActionKeys = [
  "read",
  "create",
  "update",
  "delete",
  "manage"
];

export const moduleGroups = [
  {
    name: "CMS",
    description: "Modul pengelolaan konten publik dan portal",
    modules: [
      { id: "information", name: "Information", description: "Artikel berita, blog, dan rilis pers portal" },
      { id: "announcement", name: "Announcement", description: "Pengumuman staf dan notifikasi prioritas" },
      { id: "pages", name: "Pages", description: "Halaman dinamis kustom dan konten statis" },
      { id: "navigation", name: "Navigation", description: "Menu navbar, tautan header, dan footer" },
      { id: "regulation", name: "Regulation", description: "Dokumen regulasi resmi dan status kepatuhan" },
      { id: "timeline", name: "Timeline", description: "Milestone peta jalan kegiatan perusahaan" },
      { id: "registration", name: "Registration / How We Work", description: "Alur registrasi mitra dan tata cara kerja" },
      { id: "files", name: "Files", description: "Direktori file arsip, unduhan, dan dokumen" },
      { id: "file_categories", name: "File Categories", description: "Taksonomi dan kategori klasifikasi berkas" },
      { id: "portfolio", name: "Portfolio", description: "Galeri portofolio proyek dan studi kasus" },
      { id: "landing_page", name: "Landing Page", description: "Hero banner, statistik, dan section landing" }
    ]
  },
  {
    name: "SYSTEM",
    description: "Modul konfigurasi sistem dan tata kelola akun",
    modules: [
      { id: "users", name: "Users", description: "Manajemen akun staf, otentikasi, dan status" },
      { id: "company_profile", name: "Company Profile", description: "Identitas organisasi, logo, favicon, dan kontak" },
      { id: "dashboard", name: "Dashboard", description: "Ringkasan metrik analitik dan pemantauan sistem" }
    ]
  }
];

export const rolesList = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "editor",
    name: "Editor",
    description: "Content management",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200"
  },
  {
    id: "operator",
    name: "Operator",
    description: "Read-only access",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
  }
];

// Helper to generate full permission set for all modules
const createModulePermissions = (modules, permConfig) => {
  const perms = {};
  modules.forEach((mod) => {
    const config = typeof permConfig === "function" ? permConfig(mod.id) : permConfig;
    perms[mod.id] = {
      read: config.read ?? false,
      create: config.create ?? false,
      update: config.update ?? false,
      delete: config.delete ?? false,
      manage: config.manage ?? false
    };
  });
  return perms;
};

const allModules = moduleGroups.flatMap((g) => g.modules);

export const initialRolePermissions = {
  super_admin: createModulePermissions(allModules, {
    read: true,
    create: true,
    update: true,
    delete: true,
    manage: true
  }),

  admin: createModulePermissions(allModules, (moduleId) => {
    if (moduleId === "users") {
      return { read: true, create: true, update: true, delete: false, manage: false };
    }
    return { read: true, create: true, update: true, delete: true, manage: true };
  }),

  editor: createModulePermissions(allModules, (moduleId) => {
    // CMS modules have create/update/read, no delete on sensitive items
    if (["users", "company_profile", "dashboard"].includes(moduleId)) {
      return { read: true, create: false, update: false, delete: false, manage: false };
    }
    return { read: true, create: true, update: true, delete: false, manage: false };
  }),

  operator: createModulePermissions(allModules, {
    read: true,
    create: false,
    update: false,
    delete: false,
    manage: false
  })
};
