import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type TipoClienteRow = {
  id: number
  clave: string
  nombre: string
  activo: boolean
}

export const useTiposClientesStore = defineStore('tipos_clientes', () => {
  const { success, error } = useSwal()

  const tipos = ref<TipoClienteRow[]>([])
  const loading = ref(false)

  const fetchTipos = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/tipos-cliente')
      // Normaliza si viene paginado o array
      if (Array.isArray(res?.data?.data?.data)) tipos.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) tipos.value = res.data.data
      else if (Array.isArray(res?.data)) tipos.value = res.data
      else tipos.value = []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createTipo = async (payload: { clave: string; nombre: string; activo: boolean }) => {
    try {
      const res: any = await $api('/catalogos/tipos-cliente', { method: 'POST', body: payload })
      await success('Listo', 'Tipo creado correctamente.')
      await fetchTipos()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateTipo = async (id: number, payload: { clave?: string; nombre?: string; activo?: boolean }) => {
    try {
      const res: any = await $api(`/catalogos/tipos-cliente/${id}`, { method: 'PUT', body: payload })
      await success('Listo', 'Tipo actualizado correctamente.')
      await fetchTipos()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteTipo = async (id: number) => {
    try {
      await $api(`/catalogos/tipos-cliente/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Tipo eliminado correctamente.')
      await fetchTipos()
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
      data?.errors?.clave?.[0] ??
      data?.errors?.nombre?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formClave = ref('')
  const formNombre = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formClave.value = ''
    formNombre.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (t: TipoClienteRow) => {
    editingId.value = t.id
    formClave.value = t.clave ?? ''
    formNombre.value = t.nombre ?? ''
    formActivo.value = !!t.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formClave.value.trim() || !formNombre.value.trim()) return

    saving.value = true
    try {
      const payload = {
        clave: formClave.value.trim().toUpperCase(),
        nombre: formNombre.value.trim(),
        activo: formActivo.value,
      }

      if (isEdit.value) {
        await updateTipo(editingId.value!, payload)
      } else {
        await createTipo(payload)
      }

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    tipos,
    loading,
    fetchTipos,
    createTipo,
    updateTipo,
    deleteTipo,

    drawerOpen,
    saving,
    editingId,
    formClave,
    formNombre,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
