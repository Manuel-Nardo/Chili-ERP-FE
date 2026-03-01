import { useAbility } from '@casl/vue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type BackendUser = {
  id: number
  name: string
  email: string
  sucursal_id?: number | null
}

type LoginResponseBackend = {
  success: boolean
  token: string
  user: BackendUser
  roles?: string[]
  permissions?: string[]
}

type AbilityRule = { action: string; subject: string }

// Vuexy runtime data (guards, redirect, etc.)
type UserDataVuexy = BackendUser & {
  role?: string
  roles: string[]
  permissions: string[]
}

export type LoginResponseVuexy = {
  accessToken: string
  userData: UserDataVuexy
  userAbilityRules: AbilityRule[]
}

type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const ability = useAbility()

  // Cookies (Vuexy keys)
  const tokenCookie = useCookie<string | null>('accessToken')
  const userCookie = useCookie<UserDataVuexy | null>('userData')
  const rulesCookie = useCookie<AbilityRule[]>('userAbilityRules')

  // State
  const token = ref<string | null>(tokenCookie.value ?? null)
  const user = ref<UserDataVuexy | null>(userCookie.value ?? null)
  const loading = ref(false)

  // Expuesto para UI/errores (aunque Login.vue mantiene errors como el original)
  const loginErrors = ref<Record<'email' | 'password' | 'general', string[]>>({
    email: [],
    password: [],
    general: [],
  })

  const isAuthenticated = computed(() => !!token.value)

  const clearLoginErrors = () => {
    loginErrors.value = { email: [], password: [], general: [] }
  }

  const setGeneralError = (msg: string) => {
    loginErrors.value.general = [msg]
  }

  const permissionsToRules = (perms: string[]): AbilityRule[] => {
    return (perms ?? [])
      .map(p => String(p).trim())
      .filter(Boolean)
      .map(p => {
        // esperado: "users.view" => subject=users, action=view
        const parts = p.split('.')
        if (parts.length === 2) {
          const [subject, action] = parts
          return { action, subject }
        }
        return { action: p, subject: 'all' }
      })
  }

  const buildRules = (roles: string[], perms: string[]): AbilityRule[] => {
    if (roles.includes('super_admin')) return [{ action: 'manage', subject: 'all' }]
    return permissionsToRules(perms)
  }

  const normalizeLoginError = (err: any) => {
    const data = err?.data ?? err?.response?._data ?? err

    // Laravel: { errors: { email: ['..'], password: ['..'] }, message?: '...' }
    if (data?.errors && typeof data.errors === 'object') {
      loginErrors.value.email = Array.isArray(data.errors.email) ? data.errors.email : []
      loginErrors.value.password = Array.isArray(data.errors.password) ? data.errors.password : []
      if (!loginErrors.value.email.length && !loginErrors.value.password.length && typeof data.message === 'string')
        setGeneralError(data.message)
      return
    }

    if (typeof data?.message === 'string' && data.message) {
      setGeneralError(data.message)
      return
    }

    setGeneralError('Error al iniciar sesión.')
  }

  /**
   * ✅ LOGIN
   * - Devuelve el contrato Vuexy { accessToken, userData, userAbilityRules }
   * - Setea cookies con las mismas keys
   * - Actualiza ability
   */
  const login = async (payload: LoginPayload): Promise<LoginResponseVuexy> => {
    if (loading.value) throw new Error('busy')

    loading.value = true
    clearLoginErrors()

    try {
      const res = await $api<LoginResponseBackend>('/auth/login', {
        method: 'POST',
        body: {
          email: payload.email,
          password: payload.password,
          remember: payload.remember ?? false,
        },
      })

      if (!res?.token || !res?.user) {
        setGeneralError('Respuesta inválida del servidor.')
        throw new Error('invalid_response')
      }

      const roles = Array.isArray(res.roles) ? res.roles : []
      const permissions = Array.isArray(res.permissions) ? res.permissions : []

      const userData: UserDataVuexy = {
        ...res.user,
        role: roles[0],
        roles,
        permissions,
      }

      const userAbilityRules = buildRules(roles, permissions)

      const vuexyRes: LoginResponseVuexy = {
        accessToken: res.token,
        userData,
        userAbilityRules,
      }

      // ✅ Persist EXACTO (mismas keys de Vuexy)
      rulesCookie.value = userAbilityRules
      ability.update(userAbilityRules)

      userCookie.value = userData
      tokenCookie.value = res.token

      // state interno
      token.value = res.token
      user.value = userData

      return vuexyRes
    }
    catch (err: any) {
      normalizeLoginError(err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try { await $api('/auth/logout', { method: 'POST' }) } catch (_) {}

    token.value = null
    user.value = null

    tokenCookie.value = null
    userCookie.value = null
    rulesCookie.value = []

    ability.update([])
  }

  const fetchMe = async () => {
    const res: any = await $api('/me')

    const u: BackendUser | null = res.user ?? null
    const roles = Array.isArray(res.roles) ? res.roles : []
    const permissions = Array.isArray(res.permissions) ? res.permissions : []

    const userData: UserDataVuexy | null = u
      ? { ...u, role: roles[0], roles, permissions }
      : null

    const rules = userData ? buildRules(roles, permissions) : []

    userCookie.value = userData
    rulesCookie.value = rules
    ability.update(rules)

    user.value = userData
    return res
  }

  return {
    // state
    token,
    user,
    loading,

    // ui
    loginErrors,

    // getters
    isAuthenticated,

    // actions
    login,
    logout,
    fetchMe,
    clearLoginErrors,
  }
})
