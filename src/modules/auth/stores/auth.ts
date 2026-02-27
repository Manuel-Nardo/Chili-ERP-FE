import api from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {

  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const loading = ref<boolean>(false)
  const error = ref<string>('')
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value)
  const roles = computed(() => user.value?.roles || [])
  const permissions = computed(() => user.value?.permissions || [])


  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''

    try {
      const { data } = await api.post('login', { email, password })

      const apiUser = data.user

      const normalizedUser: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        roles: (apiUser.roles || []).map((r: any) => r.name), // ['admin', ...]
        permissions: [], // de momento vacío, hasta que el backend los mande
      }

      token.value = data.token
      localStorage.setItem('token', data.token)

      user.value = normalizedUser
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      loading.value = false

      router.push('/home')

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      loading.value = false
      return false
    }
  }


  async function fetchUser() {
    if (!token.value) return

    try {
      const { data } = await api.get('/me')

      const normalizedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        roles: (data.roles || []).map((r: any) => r.name),
        permissions: [],
      }

      user.value = normalizedUser
      localStorage.setItem('user', JSON.stringify(normalizedUser))
    } catch (err) {
      logout()
    }
  }


  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    
    user,
    token,
    loading,
    error,
    
    isAuthenticated,
    roles,
    permissions,
    
    login,
    fetchUser,
    logout,
  }
})
