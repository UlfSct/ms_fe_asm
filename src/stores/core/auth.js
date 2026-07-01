import {defineStore} from "pinia";
import {deleteCookie, getCookie, hasCookie, setCookie} from "@/utils/cookie.js";
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    isAuthenticated: false,
    isAdmin: false,
    loading: {
      login: false,
      logout: false,
      register: false,
      profile: false,
      profileUpdate: false,
      admin: false
    },
    profile: null
  }),
  getters: {
    getToken: state => state.token,
    getIsAuthenticated: state => state.isAuthenticated,
    getIsAdmin: state => state.isAdmin,
    getProfile: state => state.profile,
    loadingLogin: state => state.loading.login,
    loadingLogout: state => state.loading.logout,
    loadingRegister: state => state.loading.register,
    loadingProfile: state => state.loading.profile,
    loadingProfileUpdate: state => state.loading.profileUpdate,
    loadingAdmin: state => state.loading.admin,
  },
  actions: {
    checkCookieToken() {
      if (!hasCookie('auth_token_cookie')) return
      const token = getCookie('auth_token_cookie')
      this.isAuthenticated = true
      this.token = token
    },
    setToken(token) {
      if (!token) return
      setCookie('auth_token_cookie', token, {
        domain: window.location.hostname,
        days: 7,
        path: '/'
      })
      this.token = token
      this.isAuthenticated = true
    },
    deleteToken() {
      deleteCookie('auth_token_cookie')
      this.token = ''
      this.isAuthenticated = false
      this.isAdmin = false
    },
    async login(data) {
      this.loading.login = true
      try {
        let result = await sendRequest(urls.USERS.LOGIN, data, {}, {}, false)
        this.setToken(result.token)
      } catch (error) {
        throw error
      } finally {
        this.loading.login = false
      }
    },
    async logout() {
      this.loading.logout = true
      await sendRequest(urls.USERS.LOGOUT)
      this.deleteToken()
      this.loading.logout = false
    },
    async register(data) {
      this.loading.register = true
      try {
        let result = await sendRequest(urls.USERS.REGISTER, data, {},{}, false)
        this.setToken(result.token)
      } catch (error) {
        throw error
      } finally {
        this.loading.register = false
      }
    },
    async loadProfile() {
      this.loading.profile = true
      this.profile = await sendRequest(urls.USERS.PROFILE.GET)
      this.loading.profile = false
    },
    async updateProfile(data) {
      this.loading.profileUpdate = true
      try {
        this.profile = await sendRequest(urls.USERS.PROFILE.UPDATE, data)
      } catch (error) {
        throw error
      } finally {
        this.loading.profileUpdate = false
      }
    },
    async checkAdminPermissions() {
      this.loading.admin = true
      this.isAdmin = (await sendRequest(urls.USERS.PROFILE.CHECK_ADMIN)).is_admin
      this.loading.admin = false
    }
  }
})
