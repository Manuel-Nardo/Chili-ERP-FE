import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type LineaRow = {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export const useLineasStore = defineStore('lineas', () => {
  const { success, error } = useSwal()

  const lineas = ref<LineaRow[]>([])
  const loading = ref(false)

  const fetchLineas = async () => {
    loading.value = true

    try {
      const res: any = await $api('/catalogos/lineas')
      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

      if (Array.isArray(res?.data?.data?.data)) lineas.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) lineas.value = res.data.data
      else if (Array.isArray(res?.data)) lineas.value = res.data
      else lineas.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createLinea = async (payload: {
    nombre: string
    descripcion: string | null
    activo: boolean
  }) => {
    try {
      const res: any = await $api('/catalogos/lineas', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Línea creada correctamente.')
      await fetchLineas()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateLinea = async (
    id: number,
    payload: {
      nombre?: string
      descripcion?: string | null
      activo?: boolean
    },
  ) => {
    try {
      const res: any = await $api(`/catalogos/lineas/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Línea actualizada correctamente.')
      await fetchLineas()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteLinea = async (id: number) => {
    try {
      await $api(`/catalogos/lineas/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Línea eliminada correctamente.')
      await fetchLineas()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const msg =
      data?.message
      ?? data?.errors?.nombre?.[0]
      ?? data?.errors?.descripcion?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formNombre = ref('')
  const formDescripcion = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formDescripcion.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (l: LineaRow) => {
    editingId.value = l.id
    formNombre.value = l.nombre ?? ''
    formDescripcion.value = l.descripcion ?? ''
    formActivo.value = !!l.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDrawer = async () => {
    if (!formNombre.value.trim()) return

    saving.value = true

    try {
      const payload = {
        nombre: formNombre.value.trim(),
        descripcion: formDescripcion.value.trim() || null,
        activo: formActivo.value,
      }

      if (isEdit.value) await updateLinea(editingId.value!, payload)
      else await createLinea(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    lineas,
    loading,
    fetchLineas,
    createLinea,
    updateLinea,
    deleteLinea,

    drawerOpen,
    saving,
    editingId,
    formNombre,
    formDescripcion,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDrawer,
  }
})
