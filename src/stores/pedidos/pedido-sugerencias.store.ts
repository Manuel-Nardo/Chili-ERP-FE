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

type SelectOption<T = string | number> = {
  title: string
  value: T
  raw?: any
}

export const usePedidoSugerenciasStore = defineStore('pedido-sugerencias', () => {
  const { success, error, confirm } = useSwal()
  const router = useRouter()
  const dbg = (...args: any[]) => console.log('[pedido-sugerencias.store]', ...args)

  // =========================
  // State UI / Loading
  // =========================
  const loading = ref(false)
  const loadingOne = ref(false)
  const loadingCatalogs = ref(false)
  const loadingProductos = ref(false)
  const saving = ref(false)
  const generating = ref(false)
  const generatingPedido = ref(false)
  const generatingPedidoId = ref<number | null>(null)
  const hydratingAllProductos = ref(false)

  const actionLoadingText = ref('')

  // =========================
  // Listado
  // =========================
  const items = ref<PedidoSugerenciaRow[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(15)

  // =========================
  // Catálogos
  // =========================
  const clientes = ref<SelectOption<number>[]>([])
  const tiposPedido = ref<SelectOption<number>[]>([])
  const productos = ref<SelectOption<number>[]>([])

  // =========================
  // Filtros
  // =========================
  const filtersClienteId = ref<number | null>(null)
  const filtersTipoPedidoId = ref<number | null>(null)
  const filtersEstatus = ref<string | null>(null)
  const filtersOrigen = ref<string | null>(null)
  const filtersFechaDesde = ref<string | null>(null)
  const filtersFechaHasta = ref<string | null>(null)
  const q = ref('')

  // =========================
  // Form
  // =========================
  const editingId = ref<number | null>(null)

  const formClienteId = ref<number | null>(null)
  const formTipoPedidoId = ref<number | null>(null)
  const formFechaObjetivo = ref<string | null>(null)

  // Nueva lógica de UX:
  // visualmente sólo Manual / Sugerido
  const formOrigen = ref<'manual' | 'sugerido'>('manual')

  // manual => null / sugerido => forecast_v1 normalmente
  const formModelo = ref<string | null>(null)
  const formObservaciones = ref<string>('')

  const formDiasHistorico = ref<number>(84)
  const formForzarRegeneracion = ref(false)
  const formEstatus = ref<string>('borrador')

  const formDetalles = ref<PedidoSugerenciaDetalleRow[]>([])

  // =========================
  // Computed
  // =========================
  const isEdit = computed(() => editingId.value !== null)
  const isDraft = computed(() => formEstatus.value === 'borrador')
  const isManual = computed(() => formOrigen.value === 'manual')
  const isSugerido = computed(() => formOrigen.value === 'sugerido')

  const totalProductos = computed(() => formDetalles.value.length)
  const totalSugerido = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_sugerida || 0), 0))
  const totalAjustado = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_ajustada || 0), 0))
  const totalFinal = computed(() => formDetalles.value.reduce((acc, row) => acc + Number(row.cantidad_final || 0), 0))

  const canHydrateManualProducts = computed(() => {
    return !!formTipoPedidoId.value && isDraft.value && isManual.value
  })

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

  const origenOptions: SelectOption<string>[] = [
    { title: 'Manual', value: 'manual' },
    { title: 'Sugerido', value: 'sugerido' },
  ]

  // =========================
  // Helpers
  // =========================
  const startAction = (text: string) => {
    actionLoadingText.value = text
    dbg('action:start', text)
  }

  const endAction = () => {
    dbg('action:end', actionLoadingText.value)
    actionLoadingText.value = ''
  }

  const handleApiError = (e: any) => {
    const data = e?.data ?? e?.response?.data ?? {}
    const message = data?.message || e?.message || 'Ocurrió un error inesperado.'
    dbg('handleApiError', { error: e, data })
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

    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    if (Array.isArray(payload?.results)) return payload.results
    if (Array.isArray(payload?.data?.results)) return payload.data.results

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
    return row?.detalles ?? row?.detalle ?? row?.details ?? []
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

  const normalizeOrigen = (value: any): 'manual' | 'sugerido' => {
    if (value === 'forecast') return 'sugerido'
    if (value === 'sugerido') return 'sugerido'
    return 'manual'
  }

  const normalizeModelo = (origen: string, modelo: any): string | null => {
    if (origen === 'manual') return null
    return modelo ?? 'forecast_v1'
  }

  const normalizeSugerencia = (row: any): PedidoSugerenciaRow => {
    const origenNormalizado = normalizeOrigen(row?.origen)

    return {
      id: Number(row?.id),
      cliente_id: Number(row?.cliente_id),
      tipo_pedido_id: Number(row?.tipo_pedido_id),
      fecha_objetivo: row?.fecha_objetivo,
      estatus: row?.estatus ?? 'borrador',
      origen: origenNormalizado,
      modelo: normalizeModelo(origenNormalizado, row?.modelo),
      observaciones: row?.observaciones ?? null,
      pedido_erp_id: row?.pedido_erp_id ? Number(row.pedido_erp_id) : null,
      pedido_generado_at: row?.pedido_generado_at ?? null,
      cliente: row?.cliente ?? null,
      tipo_pedido: row?.tipo_pedido ?? row?.tipoPedido ?? null,
      detalles: extractDetalles(row).map(normalizeDetalle),
      created_at: row?.created_at,
      updated_at: row?.updated_at,
    }
  }

  const syncFormOriginBehavior = () => {
    if (formOrigen.value === 'manual') {
      formModelo.value = null
      formForzarRegeneracion.value = false
    } else {
      formModelo.value = formModelo.value || 'forecast_v1'
    }
  }

  const mapProductoOptionToDetalle = (option: SelectOption<number>): PedidoSugerenciaDetalleRow => ({
    producto_id: Number(option.value),
    producto: {
      id: Number(option.value),
      nombre: option.title,
      clave: option.raw?.clave ?? null,
    },
    cantidad_sugerida: 0,
    cantidad_ajustada: 0,
    cantidad_final: 0,
    observaciones: null,
    metadata: null,
  })

  const dedupeDetalles = (rows: PedidoSugerenciaDetalleRow[]) => {
    const seen = new Set<number>()
    return rows.filter(row => {
      const productoId = Number(row.producto_id ?? 0)
      if (!productoId) return false
      if (seen.has(productoId)) return false
      seen.add(productoId)
      return true
    })
  }

  // =========================
  // Fetch catálogos
  // =========================
  const fetchClientes = async () => {
    try {
      const res: any = await $api('/catalogos/clientes')
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      clientes.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))
    } catch (e) {
      clientes.value = []
      dbg('fetchClientes:error', e)
    }
  }

  const fetchTiposPedido = async () => {
    try {
      const res: any = await $api('/catalogos/tipos-pedido')
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      tiposPedido.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))
    } catch (e) {
      tiposPedido.value = []
      dbg('fetchTiposPedido:error', e)
    }
  }

  const fetchProductosByTipoPedido = async (tipoPedidoId: number | null) => {
    if (!tipoPedidoId) {
      productos.value = []
      return
    }

    loadingProductos.value = true

    try {
      const res: any = await $api(`/catalogos/productos?tipo_pedido_id=${tipoPedidoId}`)
      const payload = unwrapResponse(res)
      const data = payload?.data ?? payload ?? []

      productos.value = (Array.isArray(data) ? data : []).map((item: any) => ({
        title: item.nombre,
        value: Number(item.id),
        raw: item,
      }))
    } catch (e) {
      productos.value = []
      dbg('fetchProductosByTipoPedido:error', e)
    } finally {
      loadingProductos.value = false
    }
  }

  const prepareWorkspace = async () => {
    loadingCatalogs.value = true
    startAction('Preparando catálogo y configuración...')

    try {
      await Promise.all([
        fetchClientes(),
        fetchTiposPedido(),
      ])
    } finally {
      loadingCatalogs.value = false
      endAction()
    }
  }

  // =========================
  // Listado
  // =========================
  const fetchItems = async (page = 1) => {
    loading.value = true
    currentPage.value = page
    startAction('Cargando prepedidos...')

    try {
      const query = new URLSearchParams()

      query.set('page', String(page))
      query.set('per_page', String(perPage.value))

      if (filtersClienteId.value) query.set('cliente_id', String(filtersClienteId.value))
      if (filtersTipoPedidoId.value) query.set('tipo_pedido_id', String(filtersTipoPedidoId.value))
      if (filtersEstatus.value) query.set('estatus', filtersEstatus.value)

      // backend antiguo puede seguir manejando forecast/manual
      if (filtersOrigen.value === 'manual') query.set('origen', 'manual')
      if (filtersOrigen.value === 'sugerido') query.set('origen', 'forecast')

      if (filtersFechaDesde.value) query.set('fecha_desde', filtersFechaDesde.value)
      if (filtersFechaHasta.value) query.set('fecha_hasta', filtersFechaHasta.value)

      const res: any = await $api(`/pedido-sugerencias?${query.toString()}`)

      const rows = extractCollectionRows(res)
      const meta = extractCollectionMeta(res)

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
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
      endAction()
    }
  }

  const fetchById = async (id: number) => {
    loadingOne.value = true
    startAction('Cargando prepedido...')

    try {
      const res: any = await $api(`/pedido-sugerencias/${id}`)
      const row = extractPayloadData(res)

      if (!row) throw new Error('No se encontró el prepedido.')

      const item = normalizeSugerencia(row)
      await hydrateFormFromItem(item)

      return item
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      loadingOne.value = false
      endAction()
    }
  }

  // =========================
  // Form helpers
  // =========================
  const resetForm = () => {
    editingId.value = null

    formClienteId.value = null
    formTipoPedidoId.value = null
    formFechaObjetivo.value = null
    formOrigen.value = 'manual'
    formModelo.value = null
    formObservaciones.value = ''
    formDiasHistorico.value = 84
    formForzarRegeneracion.value = false
    formEstatus.value = 'borrador'
    formDetalles.value = []
    productos.value = []
  }

  const hydrateFormFromItem = async (item: PedidoSugerenciaRow) => {
    editingId.value = item.id
    formClienteId.value = item.cliente_id
    formTipoPedidoId.value = item.tipo_pedido_id
    formFechaObjetivo.value = item.fecha_objetivo
    formOrigen.value = normalizeOrigen(item.origen)
    formModelo.value = normalizeModelo(formOrigen.value, item.modelo)
    formObservaciones.value = item.observaciones ?? ''
    formEstatus.value = item.estatus ?? 'borrador'

    syncFormOriginBehavior()
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
  }

  const addDetalle = () => {
    formDetalles.value.push({
      producto_id: 0,
      producto: null,
      cantidad_sugerida: 0,
      cantidad_ajustada: 0,
      cantidad_final: 0,
      observaciones: null,
      metadata: null,
    })
  }

  const removeDetalle = (index: number) => {
    formDetalles.value.splice(index, 1)
  }

  const onProductoChange = (index: number) => {
    const row = formDetalles.value[index]
    const option = productos.value.find(p => p.value === row.producto_id)

    row.producto = option
      ? {
          id: Number(option.value),
          nombre: option.title,
          clave: option.raw?.clave ?? null,
        }
      : null

    if (!row.cantidad_sugerida) row.cantidad_sugerida = 0
    if (!row.cantidad_ajustada) row.cantidad_ajustada = row.cantidad_sugerida ?? 0
    if (!row.cantidad_final) row.cantidad_final = row.cantidad_ajustada ?? row.cantidad_sugerida ?? 0
  }

