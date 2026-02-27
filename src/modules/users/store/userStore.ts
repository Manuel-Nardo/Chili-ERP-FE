import * as userService from '@/services/userService'
import { useNotificationStore } from '@/stores/notifications'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selected = ref<any>(null)
  const modalOpen = ref(false)
  const showPassword = ref(false)
  const notification = useNotificationStore()

  const form = ref({
    id: null,
    name: '',
    email: '',
    password: '',
  })

  function resetForm() {
    form.value = { id: null, name: '', email: '' , password: '' }
    selected.value = null
  }

  const getUsers = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await userService.fetchUsers(params)
      users.value = data.data
      total.value = data.total
    } catch (e: any) {
      error.value = e.message || 'Error al cargar usuarios'
    }
    loading.value = false
  }

  function openAddModal() {
    resetForm()
    modalOpen.value = true
  }

  function openEditModal(user: any) {
    form.value = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password
    }
    selected.value = user
    modalOpen.value = true
  }

  async function saveUser() {
    loading.value = true
    try {
      if (!form.value.name || !form.value.email || (!form.value.id && !form.value.password)) {
        notification.notify('Todos los campos son obligatorios.', 'error')
        loading.value = false
        return
      }
      if (form.value.id) {
        await userService.updateUser(form.value.id, form.value)
        notification.notify('Usuario actualizado correctamente.')
      } else {
        await userService.createUser(form.value)
        notification.notify('Usuario creado correctamente.')
      }
      await getUsers()
      modalOpen.value = false
      loading.value = false
    } catch (e: any) {
      notification.notify(e.message || 'Error al guardar usuario.', 'error')
    }
    loading.value = false
  }

  async function removeUser(id: number) {
    loading.value = true
    try {
      await userService.deleteUser(id)
      notification.notify('Usuario eliminado correctamente.')
      await getUsers()
    } catch (e: any) {
      notification.notify('Error al eliminar usuario.', 'error')
    }
    loading.value = false
  }

  return {
    users,
    total,
    loading,
    error,
    selected,
    form,
    modalOpen,
    getUsers,
    openAddModal,
    openEditModal,
    saveUser,
    removeUser,
    resetForm,
    showPassword,
  }
})
