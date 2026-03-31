import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type RemisionErpDetalleRow = {
  id?: number
  articulo_id: number
  articulo_nombre?: string | null
  producto?: {
    id: number
    nombre: string
    clave?: string | null
  } | null
  cantidad: number
  precio_unitario: number
  importe: number
  iva: number
  impuesto_iva: number
  total: number
  estatus?: string | null
  observaciones?: string | null
}

export type RemisionErpRow = {
  id: number
  pedido_id?: number | null
  folio?: string | number | null
  estatus?: string | null
  fecha_remision?: string | null
  fecha_objetivo?: string | null
  sucursal_origen_id?: number | null
  sucursal_destino_id?: number | null
  subtotal?: number
  impuestos?: number
  total?: number
  observaciones?: string | null
  detalles?: RemisionErpDetalleRow[]
}

type ListResponse = {
  success?: boolean
  data?: any
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
  message?: string
}

type OneResponse = {
  success?: boolean
  data?: any
  message?: string
}

export const useRemisionesErpStore = defineStore('remisiones-erp', () => {
  const items = ref<RemisionErpRow[]>([])
  const loading = ref(false)
  const loadingOne = ref(false)
  const generating = ref(false)

  const currentItem = ref<RemisionErpRow | null>(null)

  const page = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  const filters = ref({
    search: '',
    estatus: '',
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_destino_id: null as number | null,
    pedido_id: null as number | null,
  })

  const extractList = (payload: any): RemisionErpRow[] => {
    if (!payload)
      return []

    if (Array.isArray(payload))
      return payload

    if (Array.isArray(payload?.data))
      return payload.data

    if (Array.isArray(payload?.results))
      return payload.results

    return []
  }

  const extractOne = (payload: any): RemisionErpRow | null => {
    if (!payload)
      return null

    if (payload?.data && !Array.isArray(payload.data))
      return payload.data

    if (!Array.isArray(payload))
      return payload

    return null
  }

  const fetchList = async () => {
    loading.value = true

    try {
      const payload = {
        page: page.value,
        per_page: perPage.value,
        search: filters.value.search || null,
        estatus: filters.value.estatus || null,
        fecha_desde: filters.value.fecha_desde || null,
        fecha_hasta: filters.value.fecha_hasta || null,
        sucursal_destino_id: filters.value.sucursal_destino_id,
        pedido_id: filters.value.pedido_id,
      }

      const response = await $api('/remisiones-erp/search', {
        method: 'POST',
        body: payload,
      }) as ListResponse

      items.value = extractList(response?.data)
      total.value = response?.meta?.total ?? items.value.length
      lastPage.value = response?.meta?.last_page ?? 1
    } catch (error) {
      console.error('Error fetchList remisiones ERP:', error)
      items.value = []
      total.value = 0
      lastPage.value = 1
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (id: number | string) => {
    loadingOne.value = true
    currentItem.value = null

    try {
      const response = await $api(`/remisiones-erp/${id}`, {
        method: 'GET',
      }) as OneResponse

      currentItem.value = extractOne(response?.data) ?? extractOne(response)
    } catch (error) {
      console.error('Error fetchOne remision ERP:', error)
      currentItem.value = null
      throw error
    } finally {
      loadingOne.value = false
    }
  }

  const generarDesdePedido = async (pedidoId: number | string) => {
    generating.value = true

    try {
      const response = await $api(`/remisiones-erp/generar-desde-pedido/${pedidoId}`, {
        method: 'POST',
      }) as OneResponse

      const remision = extractOne(response?.data) ?? extractOne(response)

      if (!remision?.id)
        throw new Error('No se pudo obtener el ID de la remisión generada')

      return remision
    } catch (error) {
      console.error('Error generarDesdePedido:', error)
      throw error
    } finally {
      generating.value = false
    }
  }

  const resetFilters = async () => {
    filters.value = {
      search: '',
      estatus: '',
      fecha_desde: '',
      fecha_hasta: '',
      sucursal_destino_id: null,
      pedido_id: null,
    }

    page.value = 1
    await fetchList()
  }

  const resetCurrent = () => {
    currentItem.value = null
  }

  const formattedItems = computed(() => items.value)

  return {
    items,
    loading,
    loadingOne,
    generating,
    currentItem,
    page,
    perPage,
    total,
    lastPage,
    filters,
    formattedItems,
    fetchList,
    fetchOne,
    generarDesdePedido,
    resetFilters,
    resetCurrent,
  }
})
