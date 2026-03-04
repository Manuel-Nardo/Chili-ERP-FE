// /src/stores/roles.store.ts
import { useSwal } from '@/composables/useSwal'
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
  const { success, error } = useSwal()

  const roles = ref<Role[]>([])
  const loading = ref(false)

  // =========================
  // UI: Drawer Permisos del Rol
  // =========================
  const permissionsDrawerOpen = ref(false)
  const permissionsSaving = ref(false)
  const permissionsRoleId = ref<number | null>(null)
  const permissionsRoleName = ref<string>('')
  const selectedPermissions = ref<string[]>([])

  const openPermissions = async (role: { id: number; name?: string; permissions?: string[] }) => {
    permissionsRoleId.value = role.id
    permissionsRoleName.value = role.name ?? ''
    selectedPermissions.value = []
    // si ya traes permissions en roles, úsalo:
    const res: any = await $api(`/rbac/roles/${role.id}?with_permissions=1`)
    selectedPermissions.value = res.data?.permissions ?? []
    permissionsDrawerOpen.value = true
  }

  const closePermissionsDrawer = () => {
    permissionsDrawerOpen.value = false
  }

  const syncRolePermissions = async () => {
    if (!permissionsRoleId.value) return

    permissionsSaving.value = true
    try {
      await $api(`/rbac/roles/${permissionsRoleId.value}/permissions`, {
        method: 'PUT',
        body: { permissions: selectedPermissions.value },
      })

      // refresca lista para que se actualice el conteo/array
      await fetchRoles()
    } finally {
      permissionsSaving.value = false
    }
  }

  const fetchRoles = async () => {
    loading.value = true
    try {
      const res: any = await $api('/rbac/roles')
      roles.value = res.data?.data ?? res.data ?? []
    } catch (e) {
      error('Error', 'No se pudieron cargar los roles.')
    } finally {
      loading.value = false
    }
  }

  const createRole = async (payload: { name: string; permissions: string[] }) => {
    try {
      const res: any = await $api('/rbac/roles', {
        method: 'POST',
        body: payload,
      })

      success('Rol creado correctamente')
      await fetchRoles()
      return res

    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateRole = async (id: number, payload: { name?: string; permissions?: string[] }) => {
    try {
      const res: any = await $api(`/rbac/roles/${id}`, {
        method: 'PUT',
        body: payload,
      })

      success('Rol actualizado correctamente')
      await fetchRoles()
      return res

    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteRole = async (id: number) => {
    try {
      await $api(`/rbac/roles/${id}`, { method: 'DELETE' })
      success('Rol eliminado correctamente')
      await fetchRoles()
    } catch (e: any) {
      handleApiError(e)
    }
  }

const handleApiError = (e: any) => {
  // Vuexy/$api suele usar ofetch: status + data, no axios response
  const status =
    e?.status ??
    e?.response?.status ??
    e?.data?.status

  const data =
    e?.data ??
    e?.response?.data ??
    e?.response?._data

  const message =
    data?.message ??
    (status === 422 ? 'Error de validación.' : null) ??
    (status === 409 ? 'Conflicto: recurso duplicado.' : null) ??
    'Ocurrió un error inesperado.'

  error('Error', message)
}

  // =========================
  // UI State
  // =========================
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

  const saveFromDialog = async () => {
    if (!formName.value?.trim()) return

    saving.value = true
    try {
      const payload = {
        name: formName.value.trim(),
        permissions: formPermissions.value ?? [],
      }

      if (isEdit.value)
        await updateRole(editingId.value!, payload)
      else
        await createRole(payload)

      closeDrawer()
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

    drawerOpen,
    saving,
    editingId,
    formName,
    formPermissions,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,

    
    permissionsDrawerOpen,
    permissionsSaving,
    permissionsRoleId,
    permissionsRoleName,
    selectedPermissions,
    openPermissions,
    closePermissionsDrawer,
    syncRolePermissions,
  }
})
