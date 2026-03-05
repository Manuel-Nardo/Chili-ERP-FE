import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ZonaRow = {
  id: number
  nombre: string
  activo: boolean
}

export const useZonasStore = defineStore('zonas', () => {
  const { success, error } = useSwal()

  const zonas = ref<ZonaRow[]>([])
  const loading = ref(false)

  const fetchZonas = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/zonas')
      // backend: { success:true, data: paginator|array }
      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data
      // Normalizamos por si viene paginado
      if (Array.isArray(res?.data?.data?.data)) zonas.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) zonas.value = res.data.data
      else if (Array.isArray(res?.data)) zonas.value = res.data
      else zonas.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createZona = async (payload: { nombre: string; activo: boolean }) => {
    try {
      const res: any = await $api('/catalogos/zonas', { method: 'POST', body: payload })
      await success('Listo', 'Zona creada correctamente.')
      await fetchZonas()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateZona = async (id: number, payload: { nombre?: string; activo?: boolean }) => {
    try {
      const res: any = await $api(`/catalogos/zonas/${id}`, { method: 'PUT', body: payload })
      await success('Listo', 'Zona actualizada correctamente.')
      await fetchZonas()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteZona = async (id: number) => {
    try {
      await $api(`/catalogos/zonas/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Zona eliminada correctamente.')
      await fetchZonas()
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
      data?.errors?.nombre?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formNombre = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (z: ZonaRow) => {
    editingId.value = z.id
    formNombre.value = z.nombre ?? ''
    formActivo.value = !!z.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formNombre.value.trim()) return

    saving.value = true
    try {
      if (isEdit.value) {
        await updateZona(editingId.value!, {
          nombre: formNombre.value.trim(),
          activo: formActivo.value,
        })
      } else {
        await createZona({
          nombre: formNombre.value.trim(),
          activo: formActivo.value,
        })
      }

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    zonas,
    loading,
    fetchZonas,
    createZona,
    updateZona,
    deleteZona,

    drawerOpen,
    saving,
    editingId,
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
