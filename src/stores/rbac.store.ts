import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type RoleDto = {
  id: number
  name: string
  users_count: number
  permissions: string[] 
}

export type UserDto = {
  id: number
  name: string
  email: string
  roles: string[] 
  status?: string
}

export const useRbacStore = defineStore('rbac', () => {
  const loadingRoles = ref(false)
  const loadingUsers = ref(false)

  const roles = ref<RoleDto[]>([])
  const users = ref<UserDto[]>([])
  const totalUsers = ref(0)

  const fetchRoles = async () => {
    loadingRoles.value = true
    try {
      const res: any = await $api('/rbac/roles', { method: 'GET' })
      roles.value = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : [])
    } finally {
      loadingRoles.value = false
    }
  }

  const fetchUsers = async (params: {
    q?: string
    role?: string
    status?: string
    itemsPerPage?: number
    page?: number
    sortBy?: string
    orderBy?: string
  } = {}) => {
    loadingUsers.value = true
    try {
      const res: any = await $api('/rbac/users', {
        method: 'GET',
        query: params,
      })

      // esperado: { users: [], total: n }
      users.value = Array.isArray(res.users) ? res.users : []
      totalUsers.value = Number(res.total ?? res.totalUsers ?? users.value.length)
    } finally {
      loadingUsers.value = false
    }
  }

  const roleCards = computed(() => roles.value.map(r => ({
    role: r.name,
    usersCount: r.users_count,
    permissions: r.permissions,
  })))

  return {
    // state
    roles,
    users,
    totalUsers,
    loadingRoles,
    loadingUsers,

    // computed
    roleCards,

    // actions
    fetchRoles,
    fetchUsers,
  }
})
