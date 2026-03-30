import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PedidoErpDetalleRow = {
  id: number
  articulo_id?: number | null
  cantidad: number
  precio_unitario: number
  importe: number
  iva: number
  impuesto_iva: number
  total: number
  observaciones?: string | null
  producto?: {
    id: number
    clave?: string | null
    nombre: string
  } | null
}

export type PedidoErpRow = {
  id: number
  serie_id: number
  folio: number
  tipo_pedido_id: number
  estatus: string
  fecha_pedido: string
  fecha_objetivo?: string | null
  subtotal: number
  impuestos: number
  total: number
  origen_tipo?: string | null
  creado_por?: string | number | null
  observaciones?: string | null
  pedido_sugerencia_id?: number | null
  tipo_pedido?: {
    id: number
    nombre: string
  } | null
  sucursal_destino?: {
    id: number
    nombre: string
  } | null
  sucursal_origen?: {
    id: number
    nombre: string
  } | null
  serie_sucursal?: {
    id: number
    serie?: string | null
  } | null
  detalles?: PedidoErpDetalleRow[]
}

export const usePedidosErpStore = defineStore('pedidos-erp', () => {
  const { error } = useSwal()

  const loading = ref(false)
  const loadingOne = ref(false)

  const items = ref<PedidoErpRow[]>([])
  const pedido = ref<PedidoErpRow | null>(null)

  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(15)
  const lastPage = ref(1)

  const filtersEstatus = ref<string | null>(null)
  const filtersTipoPedidoId = ref<number | null>(null)
  const filtersSucursalDestinoId = ref<number | null>(null)
  const filtersFechaDesde = ref<string | null>(null)
  const filtersFechaHasta = ref<string | null>(null)
  const q = ref('')

  const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Serie/Folio', key: 'folio_display' },
    { title: 'Tipo pedido', key: 'tipo_pedido' },
    { title: 'Fecha pedido', key: 'fecha_pedido' },
    { title: 'Fecha objetivo', key: 'fecha_objetivo' },
    { title: 'Destino', key: 'sucursal_destino' },
    { title: 'Estatus', key: 'estatus' },
    { title: 'Total', key: 'total', align: 'end' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
  ]

  const normalizeDetalle = (row: any): PedidoErpDetalleRow => ({
    id: Number(row?.id ?? 0),
    articulo_id: row?.articulo_id != null ? Number(row.articulo_id) : null,
    cantidad: Number(row?.cantidad ?? 0),
    precio_unitario: Number(row?.precio_unitario ?? 0),
    importe: Number(row?.importe ?? 0),
    iva: Number(row?.iva ?? 0),
    impuesto_iva: Number(row?.impuesto_iva ?? 0),
    total: Number(row?.total ?? 0),
    observaciones: row?.observaciones ?? null,
    producto: row?.producto
      ? {
          id: Number(row.producto?.id ?? 0),
          clave: row.producto?.clave ?? null,
          nombre: row.producto?.nombre ?? '',
        }
      : null,
  })

  const normalizeRow = (row: any): PedidoErpRow => ({
    id: Number(row?.id ?? 0),
    serie_id: Number(row?.serie_id ?? 0),
    folio: Number(row?.folio ?? 0),
    tipo_pedido_id: Number(row?.tipo_pedido_id ?? 0),
    estatus: row?.estatus ?? '',
    fecha_pedido: row?.fecha_pedido ?? '',
    fecha_objetivo: row?.fecha_objetivo ?? null,
    subtotal: Number(row?.subtotal ?? 0),
    impuestos: Number(row?.impuestos ?? 0),
    total: Number(row?.total ?? 0),
    origen_tipo: row?.origen_tipo ?? row?.origen ?? null,
    creado_por: row?.creado_por ?? null,
    observaciones: row?.observaciones ?? null,
    pedido_sugerencia_id: row?.pedido_sugerencia_id != null ? Number(row.pedido_sugerencia_id) : null,
    tipo_pedido: row?.tipo_pedido ?? row?.tipoPedido ?? null,
    sucursal_destino: row?.sucursal_destino ?? row?.sucursalDestino ?? null,
    sucursal_origen: row?.sucursal_origen ?? row?.sucursalOrigen ?? null,
    serie_sucursal: row?.serie_sucursal ?? row?.serieSucursal ?? null,
    detalles: Array.isArray(row?.detalles) ? row.detalles.map(normalizeDetalle) : [],
  })

  const buildPayload = (page = 1) => ({
    page,
    per_page: perPage.value,
    estatus: filtersEstatus.value || null,
    tipo_pedido_id: filtersTipoPedidoId.value || null,
    sucursal_destino_id: filtersSucursalDestinoId.value || null,
    fecha_desde: filtersFechaDesde.value || null,
    fecha_hasta: filtersFechaHasta.value || null,
    search: q.value.trim() || null,
  })

  const fetchItems = async (page = 1) => {
    loading.value = true

    try {
      const payload = buildPayload(page)

      const res: any = await $api('/pedidos-erp/buscar', {
        method: 'POST',
        body: payload,
      })

      const rows = Array.isArray(res?.data) ? res.data.map(normalizeRow) : []
      const meta = res?.meta ?? {}

      items.value = rows
      total.value = Number(meta?.total ?? 0)
      currentPage.value = Number(meta?.current_page ?? page)
      perPage.value = Number(meta?.per_page ?? perPage.value)
      lastPage.value = Number(meta?.last_page ?? 1)
    } catch (e: any) {
      items.value = []
      total.value = 0
      currentPage.value = 1
      lastPage.value = 1

      await error('Error', e?.message || 'No se pudieron cargar los pedidos ERP.')
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (id: number) => {
    if (!id) return

    loadingOne.value = true

    try {
      const res: any = await $api(`/pedidos-erp/${id}`, {
        method: 'GET',
      })

      pedido.value = res?.data ? normalizeRow(res.data) : null
    } catch (e: any) {
      pedido.value = null
      await error('Error', e?.message || 'No se pudo cargar el pedido ERP.')
    } finally {
      loadingOne.value = false
    }
  }

  const applyFilters = async () => {
    currentPage.value = 1
    await fetchItems(1)
  }

  const handlePageChange = async (page: number) => {
    await fetchItems(page)
  }

  const handlePerPageChange = async (value: number) => {
    perPage.value = value
    currentPage.value = 1
    await fetchItems(1)
  }

  const clearFilters = async () => {
    filtersEstatus.value = null
    filtersTipoPedidoId.value = null
    filtersSucursalDestinoId.value = null
    filtersFechaDesde.value = null
    filtersFechaHasta.value = null
    q.value = ''
    currentPage.value = 1

    await fetchItems(1)
  }

  const reset = () => {
    pedido.value = null
    loadingOne.value = false
  }

  return {
    loading,
    loadingOne,

    items,
    pedido,

    total,
    currentPage,
    perPage,
    lastPage,

    filtersEstatus,
    filtersTipoPedidoId,
    filtersSucursalDestinoId,
    filtersFechaDesde,
    filtersFechaHasta,
    q,

    headers,

    fetchItems,
    fetchOne,
    applyFilters,
    handlePageChange,
    handlePerPageChange,
    clearFilters,
    reset,
  }
})
