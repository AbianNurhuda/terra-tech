import client from "@/api/client"

export const authService = {
  async login(email, password) {
    return client.post("auth/login", { email, password })
  },
  
  async logout() {
    try {
      await client.post("auth/logout")
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem("api_token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
    }
  },
  
  async me() {
    return client.get("auth/me")
  },

  async refreshCurrentUser() {
    const res = await this.me()
    if (res.success && res.data) {
      const user = res.data.user || res.data
      let roleName = "operator"
      if (user.role && typeof user.role === "string") {
        roleName = user.role.toLowerCase()
      } else if (Array.isArray(user.roles) && user.roles.length > 0) {
        const first = user.roles[0]
        roleName = typeof first === "object" ? (first.name || first.slug || "operator") : String(first).toLowerCase()
      }
      localStorage.setItem("userRole", roleName)
      localStorage.setItem("userEmail", user.email || "")
      localStorage.setItem("userName", user.name || "User Staf")
      return { success: true, user, role: roleName }
    } else {
      await this.logout()
      return { success: false, error: res.message }
    }
  }
}

export const dashboardService = {
  async getDashboard(limit = 5) {
    return client.get(`cms/dashboard?limit=${limit}`)
  },
  
  async getSystemHealth() {
    return client.get("cms/dashboard/system-health")
  }
}

export const informationService = {
  async getPosts(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.category_id && params.category_id !== "all") query.append("category_id", params.category_id)
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/information?${query.toString()}`)
  },
  
  async getPost(id) {
    return client.get(`cms/information/${id}`)
  },
  
  async createPost(formData) {
    return client.post("cms/information", formData)
  },
  
  async updatePost(id, formData) {
    // For file upload in Laravel update, method spoofing is required.
    // Ensure _method=PUT is appended in calling code FormData, or we append it here
    if (formData instanceof FormData) {
      if (!formData.has("_method")) {
        formData.append("_method", "PUT")
      }
      return client.post(`cms/information/${id}`, formData)
    }
    return client.put(`cms/information/${id}`, formData)
  },
  
  async deletePost(id) {
    return client.delete(`cms/information/${id}`)
  }
}

export const announcementService = {
  async getAnnouncements(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.priority && params.priority !== "all") query.append("priority", params.priority.toLowerCase())
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/announcements?${query.toString()}`)
  },
  
  async getAnnouncement(id) {
    return client.get(`cms/announcements/${id}`)
  },
  
  async createAnnouncement(formData) {
    return client.post("cms/announcements", formData)
  },
  
  async updateAnnouncement(id, formData) {
    if (formData instanceof FormData) {
      if (!formData.has("_method")) {
        formData.append("_method", "PUT")
      }
      return client.post(`cms/announcements/${id}`, formData)
    }
    return client.put(`cms/announcements/${id}`, formData)
  },
  
  async deleteAnnouncement(id) {
    return client.delete(`cms/announcements/${id}`)
  }
}

export const timelineService = {
  async getTimelines(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/timelines?${query.toString()}`)
  },
  
  async getTimeline(id) {
    return client.get(`cms/timelines/${id}`)
  },
  
  async createTimeline(data) {
    return client.post("cms/timelines", data)
  },
  
  async updateTimeline(id, data) {
    return client.put(`cms/timelines/${id}`, data)
  },
  
  async deleteTimeline(id) {
    return client.delete(`cms/timelines/${id}`)
  }
}

export const fileService = {
  async getFiles(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.category_id && params.category_id !== "all") query.append("category_id", params.category_id)
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/files?${query.toString()}`)
  },
  
  async getFile(id) {
    return client.get(`cms/files/${id}`)
  },
  
  async createFile(formData) {
    return client.post("cms/files", formData)
  },
  
  async deleteFile(id) {
    return client.delete(`cms/files/${id}`)
  }
}

export const registrationService = {
  async getSteps(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/registration-steps?${query.toString()}`)
  },
  
  async getStep(id) {
    return client.get(`cms/registration-steps/${id}`)
  },
  
  async createStep(formData) {
    return client.post("cms/registration-steps", formData)
  },
  
  async updateStep(id, formData) {
    if (formData instanceof FormData) {
      if (!formData.has("_method")) {
        formData.append("_method", "PUT")
      }
      return client.post(`cms/registration-steps/${id}`, formData)
    }
    return client.put(`cms/registration-steps/${id}`, formData)
  },
  
  async deleteStep(id) {
    return client.delete(`cms/registration-steps/${id}`)
  }
}

export const userService = {
  async getUsers(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.role && params.role !== "all") query.append("role", params.role)
    if (params.status && params.status !== "all") query.append("status", params.status.toLowerCase())
    if (params.page) query.append("page", params.page)

    return client.get(`cms/users?${query.toString()}`)
  },

  async getUser(id) {
    return client.get(`cms/users/${id}`)
  },

  async createUser(data) {
    return client.post("cms/users", data)
  },

  async updateUser(id, data) {
    return client.put(`cms/users/${id}`, data)
  },

  async deleteUser(id) {
    return client.delete(`cms/users/${id}`)
  },

  async toggleUserStatus(id, status) {
    return client.put(`cms/users/${id}/status`, { status })
  },

  async changePassword(id, password) {
    return client.put(`cms/users/${id}/password`, { password })
  }
}

export const companyProfileService = {
  async getProfile() {
    return client.get("cms/company-profile")
  },

  async updateProfile(formDataOrData) {
    if (formDataOrData instanceof FormData) {
      if (!formDataOrData.has("_method")) {
        formDataOrData.append("_method", "PUT")
      }
      return client.post("cms/company-profile", formDataOrData)
    }
    return client.put("cms/company-profile", formDataOrData)
  }
}

export const documentCategoryService = {
  async getCategories(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.page) query.append("page", params.page)

    return client.get(`cms/file-categories?${query.toString()}`)
  },

  async getCategory(id) {
    return client.get(`cms/file-categories/${id}`)
  },

  async createCategory(data) {
    return client.post("cms/file-categories", data)
  },

  async updateCategory(id, data) {
    return client.put(`cms/file-categories/${id}`, data)
  },

  async deleteCategory(id) {
    return client.delete(`cms/file-categories/${id}`)
  }
}

