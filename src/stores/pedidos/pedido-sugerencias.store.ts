import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export type PedidoSugerenciaDetalleRow = {
  id?: number
  producto_id: number
  producto?: {
    id: number
    nombre: string
    clave?: string | null
  } | null
  cantidad_sugerida: number
  cantidad_ajustada: number
  cantidad_final: number
  observaciones: string | null
  metadata?: any
}

export type PedidoSugerenciaRow = {
  id: number
  cliente_id: number
  tipo_pedido_id: number
  fecha_objetivo: string
  estatus: string
  origen: string
  modelo: string | null
  observaciones: string | null
  pedido_erp_id?: number | null
  pedido_generado_at?: string | null
  cliente?: {
    id: number
    nombre: string
  } | null
  tipo_pedido?: {
    id: number
    nombre: string
  } | null
  detalles?: PedidoSugerenciaDetalleRow[]
  created_at?: string
  updated_at?: string
}

type SelectOption = {
  title: string
  value: number
  raw?: any
}

export const usePedidoSugerenciasStore = defineStore('pedido-sugerencias', () => {
  const { success, error, confirm } = useSwal()
  const router = useRouter()
  const dbg = (...args: any[]) => console.log('[pedido-store]', ...args)

  const loading = ref(false)
  const saving = ref(false)
  const generating = ref(false)
  const generatingPedido = ref(false)
  const generatingPedidoId = ref<number | null>(null)
  const loadingOne = ref(false)

  const items = ref<PedidoSugerenciaRow[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(15)

  const clientes = ref<SelectOption[]>([])
  const tiposPedido = ref<SelectOption[]>([])
  const productos = ref<SelectOption[]>([])

  const filtersClienteId = ref<number | null>(null)
  const filtersTipoPedidoId = ref<number | null>(null)
  const filtersEstatus = ref<string | null>(null)
  const filtersOrigen = ref<string | null>(null)
  const filtersFechaDesde = ref<string | null>(null)
  const filtersFechaHasta = ref<string | null>(null)
  const q = ref('')

  const editingId = ref<number | null>(null)

  const formClienteId = ref<number | null>(null)
  const formTipoPedidoId = ref<number | null>(null)
  const formFechaObjetivo = ref<string | null>(null)
  const formOrigen = ref<string>('manual')
  const formModelo = ref<string>('forecast_v1')
  const formObservaciones = ref<string>('')

  const formDiasHistorico = ref<number>(84)
  const formForzarRegeneracion = ref(false)
  const formEstatus = ref<string>('borrador')

  const formDetalles = ref<PedidoSugerenciaDetalleRow[]>([])

  const isEdit = computed(() => editingId.value !== null)
  const isDraft = computed(() => formEstatus.value === 'borrador')

  const headers = [
    { title: 'ID', key: 'id', align: 'start' },
    { title: 'Cliente', key: 'cliente' },
    { title: 'Tipo pedido', key: 'tipo_pedido' },
    { title: 'Fecha objetivo', key: 'fecha_objetivo' },
    { title: 'Origen', key: 'origen' },
    { title: 'Modelo', key: 'modelo' },
    { title: 'Estatus', key: 'estatus' },
    { title: 'Productos', key: 'productos', align: 'center' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
  ]

  const estatusOptions = [
    { title: 'Borrador', value: 'borrador' },
    { title: 'Confirmado', value: 'confirmado' },
    { title: 'Cancelado', value: 'cancelado' },
    { title: 'Procesado', value: 'procesado' },
  ]

  const origenOptions = [
    { title: 'Manual', value: 'manual' },
    { title: 'Forecast', value: 'forecast' },
  ]

  const totalProductos = computed(() => formDetalles.value.length)
  const totalSugerido = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_sugerida || 0), 0))
  const totalAjustado = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_ajustada || 0), 0))
  const totalFinal = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_final || 0), 0))

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? {}
    const message = data?.message || e?.message || 'Ocurrió un error inesperado.'

    dbg('handleApiError', { status, data, error: e })

    error('Error', message)
  }

  const unwrapResponse = (res: any) => {
    if (!res) return null
    if (res.data !== undefined) return res.data
    return res
  }

  const extractPayloadData = (res: any) => {
    const payload = unwrapResponse(res)
    return payload?.data ?? payload ?? null
  }

  const extractCollectionRows = (res: any) => {
    const payload = unwrapResponse(res)

    if (Array.isArray(payload))
      return payload

    if (Array.isArray(payload?.data))
      return payload.data

    if (Array.isArray(payload?.data?.data))
      return payload.data.data

    if (Array.isArray(payload?.results))
      return payload.results

    if (Array.isArray(payload?.data?.results))
      return payload.data.results

    return []
  }

  const extractCollectionMeta = (res: any) => {
    const payload = unwrapResponse(res)

    return payload?.meta
      ?? payload?.data?.meta
      ?? {
        total: payload?.total ?? payload?.data?.total ?? 0,
        current_page: payload?.current_page ?? payload?.data?.current_page ?? 1,
        per_page: payload?.per_page ?? payload?.data?.per_page ?? perPage.value,
      }
  }

  const extractDetalles = (row: any) => {
    return row?.detalles
      ?? row?.detalle
      ?? row?.details
      ?? []
  }

  const normalizeDetalle = (row: any): PedidoSugerenciaDetalleRow => ({
    id: row?.id ? Number(row.id) : undefined,
    producto_id: Number(row?.producto_id ?? row?.articulo_id ?? 0),
    producto: row?.producto
      ? {
          id: Number(row.producto.id),
          nombre: row.producto.nombre,
          clave: row.producto.clave ?? null,
        }
      : null,
    cantidad_sugerida: Number(row?.cantidad_sugerida ?? 0),
    cantidad_ajustada: Number(row?.cantidad_ajustada ?? row?.cantidad_sugerida ?? 0),
    cantidad_final: Number(row?.cantidad_final ?? row?.cantidad_ajustada ?? row?.cantidad_sugerida ?? 0),
    observaciones: row?.observaciones ?? null,
    metadata: row?.metadata ?? null,
  })

  const normalizeSugerencia = (row: any): PedidoSugerenciaRow => {
    const normalized = {
      id: Number(row?.id),
      cliente_id: Number(row?.cliente_id),
      tipo_pedido_id: Number(row?.tipo_pedido_id),
      fecha_objetivo: row?.fecha_objetivo,
      estatus: row?.estatus ?? 'borrador',
      origen: row?.origen ?? 'manual',
      modelo: row?.modelo ?? null,
      observaciones: row?.observaciones ?? null,
      pedido_erp_id: row?.pedido_erp_id ? Number(row.pedido_erp_id) : null,
      pedido_generado_at: row?.pedido_generado_at ?? null,
      cliente: row?.cliente ?? null,
      tipo_pedido: row?.tipo_pedido ?? row?.tipoPedido ?? null,
      detalles: extractDetalles(row).map(normalizeDetalle),
      created_at: row?.created_at,
      updated_at: row?.updated_at,
    }

    dbg('normalizeSugerencia', normalized)
    return normalized
  }

  const fetchClientes = async () => {
    try {
      dbg('fetchClientes:start')
      const res: any = await $api('/catalogos/clientes')
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      clientes.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))

      dbg('fetchClientes:end', clientes.value.length)
    } catch (e) {
      dbg('fetchClientes:error', e)
      clientes.value = []
    }
  }

  const fetchTiposPedido = async () => {
    try {
      dbg('fetchTiposPedido:start')
      const res: any = await $api('/catalogos/tipos-pedido')
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      tiposPedido.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))

      dbg('fetchTiposPedido:end', tiposPedido.value.length)
    } catch (e) {
      dbg('fetchTiposPedido:error', e)
      tiposPedido.value = []
    }
  }

  const fetchProductosByTipoPedido = async (tipoPedidoId: number | null) => {
    dbg('fetchProductosByTipoPedido:start', tipoPedidoId)

    if (!tipoPedidoId) {
      productos.value = []
      dbg('fetchProductosByTipoPedido:empty')
      return
    }

    try {
      const res: any = await $api(`/catalogos/productos?tipo_pedido_id=${tipoPedidoId}`)
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      productos.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))

      dbg('fetchProductosByTipoPedido:end', {
        tipoPedidoId,
        productos: productos.value.length,
      })
    } catch (e) {
      dbg('fetchProductosByTipoPedido:error', e)
      productos.value = []
    }
  }

  const hydrateFormFromItem = async (item: PedidoSugerenciaRow) => {
    dbg('hydrateFormFromItem:start', item)

    editingId.value = item.id
    formClienteId.value = item.cliente_id
    formTipoPedidoId.value = item.tipo_pedido_id
    formFechaObjetivo.value = item.fecha_objetivo
    formOrigen.value = item.origen ?? 'manual'
    formModelo.value = item.modelo ?? 'forecast_v1'
    formObservaciones.value = item.observaciones ?? ''
    formEstatus.value = item.estatus ?? 'borrador'

    await fetchProductosByTipoPedido(item.tipo_pedido_id)

    formDetalles.value = (item.detalles ?? []).map(d => ({
      id: d.id,
      producto_id: Number(d.producto_id ?? 0),
      producto: d.producto ?? null,
      cantidad_sugerida: Number(d.cantidad_sugerida ?? 0),
      cantidad_ajustada: Number(d.cantidad_ajustada ?? d.cantidad_sugerida ?? 0),
      cantidad_final: Number(d.cantidad_final ?? d.cantidad_ajustada ?? d.cantidad_sugerida ?? 0),
      observaciones: d.observaciones ?? null,
      metadata: d.metadata ?? null,
    }))

    dbg('hydrateFormFromItem:end', {
      editingId: editingId.value,
      formClienteId: formClienteId.value,
      formTipoPedidoId: formTipoPedidoId.value,
      formFechaObjetivo: formFechaObjetivo.value,
      formOrigen: formOrigen.value,
      formModelo: formModelo.value,
      formEstatus: formEstatus.value,
      detalles: formDetalles.value.length,
      productos: productos.value.length,
    })
  }

  const resetForm = () => {
    dbg('resetForm')

    editingId.value = null

    formClienteId.value = null
    formTipoPedidoId.value = null
    formFechaObjetivo.value = null
    formOrigen.value = 'manual'
    formModelo.value = 'forecast_v1'
    formObservaciones.value = ''
    formDiasHistorico.value = 84
    formForzarRegeneracion.value = false
    formEstatus.value = 'borrador'
    formDetalles.value = []
    productos.value = []

    dbg('resetForm:end', {
      editingId: editingId.value,
      formClienteId: formClienteId.value,
      formTipoPedidoId: formTipoPedidoId.value,
      formFechaObjetivo: formFechaObjetivo.value,
      detalles: formDetalles.value.length,
      productos: productos.value.length,
    })
  }

  const prepareWorkspace = async () => {
    dbg('prepareWorkspace:start')

    await Promise.all([
      fetchClientes(),
      fetchTiposPedido(),
    ])

    dbg('prepareWorkspace:end', {
      clientes: clientes.value.length,
      tiposPedido: tiposPedido.value.length,
    })
  }

  const fetchItems = async (page = 1) => {
    loading.value = true

    try {
      dbg('fetchItems:start', {
        page,
        perPage: perPage.value,
        filters: {
          cliente_id: filtersClienteId.value,
          tipo_pedido_id: filtersTipoPedidoId.value,
          estatus: filtersEstatus.value,
          origen: filtersOrigen.value,
          fecha_desde: filtersFechaDesde.value,
          fecha_hasta: filtersFechaHasta.value,
          q: q.value,
        },
      })

      const query = new URLSearchParams()

      query.set('page', String(page))
      query.set('per_page', String(perPage.value))

      if (filtersClienteId.value) query.set('cliente_id', String(filtersClienteId.value))
      if (filtersTipoPedidoId.value) query.set('tipo_pedido_id', String(filtersTipoPedidoId.value))
      if (filtersEstatus.value) query.set('estatus', filtersEstatus.value)
      if (filtersOrigen.value) query.set('origen', filtersOrigen.value)
      if (filtersFechaDesde.value) query.set('fecha_desde', filtersFechaDesde.value)
      if (filtersFechaHasta.value) query.set('fecha_hasta', filtersFechaHasta.value)

      const res: any = await $api(`/pedido-sugerencias?${query.toString()}`)

      dbg('fetchItems:raw', res)

      const rows = extractCollectionRows(res)
      const meta = extractCollectionMeta(res)

      dbg('fetchItems:rows', rows)
      dbg('fetchItems:meta', meta)

      let normalized = Array.isArray(rows) ? rows.map(normalizeSugerencia) : []

      const term = q.value.trim().toLowerCase()
      if (term) {
        normalized = normalized.filter(item =>
          String(item.id).includes(term)
          || (item.cliente?.nombre ?? '').toLowerCase().includes(term)
          || (item.tipo_pedido?.nombre ?? '').toLowerCase().includes(term)
          || (item.origen ?? '').toLowerCase().includes(term)
          || (item.modelo ?? '').toLowerCase().includes(term)
          || (item.estatus ?? '').toLowerCase().includes(term),
        )
      }

      items.value = normalized
      total.value = Number(meta.total ?? normalized.length)
      currentPage.value = Number(meta.current_page ?? page)

      dbg('fetchItems:end', {
        items: items.value.length,
        total: total.value,
        currentPage: currentPage.value,
      })
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id: number) => {
    loadingOne.value = true

    try {
      dbg('fetchById:start', id)

      const res: any = await $api(`/pedido-sugerencias/${id}`)
      dbg('fetchById:raw', res)

      const row = extractPayloadData(res)
      dbg('fetchById:row', row)

      if (!row)
        throw new Error('No se encontró la sugerencia.')

      const item = normalizeSugerencia(row)
      dbg('fetchById:item', item)

      await hydrateFormFromItem(item)

      dbg('fetchById:afterHydrate', {
        editingId: editingId.value,
        cliente: formClienteId.value,
        tipoPedido: formTipoPedidoId.value,
        fecha: formFechaObjetivo.value,
        detalles: formDetalles.value.length,
        productos: productos.value.length,
      })

      return item
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      loadingOne.value = false
    }
  }

  const addDetalle = () => {
    dbg('addDetalle')

    formDetalles.value.push({
      producto_id: 0,
      producto: null,
      cantidad_sugerida: 0,
      cantidad_ajustada: 0,
      cantidad_final: 0,
      observaciones: null,
      metadata: null,
    })

    dbg('addDetalle:end', formDetalles.value.length)
  }

  const removeDetalle = (index: number) => {
    dbg('removeDetalle', index)
    formDetalles.value.splice(index, 1)
    dbg('removeDetalle:end', formDetalles.value.length)
  }

  const onProductoChange = (index: number) => {
    const row = formDetalles.value[index]
    const option = productos.value.find(p => p.value === row.producto_id)

    row.producto = option
      ? {
          id: option.value,
          nombre: option.title,
          clave: option.raw?.clave ?? null,
        }
      : null

    dbg('onProductoChange', {
      index,
      producto_id: row.producto_id,
      producto: row.producto,
    })
  }

  const buildPayload = () => {
    const payload = {
      cliente_id: formClienteId.value,
      tipo_pedido_id: formTipoPedidoId.value,
      fecha_objetivo: formFechaObjetivo.value,
      origen: formOrigen.value,
      modelo: formModelo.value || null,
      observaciones: formObservaciones.value.trim() || null,
      detalles: formDetalles.value.map(d => ({
        producto_id: Number(d.producto_id ?? 0),
        cantidad_sugerida: Number(d.cantidad_sugerida ?? 0),
        cantidad_ajustada: Number(d.cantidad_ajustada ?? d.cantidad_sugerida ?? 0),
        cantidad_final: Number(d.cantidad_final ?? d.cantidad_ajustada ?? d.cantidad_sugerida ?? 0),
        observaciones: d.observaciones?.trim() || null,
        metadata: d.metadata ?? null,
      })),
    }

    dbg('buildPayload', payload)
    return payload
  }

  const save = async () => {
    saving.value = true

    try {
      const payload = buildPayload()
      const wasEdit = isEdit.value

      dbg('save:start', {
        wasEdit,
        editingId: editingId.value,
        payload,
      })

      let res: any

      if (wasEdit) {
        res = await $api(`/pedido-sugerencias/${editingId.value}`, {
          method: 'PUT',
          body: payload,
        })
      } else {
        res = await $api('/pedido-sugerencias', {
          method: 'POST',
          body: payload,
        })
      }

      dbg('save:response', res)

      const row = extractPayloadData(res)
      dbg('save:row', row)

      if (row?.id)
        await fetchById(Number(row.id))

      await success(
        'Listo',
        wasEdit
          ? 'Sugerencia actualizada correctamente.'
          : 'Sugerencia creada correctamente.',
      )

      return row
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      saving.value = false
    }
  }

  const generarForecast = async () => {
    generating.value = true

    try {
      const payload = {
        cliente_id: formClienteId.value,
        tipo_pedido_id: formTipoPedidoId.value,
        fecha_objetivo: formFechaObjetivo.value,
        dias_historico: formDiasHistorico.value,
        forzar_regeneracion: formForzarRegeneracion.value,
        observaciones: formObservaciones.value.trim() || null,
      }

      dbg('generarForecast:payload', payload)

      const res: any = await $api('/pedido-sugerencias/generar', {
        method: 'POST',
        body: payload,
      })

      dbg('generarForecast:response', res)

      const row = extractPayloadData(res)
      dbg('generarForecast:row', row)

      if (row?.id) {
        const hydrated = await fetchById(Number(row.id))
        formOrigen.value = hydrated?.origen ?? 'forecast'

        await success('Listo', 'Forecast generado correctamente.')
        return hydrated
      }

      await success('Listo', 'Forecast generado correctamente.')
      return row
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      generating.value = false
    }
  }

  const confirmItem = async (id?: number) => {
    const targetId = id ?? editingId.value
    if (!targetId) return

    dbg('confirmItem:start', targetId)

    const ok = await confirm({
      title: '¿Confirmar sugerencia?',
      text: 'La sugerencia pasará a estatus confirmado.',
      confirmText: 'Sí, confirmar',
      icon: 'question',
    })

    if (!ok) return

    try {
      const res: any = await $api(`/pedido-sugerencias/${targetId}/confirmar`, {
        method: 'PATCH',
      })

      dbg('confirmItem:response', res)

      const row = extractPayloadData(res)
      dbg('confirmItem:row', row)

      if (row?.id)
        await fetchById(Number(row.id))
      else
        formEstatus.value = 'confirmado'

      await success('Listo', 'Sugerencia confirmada correctamente.')
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const generarPedido = async (id?: number) => {
    const targetId = id ?? editingId.value
    if (!targetId) return null

    const ok = await confirm({
      title: '¿Generar pedido?',
      text: 'Se generará el pedido ERP a partir de esta sugerencia confirmada.',
      confirmText: 'Sí, generar',
      icon: 'question',
    })

    if (!ok) return null

    generatingPedido.value = true
    generatingPedidoId.value = targetId

    try {
      const res: any = await $api(`/pedido-sugerencias/${targetId}/generar-pedido`, {
        method: 'POST',
      })

      dbg('generarPedido:response', res)

      const payload = unwrapResponse(res)
      const pedido = payload?.data ?? payload ?? null

      if (!pedido?.id) {
        throw new Error('El backend no devolvió el ID del pedido generado.')
      }

      await fetchItems(currentPage.value)

      if (editingId.value === targetId) {
        await fetchById(targetId)
      }

      await success(
        'Listo',
        pedido?.folio
          ? `Pedido generado correctamente. Folio: ${pedido.folio}.`
          : 'Pedido generado correctamente.',
      )

      await router.push('/pedidos/pedido-sugerencias')

      return pedido
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      generatingPedido.value = false
      generatingPedidoId.value = null
    }
  }

  const cancelItem = async (id?: number) => {
    const targetId = id ?? editingId.value
    if (!targetId) return

    const ok = await confirm({
      title: '¿Cancelar sugerencia?',
      text: 'La sugerencia se marcará como cancelada.',
      confirmText: 'Sí, cancelar',
      icon: 'warning',
    })

    if (!ok) return

    try {
      const res: any = await $api(`/pedido-sugerencias/${targetId}/cancelar`, {
        method: 'PATCH',
      })

      const row = extractPayloadData(res)
      if (row?.id)
        await fetchById(Number(row.id))
      else
        formEstatus.value = 'cancelado'

      await success('Listo', 'Sugerencia cancelada correctamente.')
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const clearFilters = async () => {
    dbg('clearFilters')

    filtersClienteId.value = null
    filtersTipoPedidoId.value = null
    filtersEstatus.value = null
    filtersOrigen.value = null
    filtersFechaDesde.value = null
    filtersFechaHasta.value = null
    q.value = ''

    await fetchItems(1)
  }

  return {
    loading,
    saving,
    generating,
    generatingPedido,
    generatingPedidoId,
    loadingOne,

    items,
    total,
    currentPage,
    perPage,

    clientes,
    tiposPedido,
    productos,

    filtersClienteId,
    filtersTipoPedidoId,
    filtersEstatus,
    filtersOrigen,
    filtersFechaDesde,
    filtersFechaHasta,
    q,

    editingId,

    formClienteId,
    formTipoPedidoId,
    formFechaObjetivo,
    formOrigen,
    formModelo,
    formObservaciones,
    formDiasHistorico,
    formForzarRegeneracion,
    formEstatus,
    formDetalles,

    isEdit,
    isDraft,
    headers,
    estatusOptions,
    origenOptions,

    totalProductos,
    totalSugerido,
    totalAjustado,
    totalFinal,

    fetchItems,
    fetchById,
    fetchClientes,
    fetchTiposPedido,
    fetchProductosByTipoPedido,
    prepareWorkspace,

    resetForm,
    hydrateFormFromItem,

    addDetalle,
    removeDetalle,
    onProductoChange,

    save,
    generarForecast,
    confirmItem,
    generarPedido,
    cancelItem,
    clearFilters,
  }
})
