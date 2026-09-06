import { useState, useMemo, useCallback } from "react"
import {
  Shield,
  UserCheck,
  FileEdit,
  Radio,
  Search,
  RotateCcw,
  Save,
  Check,
  Minus,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  X,
  Lock
} from "lucide-react"
import {
  moduleGroups,
  rolesList,
  initialRolePermissions,
  permissionActionKeys
} from "@/data/permissionMock"

const ROLE_ICONS = {
  super_admin: Shield,
  admin: UserCheck,
  editor: FileEdit,
  operator: Radio
}

export default function RolePermissionManagement({ showToast }) {
  // Active role selected in the UI
  const [selectedRole, setSelectedRole] = useState("super_admin")

  // Matrix permission state per role (isolated temporary state)
  const [rolePermissions, setRolePermissions] = useState(
    () => JSON.parse(JSON.stringify(initialRolePermissions))
  )

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all' | 'active' | 'partial' | 'none'

  // Reset confirmation modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Current active permissions map for the selected role
  const currentPermissions = useMemo(() => {
    return rolePermissions[selectedRole] || {}
  }, [rolePermissions, selectedRole])

  // Check if current permissions have unsaved differences from initial mock data
  const isDirty = useMemo(() => {
    const initialJson = JSON.stringify(initialRolePermissions)
    const currentJson = JSON.stringify(rolePermissions)
    return initialJson !== currentJson
  }, [rolePermissions])

  // Dynamic calculation for a single module's status
  const getModuleStatus = useCallback((moduleId, roleKey = selectedRole) => {
    const modPerms = rolePermissions[roleKey]?.[moduleId] || {}
    const activeCount = permissionActionKeys.filter((key) => modPerms[key]).length
    const totalCount = permissionActionKeys.length

    if (activeCount === totalCount) return "active"
    if (activeCount > 0) return "partial"
    return "none"
  }, [rolePermissions, selectedRole])

  // Calculate active permission count per role for role selector cards
  const getRoleActiveCount = useCallback((roleKey) => {
    const perms = rolePermissions[roleKey] || {}
    let count = 0
    Object.values(perms).forEach((mod) => {
      permissionActionKeys.forEach((key) => {
        if (mod[key]) count += 1
      })
    })
    return count
  }, [rolePermissions])

  // Calculate statistics for the selected role summary
  const summaryStats = useMemo(() => {
    const perms = currentPermissions
    const totalModules = moduleGroups.reduce((acc, g) => acc + g.modules.length, 0)
    let totalActive = 0
    let readCount = 0
    let createCount = 0
    let updateCount = 0
    let deleteCount = 0
    let manageCount = 0

    Object.values(perms).forEach((mod) => {
      if (mod.read) { readCount += 1; totalActive += 1 }
      if (mod.create) { createCount += 1; totalActive += 1 }
      if (mod.update) { updateCount += 1; totalActive += 1 }
      if (mod.delete) { deleteCount += 1; totalActive += 1 }
      if (mod.manage) { manageCount += 1; totalActive += 1 }
    })

    return {
      totalModules,
      totalActive,
      readCount,
      createCount,
      updateCount,
      deleteCount,
      manageCount
    }
  }, [currentPermissions])

  // Filter and search modules
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return moduleGroups
      .map((group) => {
        const filteredModules = group.modules.filter((mod) => {
          // Search match
          const matchesSearch =
            !query ||
            mod.name.toLowerCase().includes(query) ||
            mod.description.toLowerCase().includes(query) ||
            group.name.toLowerCase().includes(query)

          if (!matchesSearch) return false

          // Status filter match
          const status = getModuleStatus(mod.id, selectedRole)
          if (statusFilter === "active" && status !== "active") return false
          if (statusFilter === "partial" && status !== "partial") return false
          if (statusFilter === "none" && status !== "none") return false

          return true
        })

        return {
          ...group,
          modules: filteredModules
        }
      })
      .filter((group) => group.modules.length > 0)
  }, [searchQuery, statusFilter, selectedRole, getModuleStatus])

  const totalFilteredCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.modules.length, 0)
  }, [filteredGroups])

  // Toggle single permission for a module
  const handleTogglePermission = (moduleId, actionKey) => {
    setRolePermissions((prev) => {
      const currentRolePerms = prev[selectedRole] || {}
      const currentModPerms = currentRolePerms[moduleId] || {
        read: false,
        create: false,
        update: false,
        delete: false,
        manage: false
      }

      const nextVal = !currentModPerms[actionKey]

      return {
        ...prev,
        [selectedRole]: {
          ...currentRolePerms,
          [moduleId]: {
            ...currentModPerms,
            [actionKey]: nextVal
          }
        }
      }
    })
  }

  // Toggle master checkbox for a module
  const handleToggleMaster = (moduleId) => {
    setRolePermissions((prev) => {
      const currentRolePerms = prev[selectedRole] || {}
      const currentModPerms = currentRolePerms[moduleId] || {
        read: false,
        create: false,
        update: false,
        delete: false,
        manage: false
      }

      const allActive = permissionActionKeys.every((k) => currentModPerms[k])
      const nextVal = !allActive

      const nextModPerms = {
        read: nextVal,
        create: nextVal,
        update: nextVal,
        delete: nextVal,
        manage: nextVal
      }

      return {
        ...prev,
        [selectedRole]: {
          ...currentRolePerms,
          [moduleId]: nextModPerms
        }
      }
    })
  }

  // Reset handler
  const handleResetConfirm = () => {
    setRolePermissions(JSON.parse(JSON.stringify(initialRolePermissions)))
    setIsResetModalOpen(false)
    if (showToast) {
      showToast("Konfigurasi permission berhasil dikembalikan ke default.", "success")
    }
  }

  // Save handler (preview mode)
  const handleSave = () => {
    if (showToast) {
      showToast("Permission matrix masih dalam mode preview.", "info")
    }
  }

  const selectedRoleMeta = rolesList.find((r) => r.id === selectedRole) || rolesList[0]

  return (
    <div className="space-y-5 animate-fade-in text-left">
      {/* 1. Page Header */}
      <div className="space-y-1.5 pb-2 border-b border-dark-border">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
          <span>Settings</span>
          <span>/</span>
          <span className="text-text-primary font-bold">Role & Matriks Permission</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold font-display text-text-primary tracking-tight">
              Pengaturan Workspace & Akun
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles className="h-3 w-3 text-amber-500" />
              UI Preview
            </span>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          Kelola role dan hak akses pengguna dalam sistem.
        </p>
      </div>

      {/* 2. Compact Action Bar */}
      <div className="bg-white border border-dark-border rounded-xl p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold font-display text-text-primary">
                Role & Matriks Permission
              </h2>
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Atur hak akses berdasarkan role pengguna.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                setIsResetModalOpen(true)
              } else {
                handleResetConfirm()
              }
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-white hover:bg-dark-base text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-cyan text-white text-xs font-bold hover:bg-accent-cyan/90 active:scale-[0.99] transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-1"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Compact 2-Panel Layout (Left: 270px, Right: remaining width) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left Column: Role Selector & Compact Summary (270px) */}
        <div className="w-full lg:w-[270px] shrink-0 space-y-4">
          {/* Role Selector Card */}
          <div className="bg-white border border-dark-border rounded-xl p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <h3 className="text-[11px] font-bold font-display uppercase tracking-wider text-text-muted">
                Role Pengguna
              </h3>
              <span className="text-[10px] font-semibold text-accent-cyan">
                {rolesList.length} Role
              </span>
            </div>

            <div className="space-y-1.5">
              {rolesList.map((roleItem) => {
                const isSelected = selectedRole === roleItem.id
                const IconComp = ROLE_ICONS[roleItem.id] || Lock
                const activeCount = getRoleActiveCount(roleItem.id)

                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => setSelectedRole(roleItem.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-accent-cyan/[0.04] border-accent-cyan ring-1 ring-accent-cyan shadow-xs"
                        : "bg-white border-dark-border hover:bg-dark-base/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-accent-cyan text-white"
                              : "bg-dark-base border border-dark-border text-text-secondary"
                          }`}
                        >
                          <IconComp className="h-3.5 w-3.5" />
                        </div>
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-accent-cyan" : "text-text-primary"}`}>
                          {roleItem.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-text-muted mt-1 truncate">
                      {roleItem.description}
                    </p>

                    <div className="mt-1.5 pt-1.5 border-t border-dark-border/40 flex items-center justify-between text-[10px]">
                      <span className="text-text-secondary font-medium">Izin Aktif:</span>
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20"
                          : "bg-dark-base text-text-muted border-dark-border"
                      }`}>
                        {activeCount}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Compact Role Summary */}
          <div className="bg-white border border-dark-border rounded-xl p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <h3 className="text-[11px] font-bold font-display uppercase tracking-wider text-text-muted">
                Ringkasan Role
              </h3>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${selectedRoleMeta.badgeColor}`}>
                {selectedRoleMeta.name}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-text-secondary">Role Terpilih:</span>
                <span className="font-bold text-text-primary">{selectedRoleMeta.name}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-text-secondary">Total Modul:</span>
                <span className="font-mono font-bold text-text-primary">{summaryStats.totalModules}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-text-secondary">Active Permissions:</span>
                <span className="font-mono font-bold text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.2 rounded">
                  {summaryStats.totalActive}
                </span>
              </div>
            </div>

            {/* Granular Action Stats (Compact Grid) */}
            <div className="pt-1.5 border-t border-dark-border/60 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 rounded-lg bg-dark-base border border-dark-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">READ</span>
                  <span className="text-xs font-bold font-mono text-text-primary">{summaryStats.readCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-base border border-dark-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">CREATE</span>
                  <span className="text-xs font-bold font-mono text-text-primary">{summaryStats.createCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-base border border-dark-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">UPDATE</span>
                  <span className="text-xs font-bold font-mono text-text-primary">{summaryStats.updateCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-base border border-dark-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-semibold">DELETE</span>
                  <span className="text-xs font-bold font-mono text-text-primary">{summaryStats.deleteCount}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-dark-base border border-dark-border flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase font-semibold">MANAGE</span>
                <span className="text-xs font-bold font-mono text-text-primary">{summaryStats.manageCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Permission Matrix Table (Takes remainder of width) */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          {/* Matrix Toolbar: Search & Filters */}
          <div className="bg-white border border-dark-border rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-xs">
            {/* Search Module Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-3.5 w-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari module..."
                aria-label="Cari modul permission"
                className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-lg border border-dark-border bg-dark-base/40 placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 flex-wrap shrink-0">
              <span className="text-[10px] font-semibold text-text-muted flex items-center gap-1 mr-0.5">
                <SlidersHorizontal className="h-3 w-3" />
                Filter:
              </span>
              {[
                { id: "all", label: "Semua" },
                { id: "active", label: "Aktif" },
                { id: "partial", label: "Sebagian" },
                { id: "none", label: "Tidak Ada" }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    statusFilter === f.id
                      ? "bg-accent-cyan text-white shadow-xs"
                      : "bg-dark-base text-text-secondary hover:bg-dark-base/80 border border-dark-border"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enterprise Matrix Table */}
          <div className="bg-white border border-dark-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {/* Table with fixed layout and exact proportional widths */}
              <table className="w-full table-fixed text-left text-xs border-collapse min-w-[620px]">
                {/* Column definitions: MODULE (~40%), MASTER (~10%), READ (~10%), CREATE (~10%), UPDATE (~10%), DELETE (~10%), MANAGE (~10%) = 100% */}
                <thead>
                  <tr className="bg-dark-base/80 border-b border-dark-border text-text-primary uppercase tracking-wider text-[11px] font-display font-bold select-none h-11">
                    <th className="py-2.5 px-4 w-[40%] text-left">MODULE</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">MASTER</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">READ</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">CREATE</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">UPDATE</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">DELETE</th>
                    <th className="py-2.5 px-2 w-[10%] text-center">MANAGE</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-dark-border">
                  {totalFilteredCount > 0 ? (
                    filteredGroups.map((group) => (
                      <tbody key={group.name} className="divide-y divide-dark-border">
                        {/* Group Header Row */}
                        <tr className="bg-dark-base/40">
                          <td
                            colSpan={7}
                            className="py-2 px-4 font-display font-bold text-xs text-text-primary tracking-wide"
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shrink-0" />
                              <span className="uppercase text-accent-cyan font-bold">{group.name}</span>
                              <span className="text-[10px] text-text-muted font-normal truncate">
                                — {group.description}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Module Rows */}
                        {group.modules.map((mod) => {
                          const perms = currentPermissions[mod.id] || {
                            read: false,
                            create: false,
                            update: false,
                            delete: false,
                            manage: false
                          }

                          const allActive = permissionActionKeys.every((k) => perms[k])
                          const someActive = permissionActionKeys.some((k) => perms[k])
                          const isMasterIndeterminate = someActive && !allActive

                          return (
                            <tr
                              key={mod.id}
                              className="hover:bg-accent-cyan/[0.02] transition-colors h-[54px]"
                            >
                              {/* Module Name & Info */}
                              <td className="py-2 px-4 align-middle">
                                <div className="font-bold text-text-primary text-xs leading-tight">
                                  {mod.name}
                                </div>
                                <div className="text-[11px] text-text-muted truncate mt-0.5 max-w-full">
                                  {mod.description}
                                </div>
                              </td>

                              {/* MASTER Checkbox */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMaster(mod.id)}
                                  aria-label={`${mod.name} - Master permission shortcut`}
                                  title={`${mod.name} - Master Shortcut`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    allActive
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : isMasterIndeterminate
                                      ? "bg-accent-cyan/15 border-accent-cyan text-accent-cyan"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {allActive ? (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  ) : isMasterIndeterminate ? (
                                    <Minus className="h-3 w-3 stroke-[3]" />
                                  ) : null}
                                </button>
                              </td>

                              {/* READ Checkbox (Unified Terra Tech Accent) */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod.id, "read")}
                                  aria-label={`${mod.name} - Read permission`}
                                  title={`${mod.name} - Read`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    perms.read
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {perms.read && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>

                              {/* CREATE Checkbox */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod.id, "create")}
                                  aria-label={`${mod.name} - Create permission`}
                                  title={`${mod.name} - Create`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    perms.create
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {perms.create && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>

                              {/* UPDATE Checkbox */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod.id, "update")}
                                  aria-label={`${mod.name} - Update permission`}
                                  title={`${mod.name} - Update`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    perms.update
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {perms.update && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>

                              {/* DELETE Checkbox */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod.id, "delete")}
                                  aria-label={`${mod.name} - Delete permission`}
                                  title={`${mod.name} - Delete`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    perms.delete
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {perms.delete && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>

                              {/* MANAGE Checkbox */}
                              <td className="py-2 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod.id, "manage")}
                                  aria-label={`${mod.name} - Manage permission`}
                                  title={`${mod.name} - Manage`}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 ${
                                    perms.manage
                                      ? "bg-accent-cyan border-accent-cyan text-white shadow-xs"
                                      : "bg-white border-dark-border text-transparent hover:border-accent-cyan/50"
                                  }`}
                                >
                                  {perms.manage && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 px-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2 text-text-muted">
                          <AlertTriangle className="h-6 w-6 text-amber-500/80" />
                          <div className="font-bold text-xs text-text-primary">
                            Module tidak ditemukan.
                          </div>
                          <p className="text-[11px] text-text-secondary max-w-sm">
                            Tidak ada modul yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kriteria filter yang dipilih.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                            className="text-[11px] font-bold text-accent-cyan hover:underline pt-1"
                          >
                            Reset pencarian & filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Helper */}
            <div className="p-3 bg-dark-base/50 border-t border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-text-primary">Keterangan:</span>
                <span>Klik cell atau Master untuk mengubah izin secara visual.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-accent-cyan flex items-center justify-center text-white text-[8px] font-bold">✓</span>
                  <span>Aktif</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-white border border-dark-border" />
                  <span>Nonaktif</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center text-accent-cyan text-[8px] font-bold">-</span>
                  <span>Indeterminate</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl border border-dark-border p-5 max-w-sm w-full shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold font-display text-text-primary">
                  Reset permission ke konfigurasi awal?
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Perubahan konfigurasi permission yang belum disimpan akan dikembalikan ke pengaturan standar sistem.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-dark-border text-xs font-semibold text-text-secondary hover:bg-dark-base transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
