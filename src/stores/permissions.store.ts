// /src/stores/permissions.store.ts
import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type Permission = {
  id: number
  name: string
  guard_name: string
}

export const usePermissionsStore = defineStore('permissions', () => {
  const { success, error } = useSwal()

  const permissions = ref<Permission[]>([])
  const loading = ref(false)

  const fetchPermissions = async (q = '') => {
    loading.value = true
    try {
      const res: any = await $api('/rbac/permissions', { query: { q } })
      permissions.value = res.data ?? []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (payload: { name: string }) => {
    try {
      const res: any = await $api('/rbac/permissions', { method: 'POST', body: payload })
      success('Permiso creado')
      await fetchPermissions()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updatePermission = async (id: number, payload: { name?: string }) => {
    try {
      const res: any = await $api(`/rbac/permissions/${id}`, { method: 'PUT', body: payload })
      success('Permiso actualizado')
      await fetchPermissions()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deletePermission = async (id: number) => {
    try {
      await $api(`/rbac/permissions/${id}`, { method: 'DELETE' })
      success('Permiso eliminado')
      await fetchPermissions()
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const message =
      data?.errors?.name?.[0] ??
      data?.message ??
      (status === 422 ? 'Error de validación.' : null) ??
      (status === 409 ? 'Conflicto: permiso duplicado.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', message)
  }

  // UI (drawer/form)
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)
  const formName = ref('')

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formName.value = ''
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (p: Permission) => {
    editingId.value = p.id
    formName.value = p.name
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formName.value.trim()) return

    saving.value = true
    try {
      const payload = { name: formName.value.trim() }

      if (isEdit.value) await updatePermission(editingId.value!, payload)
      else await createPermission(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    permissions,
    loading,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,

    drawerOpen,
    saving,
    editingId,
    formName,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
