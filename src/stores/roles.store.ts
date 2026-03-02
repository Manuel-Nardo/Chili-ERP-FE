// /src/stores/roles.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type Role = {
  id: number
  name: string
  guard_name: string
  permissions: string[]
  users_count: number
}

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([])
  const loading = ref(false)

    // UI
    const drawerOpen = ref(false)
    const saving = ref(false)

    const editingId = ref<number | null>(null)
    const formName = ref('')
    const formPermissions = ref<string[]>([])

    const isEdit = computed(() => editingId.value !== null)

    const resetForm = () => {
        editingId.value = null
        formName.value = ''
        formPermissions.value = []
    }

    const openCreate = () => {
        resetForm()
        drawerOpen.value = true
    }

const openEdit = (role: { id: number; name?: string; permissions?: string[] }) => {
  editingId.value = role.id
  formName.value = role.name ?? ''
  formPermissions.value = role.permissions ?? []
  drawerOpen.value = true
}

const closeDrawer = () => {
  drawerOpen.value = false
}

  const fetchRoles = async () => {
    loading.value = true
    try {
      const res: any = await $api('/rbac/roles')
      roles.value = res.data ?? []
    } finally {
      loading.value = false
    }
  }

  const createRole = async (payload: { name: string; permissions: string[] }) => {
    const res: any = await $api('/rbac/roles', { method: 'POST', body: payload })
    await fetchRoles()
    return res
  }

  const updateRole = async (id: number, payload: { name?: string; permissions?: string[] }) => {
    const res: any = await $api(`/rbac/roles/${id}`, { method: 'PUT', body: payload })
    await fetchRoles()
    return res
  }

  const deleteRole = async (id: number) => {
    await $api(`/rbac/roles/${id}`, { method: 'DELETE' })
    await fetchRoles()
  }

  // UI
  const dialogVisible = ref(false)
  const saving = ref(false)

  const editingId = ref<number | null>(null)
  const formName = ref('')
  const formPermissions = ref<string[]>([])

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formName.value = ''
    formPermissions.value = []
  }

  const openCreate = () => {
    resetForm()
    dialogVisible.value = true
  }

  const openEdit = (role: { id: number; name?: string; permissions?: string[] }) => {
    editingId.value = role.id
    formName.value = role.name ?? ''
    formPermissions.value = role.permissions ?? []
    dialogVisible.value = true
  }

  const closeDialog = () => {
    dialogVisible.value = false
  }

  const saveFromDialog = async () => {
    if (!formName.value?.trim()) return

    saving.value = true
    try {
      const payload = {
        name: formName.value.trim(),
        permissions: formPermissions.value ?? [],
      }

      if (isEdit.value) await updateRole(editingId.value!, payload)
      else await createRole(payload)

      closeDialog()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,

    dialogVisible,
    saving,
    editingId,
    formName,
    formPermissions,
    isEdit,
    openCreate,
    openEdit,
    closeDialog,
    resetForm,
    saveFromDialog,
  }
})