const hydrateManualProductos = async () => {
  if (!canHydrateManualProducts.value) return

  hydratingAllProductos.value = true
  startAction('Cargando productos configurados para el prepedido...')

  try {
    if (!productos.value.length && formTipoPedidoId.value) {
      await fetchProductosByTipoPedido(formTipoPedidoId.value)
    }

    const nuevos = productos.value.map(mapProductoOptionToDetalle)
    formDetalles.value = dedupeDetalles([...(formDetalles.value ?? []), ...nuevos])

    endAction()
    hydratingAllProductos.value = false

    await success('Listo', 'Se agregaron los productos configurados del tipo de pedido.')
  } catch (e: any) {
    hydratingAllProductos.value = false
    endAction()
    handleApiError(e)
    throw e
  }
}

  // =========================
  // Payload / Save
  // =========================
  const buildPayload = () => {
    syncFormOriginBehavior()

    const origenBackend = formOrigen.value === 'sugerido' ? 'forecast' : 'manual'

    return {
      cliente_id: formClienteId.value,
      tipo_pedido_id: formTipoPedidoId.value,
      fecha_objetivo: formFechaObjetivo.value,
      origen: origenBackend,
      modelo: formOrigen.value === 'sugerido' ? (formModelo.value || 'forecast_v1') : null,
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
  }

const save = async () => {
  saving.value = true
  startAction(isEdit.value ? 'Guardando prepedido...' : 'Creando prepedido...')

  try {
    const payload = buildPayload()
    const wasEdit = isEdit.value

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

    const row = extractPayloadData(res)

    if (row?.id) {
      await fetchById(Number(row.id))
    }

    saving.value = false
    endAction()

    await success(
      'Listo',
      wasEdit ? 'Prepedido actualizado correctamente.' : 'Prepedido creado correctamente.',
    )

    return row
  } catch (e: any) {
    saving.value = false
    endAction()
    handleApiError(e)
    throw e
  }
}

const generarForecast = async () => {
  generating.value = true
  startAction('Generando prepedido sugerido...')

  try {
    const payload = {
      cliente_id: formClienteId.value,
      tipo_pedido_id: formTipoPedidoId.value,
      fecha_objetivo: formFechaObjetivo.value,
      dias_historico: formDiasHistorico.value,
      forzar_regeneracion: formForzarRegeneracion.value,
      observaciones: formObservaciones.value.trim() || null,
    }

    const res: any = await $api('/pedido-sugerencias/generar', {
      method: 'POST',
      body: payload,
    })

    const row = extractPayloadData(res)

    let result = row

    if (row?.id) {
      result = await fetchById(Number(row.id))
      formOrigen.value = 'sugerido'
      formModelo.value = result?.modelo ?? 'forecast_v1'
    } else {
      formOrigen.value = 'sugerido'
      formModelo.value = 'forecast_v1'
    }

    generating.value = false
    endAction()

    await success('Listo', 'Prepedido sugerido generado correctamente.')

    return result
  } catch (e: any) {
    generating.value = false
    endAction()
    handleApiError(e)
    throw e
  }
}

const confirmItem = async (id?: number) => {
  const targetId = id ?? editingId.value
  if (!targetId) return

  const ok = await confirm({
    title: '¿Confirmar prepedido?',
    text: 'El prepedido pasará a estatus confirmado.',
    confirmText: 'Sí, confirmar',
    icon: 'question',
  })

  if (!ok) return

  startAction('Confirmando prepedido...')

  try {
    const res: any = await $api(`/pedido-sugerencias/${targetId}/confirmar`, {
      method: 'PATCH',
    })

    const row = extractPayloadData(res)

    if (row?.id) await fetchById(Number(row.id))
    else formEstatus.value = 'confirmado'

    endAction()

    await success('Listo', 'Prepedido confirmado correctamente.')
  } catch (e: any) {
    endAction()
    handleApiError(e)
    throw e
  }
}

const generarPedido = async (id?: number) => {
  const targetId = id ?? editingId.value
  if (!targetId) return null

  const ok = await confirm({
    title: '¿Generar pedido?',
    text: 'Se generará el pedido ERP a partir de este prepedido confirmado.',
    confirmText: 'Sí, generar',
    icon: 'question',
  })

  if (!ok) return null

  generatingPedido.value = true
  generatingPedidoId.value = targetId
  startAction('Generando pedido ERP...')

  try {
    const res: any = await $api(`/pedido-sugerencias/${targetId}/generar-pedido`, {
      method: 'POST',
    })

    const payload = unwrapResponse(res)
    const pedido = payload?.data ?? payload ?? null

    if (!pedido?.id) {
      throw new Error('El backend no devolvió el ID del pedido generado.')
    }

    await fetchItems(currentPage.value)

    if (editingId.value === targetId) {
      await fetchById(targetId)
    }

    generatingPedido.value = false
    generatingPedidoId.value = null
    endAction()

    await success(
      'Listo',
      pedido?.folio
        ? `Pedido generado correctamente. Folio: ${pedido.folio}.`
        : 'Pedido generado correctamente.',
    )

    await router.push('/pedidos/pedido-sugerencias')

    return pedido
  } catch (e: any) {
    generatingPedido.value = false
    generatingPedidoId.value = null
    endAction()
    handleApiError(e)
    throw e
  }
}

  const cancelItem = async (id?: number) => {
    const targetId = id ?? editingId.value
    if (!targetId) return

    const ok = await confirm({
      title: '¿Cancelar prepedido?',
      text: 'El prepedido se marcará como cancelado.',
      confirmText: 'Sí, cancelar',
      icon: 'warning',
    })

    if (!ok) return

    startAction('Cancelando prepedido...')

    try {
      const res: any = await $api(`/pedido-sugerencias/${targetId}/cancelar`, {
        method: 'PATCH',
      })

      const row = extractPayloadData(res)

      if (row?.id) await fetchById(Number(row.id))
      else formEstatus.value = 'cancelado'

      await success('Listo', 'Prepedido cancelado correctamente.')
    } catch (e: any) {
      handleApiError(e)
      throw e
    } finally {
      endAction()
    }
  }

  const clearFilters = async () => {
    filtersClienteId.value = null
    filtersTipoPedidoId.value = null
    filtersEstatus.value = null
    filtersOrigen.value = null
    filtersFechaDesde.value = null
    filtersFechaHasta.value = null
    q.value = ''

    await fetchItems(1)
  }

  const openNewWorkspace = async () => {
    resetForm()
    await prepareWorkspace()
    await router.push('/pedidos/pedido-sugerencias/nuevo')
  }

  const openEditWorkspace = async (id: number) => {
    if (!id) return

    resetForm()
    await prepareWorkspace()
    await router.push(`/pedidos/pedido-sugerencias/${id}`)
  }

  const loadingBaseProductos = computed(() => hydratingAllProductos.value)
  const actionLoading = computed(() => {
    return loading.value
      || loadingOne.value
      || loadingCatalogs.value
      || loadingProductos.value
      || saving.value
      || generating.value
      || generatingPedido.value
      || hydratingAllProductos.value
  })

  return {
    loadingBaseProductos,
    actionLoading,
    openNewWorkspace,
    openEditWorkspace,
    // loading
    loading,
    loadingOne,
    loadingCatalogs,
    loadingProductos,
    saving,
    generating,
    generatingPedido,
    generatingPedidoId,
    hydratingAllProductos,
    actionLoadingText,

    // listado
    items,
    total,
    currentPage,
    perPage,

    // catálogos
    clientes,
    tiposPedido,
    productos,

    // filtros
    filtersClienteId,
    filtersTipoPedidoId,
    filtersEstatus,
    filtersOrigen,
    filtersFechaDesde,
    filtersFechaHasta,
    q,

    // form
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

    // computed
    isEdit,
    isDraft,
    isManual,
    isSugerido,
    canHydrateManualProducts,
    totalProductos,
    totalSugerido,
    totalAjustado,
    totalFinal,

    // options / config
    headers,
    estatusOptions,
    origenOptions,

    // methods
    fetchItems,
    fetchById,
    fetchClientes,
    fetchTiposPedido,
    fetchProductosByTipoPedido,
    prepareWorkspace,

    resetForm,
    hydrateFormFromItem,
    syncFormOriginBehavior,

    addDetalle,
    removeDetalle,
    onProductoChange,
    hydrateManualProductos,

    save,
    generarForecast,
    confirmItem,
    generarPedido,
    cancelItem,
    clearFilters,
  }
})
