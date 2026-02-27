import { useAbility } from '@casl/vue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type UserData = {
  id: number
  name: string
  email: string
  sucursal_id?: number | null
}

export const useAuthStore = defineStore('auth', () => {
  const ability = useAbility()

  // Persistencia (cookies Vuexy)
  const tokenCookie = useCookie<string | null>('accessToken')
  const userCookie = useCookie<UserData | null>('userData')
  const rulesCookie = useCookie<any[]>('userAbilityRules')

  // State
  const token = ref<string | null>(tokenCookie.value ?? null)
  const user = ref<UserData | null>(userCookie.value ?? null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Helpers
  const setAbilityFromRoles = (rolesList: string[]) => {
    // ✅ por ahora: super_admin => full access
    if (rolesList.includes('super_admin')) {
      const rules = [{ action: 'manage', subject: 'all' }]
      rulesCookie.value = rules
      ability.update(rules)
      return
    }

    // Si no hay reglas todavía
    rulesCookie.value = []
    ability.update([])
  }

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const res: any = await $api('/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      // Backend response
      token.value = res.token
      user.value = res.user
      roles.value = res.roles ?? []
      permissions.value = res.permissions ?? []

      // Persist
      tokenCookie.value = token.value
      userCookie.value = user.value

      // Ability
      setAbilityFromRoles(roles.value)

      return res
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $api('/auth/logout', { method: 'POST' })
    } catch (_) {
      // ignore
    }

    token.value = null
    user.value = null
    roles.value = []
    permissions.value = []

    tokenCookie.value = null
    userCookie.value = null
    rulesCookie.value = []

    ability.update([])
  }

  const fetchMe = async () => {
    const res: any = await $api('/me')
    user.value = res.user
    roles.value = res.roles ?? []
    permissions.value = res.permissions ?? []

    userCookie.value = user.value
    setAbilityFromRoles(roles.value)

    return res
  }

  return {
    // state
    token, user, roles, permissions, loading,

    // getters
    isAuthenticated,

    // actions
    login, logout, fetchMe,
  }
})
