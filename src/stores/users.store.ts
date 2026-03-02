// /src/stores/users.store.ts
import type { UserProperties } from '@db/apps/users/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

type SortBy = { key: string; order: 'asc' | 'desc' }[]

export const useUsersStore = defineStore('users', () => {
  // Filters
  const searchQuery = ref('')
  const selectedRole = ref<string | null>(null)
  const selectedPlan = ref<string | null>(null)
  const selectedStatus = ref<string | null>(null)

  // Datatable options
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref<string | undefined>(undefined)
  const orderBy = ref<'asc' | 'desc' | undefined>(undefined)
  const selectedRows = ref<number[]>([])

  // UI
  const isAddNewUserDrawerVisible = ref(false)

  // Data
  const loading = ref(false)
  const usersData = ref<{ users: UserProperties[]; totalUsers: number }>({
    users: [],
    totalUsers: 0,
  })

  const users = computed(() => usersData.value.users ?? [])
  const totalUsers = computed(() => usersData.value.totalUsers ?? 0)

  const updateOptions = (options: { sortBy?: SortBy }) => {
    const s = options?.sortBy?.[0]
    sortBy.value = s?.key
    orderBy.value = s?.order
  }

  const fetchUsers = async () => {
    loading.value = true
    try {
      // si tu proyecto ya trae createUrl/useApi, puedes seguir usándolos.
      // aquí lo dejo directo con $api para centralizar todo en store.
      const res: any = await $api('/apps/users', {
        query: {
          q: searchQuery.value,
          status: selectedStatus.value,
          plan: selectedPlan.value,
          role: selectedRole.value,
          itemsPerPage: itemsPerPage.value,
          page: page.value,
          sortBy: sortBy.value,
          orderBy: orderBy.value,
        },
      })

      // Ajusta esto si tu API devuelve distinto
      usersData.value = {
        users: res.users ?? res.data?.users ?? [],
        totalUsers: res.totalUsers ?? res.data?.totalUsers ?? 0,
      }
    } finally {
      loading.value = false
    }
  }

  const addNewUser = async (userData: UserProperties) => {
    await $api('/apps/users', { method: 'POST', body: userData })
    await fetchUsers()
  }

  const deleteUser = async (id: number) => {
    await $api(`/apps/users/${id}`, { method: 'DELETE' })

    // Remove from selectedRows
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)

    await fetchUsers()
  }

  return {
    // filters
    searchQuery,
    selectedRole,
    selectedPlan,
    selectedStatus,

    // datatable
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    updateOptions,

    // data
    loading,
    users,
    totalUsers,
    fetchUsers,

    // actions
    addNewUser,
    deleteUser,

    // ui
    isAddNewUserDrawerVisible,
  }
})
