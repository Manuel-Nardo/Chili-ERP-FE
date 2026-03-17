import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type Option = {
  title: string
  value: number
}

export type SerieSucursalRow = {
  id: number
  serie: string
  folio_actual: number
  activo: boolean
  cliente?: {
    id: number
    nombre: string
  } | null
  tipoSerie?: {
    id: number
    nombre: string
    clave: string
    activo?: boolean
  } | null
  tipo_serie?: {
    id: number
    nombre: string
    clave: string
    activo?: boolean
  } | null
  cliente_id?: number
  tipo_serie_id?: number
}

export const useSeriesSucursalStore = defineStore('seriesSucursal', () => {
  const { success, error } = useSwal()

  const seriesSucursal = ref<SerieSucursalRow[]>([])
  const clienteOptions = ref<Option[]>([])
  const tipoSerieOptions = ref<Option[]>([])
  const loading = ref(false)

  const extractArray = (res: any) => {
    const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data)) return res.data
    return Array.isArray(data) ? data : []
  }

  const fetchSeriesSucursal = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/series-sucursal')
      seriesSucursal.value = extractArray(res)
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const fetchClientes = async () => {
    try {
      const res: any = await $api('/catalogos/clientes')
      const items = extractArray(res)

      clienteOptions.value = items
        .filter((item: any) => item.activo === undefined || item.activo === true || item.activo === 1)
        .map((item: any) => ({
          title: item.nombre,
          value: item.id,
        }))
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const fetchTiposSerie = async () => {
    try {
      const res: any = await $api('/catalogos/tipos-serie')
      const items = extractArray(res)

      tipoSerieOptions.value = items
        .filter((item: any) => item.activo === undefined || item.activo === true || item.activo === 1)
        .map((item: any) => ({
          title: `${item.nombre} (${item.clave})`,
          value: item.id,
        }))
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const initialize = async () => {
    loading.value = true
    try {
      await Promise.all([
        fetchSeriesSucursal(),
        fetchClientes(),
        fetchTiposSerie(),
      ])
    } finally {
      loading.value = false
    }
  }

  const createSerieSucursal = async (payload: Record<string, any>) => {
    try {
      const res: any = await $api('/catalogos/series-sucursal', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Serie por cliente creada correctamente.')
      await fetchSeriesSucursal()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateSerieSucursal = async (id: number, payload: Record<string, any>) => {
    try {
      const res: any = await $api(`/catalogos/series-sucursal/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Serie por cliente actualizada correctamente.')
      await fetchSeriesSucursal()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteSerieSucursal = async (id: number) => {
    try {
      await $api(`/catalogos/series-sucursal/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Serie por cliente eliminada correctamente.')
      await fetchSeriesSucursal()
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
      ?? data?.errors?.cliente_id?.[0]
      ?? data?.errors?.tipo_serie_id?.[0]
      ?? data?.errors?.serie?.[0]
      ?? data?.errors?.folio_actual?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formClienteId = ref<number | null>(null)
  const formTipoSerieId = ref<number | null>(null)
  const formSerie = ref('')
  const formFolioActual = ref<number | string>(0)
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formClienteId.value = null
    formTipoSerieId.value = null
    formSerie.value = ''
    formFolioActual.value = 0
    formActivo.value = true
  }

  const openCreate = async () => {
    resetForm()

    if (!clienteOptions.value.length || !tipoSerieOptions.value.length) {
      await Promise.all([fetchClientes(), fetchTiposSerie()])
    }

    drawerOpen.value = true
  }

  const openEdit = async (item: SerieSucursalRow) => {
    if (!clienteOptions.value.length || !tipoSerieOptions.value.length) {
      await Promise.all([fetchClientes(), fetchTiposSerie()])
    }

    editingId.value = item.id
    formClienteId.value = item.cliente_id ?? item.cliente?.id ?? null
    formTipoSerieId.value = item.tipo_serie_id ?? item.tipoSerie?.id ?? item.tipo_serie?.id ?? null
    formSerie.value = item.serie ?? ''
    formFolioActual.value = item.folio_actual ?? 0
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDrawer = async () => {
    if (!formClienteId.value || !formTipoSerieId.value || !formSerie.value.trim()) return

    saving.value = true
    try {
      const payload = {
        cliente_id: formClienteId.value,
        tipo_serie_id: formTipoSerieId.value,
        serie: formSerie.value.trim().toUpperCase(),
        folio_actual: Number(formFolioActual.value),
        activo: formActivo.value,
      }

      if (isEdit.value) await updateSerieSucursal(editingId.value!, payload)
      else await createSerieSucursal(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    seriesSucursal,
    clienteOptions,
    tipoSerieOptions,
    loading,

    initialize,
    fetchSeriesSucursal,
    fetchClientes,
    fetchTiposSerie,
    createSerieSucursal,
    updateSerieSucursal,
    deleteSerieSucursal,

    drawerOpen,
    saving,
    editingId,
    formClienteId,
    formTipoSerieId,
    formSerie,
    formFolioActual,
    formActivo,
    isEdit,
    resetForm,
    openCreate,
    openEdit,
    closeDrawer,
    saveFromDrawer,
  }
})
