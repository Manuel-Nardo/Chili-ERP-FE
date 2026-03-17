import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type TipoSerieRow = {
  id: number
  nombre: string
  clave: string
  activo: boolean
}

export const useTiposSerieStore = defineStore('tiposSerie', () => {
  const { success, error } = useSwal()

  const tiposSerie = ref<TipoSerieRow[]>([])
  const loading = ref(false)

  const fetchTiposSerie = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/tipos-serie')
      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

      if (Array.isArray(res?.data?.data?.data)) tiposSerie.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) tiposSerie.value = res.data.data
      else if (Array.isArray(res?.data)) tiposSerie.value = res.data
      else tiposSerie.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createTipoSerie = async (payload: { nombre: string; clave: string; activo: boolean }) => {
    try {
      const res: any = await $api('/catalogos/tipos-serie', { method: 'POST', body: payload })
      await success('Listo', 'Tipo de serie creado correctamente.')
      await fetchTiposSerie()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateTipoSerie = async (id: number, payload: { nombre?: string; clave?: string; activo?: boolean }) => {
    try {
      const res: any = await $api(`/catalogos/tipos-serie/${id}`, { method: 'PUT', body: payload })
      await success('Listo', 'Tipo de serie actualizado correctamente.')
      await fetchTiposSerie()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteTipoSerie = async (id: number) => {
    try {
      await $api(`/catalogos/tipos-serie/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Tipo de serie eliminado correctamente.')
      await fetchTiposSerie()
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
      ?? data?.errors?.clave?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formNombre = ref('')
  const formClave = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formClave.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (item: TipoSerieRow) => {
    editingId.value = item.id
    formNombre.value = item.nombre ?? ''
    formClave.value = item.clave ?? ''
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDrawer = async () => {
    if (!formNombre.value.trim() || !formClave.value.trim()) return

    saving.value = true
    try {
      const payload = {
        nombre: formNombre.value.trim(),
        clave: formClave.value.trim().toUpperCase(),
        activo: formActivo.value,
      }

      if (isEdit.value) await updateTipoSerie(editingId.value!, payload)
      else await createTipoSerie(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    tiposSerie,
    loading,
    fetchTiposSerie,
    createTipoSerie,
    updateTipoSerie,
    deleteTipoSerie,

    drawerOpen,
    saving,
    editingId,
    formNombre,
    formClave,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDrawer,
  }
})
