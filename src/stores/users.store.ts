import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type UserRow = {
  id: number
  name: string
  email: string
  roles: string[] | null
}

export const useUsersStore = defineStore('users', () => {
  const { success, error } = useSwal()

  const users = ref<UserRow[]>([])
  const loading = ref(false)

  const fetchUsers = async () => {
    loading.value = true
    try {
      const res: any = await $api('/rbac/users?with_roles=1')
      users.value = res.data ?? []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (payload: { name: string; email: string; password: string; roles: string[] }) => {
    try {
      const res: any = await $api('/rbac/users', { method: 'POST', body: payload })
      await success('Listo', 'Usuario creado correctamente.')
      await fetchUsers()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateUser = async (id: number, payload: { name?: string; email?: string; password?: string | null; roles?: string[] }) => {
    try {
      const res: any = await $api(`/rbac/users/${id}`, { method: 'PUT', body: payload })
      await success('Listo', 'Usuario actualizado correctamente.')
      await fetchUsers()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await $api(`/rbac/users/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Usuario eliminado correctamente.')
      await fetchUsers()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data
    const msg =
      data?.message ??
      data?.errors?.email?.[0] ??
      data?.errors?.name?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formEmail = ref('')
  const formPassword = ref('')
  const formRoles = ref<string[]>([])

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formName.value = ''
    formEmail.value = ''
    formPassword.value = ''
    formRoles.value = []
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (u: UserRow) => {
    editingId.value = u.id
    formName.value = u.name ?? ''
    formEmail.value = u.email ?? ''
    formPassword.value = '' // no se precarga
    formRoles.value = Array.isArray(u.roles) ? [...u.roles] : []
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formName.value.trim() || !formEmail.value.trim()) return

    saving.value = true
    try {
      if (isEdit.value) {
        await updateUser(editingId.value!, {
          name: formName.value.trim(),
          email: formEmail.value.trim(),
          password: formPassword.value.trim() ? formPassword.value : null,
          roles: formRoles.value ?? [],
        })
      } else {
        await createUser({
          name: formName.value.trim(),
          email: formEmail.value.trim(),
          password: formPassword.value,
          roles: formRoles.value ?? [],
        })
      }

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,

    drawerOpen,
    saving,
    editingId,
    formName,
    formEmail,
    formPassword,
    formRoles,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
