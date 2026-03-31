import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type RemisionRecepcionDetalleRow = {
  id: number
  remision_id: number
  pedido_det_erp_id: number | null
  articulo_id: number
  cantidad: number
  cantidad_recibida: number
  diferencia: number
  precio_unitario: number
  importe: number
  iva: number | null
  impuesto_iva: number | null
  total: number
  estatus: string
  observaciones: string | null
  observaciones_recepcion: string | null
  producto?: {
    id: number
    nombre: string
    clave?: string | null
  } | null
}

export type RemisionRecepcionRow = {
  id: number
  pedido_erp_id: number
  serie_id: number
  folio: number | string
  estatus: string
  fecha_remision: string | null
  fecha_objetivo: string | null
  confirmado_at: string | null
  fecha_recepcion: string | null
  recibido_por: number | null
  recibido_at: string | null
  sucursal_origen_id: number | null
  sucursal_destino_id: number
  subtotal: number
  impuestos: number
  total: number
  creado_por: string | null
  autorizado_por: number | null
  autorizado_at: string | null
  observaciones: string | null
  observaciones_recepcion: string | null
  detalles_count?: number
  pedido?: {
    id: number
    folio: number | string
    fecha_pedido?: string | null
    fecha_objetivo?: string | null
    estatus?: string | null
  } | null
  sucursal_origen?: {
    id: number
    nombre: string
  } | null
  sucursal_destino?: {
    id: number
    nombre: string
  } | null
  detalles?: RemisionRecepcionDetalleRow[]
}

type ApiListResponse = {
  success: boolean
  message?: string
  data?: any[]
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

type ApiOneResponse = {
  success: boolean
  message?: string
  data?: any
}

const today = () => new Date().toISOString().slice(0, 10)

const normalizeNumber = (value: unknown): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const normalizeDetalle = (row: any): RemisionRecepcionDetalleRow => {
  const cantidad = normalizeNumber(row?.cantidad)
  const cantidadRecibida = normalizeNumber(row?.cantidad_recibida)
  const diferencia = normalizeNumber(row?.diferencia ?? (cantidad - cantidadRecibida))

  return {
    id: Number(row?.id ?? 0),
    remision_id: Number(row?.remision_id ?? 0),
    pedido_det_erp_id: row?.pedido_det_erp_id ?? null,
    articulo_id: Number(row?.articulo_id ?? 0),
    cantidad,
    cantidad_recibida: cantidadRecibida,
    diferencia,
    precio_unitario: normalizeNumber(row?.precio_unitario),
    importe: normalizeNumber(row?.importe),
    iva: row?.iva != null ? normalizeNumber(row?.iva) : null,
    impuesto_iva: row?.impuesto_iva != null ? normalizeNumber(row?.impuesto_iva) : null,
    total: normalizeNumber(row?.total),
    estatus: row?.estatus ?? 'GENERADA',
    observaciones: row?.observaciones ?? null,
    observaciones_recepcion: row?.observaciones_recepcion ?? null,
    producto: row?.producto
      ? {
          id: Number(row.producto.id ?? 0),
          nombre: row.producto.nombre ?? 'Producto',
          clave: row.producto.clave ?? null,
        }
      : null,
  }
}

const normalizeRemision = (row: any): RemisionRecepcionRow => {
  return {
    id: Number(row?.id ?? 0),
    pedido_erp_id: Number(row?.pedido_erp_id ?? 0),
    serie_id: Number(row?.serie_id ?? 0),
    folio: row?.folio ?? '',
    estatus: row?.estatus ?? '',
    fecha_remision: row?.fecha_remision ?? null,
    fecha_objetivo: row?.fecha_objetivo ?? null,
    confirmado_at: row?.confirmado_at ?? null,
    fecha_recepcion: row?.fecha_recepcion ?? null,
    recibido_por: row?.recibido_por ?? null,
    recibido_at: row?.recibido_at ?? null,
    sucursal_origen_id: row?.sucursal_origen_id ?? null,
    sucursal_destino_id: Number(row?.sucursal_destino_id ?? 0),
    subtotal: normalizeNumber(row?.subtotal),
    impuestos: normalizeNumber(row?.impuestos),
    total: normalizeNumber(row?.total),
    creado_por: row?.creado_por ?? null,
    autorizado_por: row?.autorizado_por ?? null,
    autorizado_at: row?.autorizado_at ?? null,
    observaciones: row?.observaciones ?? null,
    observaciones_recepcion: row?.observaciones_recepcion ?? null,
    detalles_count: normalizeNumber(row?.detalles_count),
    pedido: row?.pedido
      ? {
          id: Number(row.pedido.id ?? 0),
          folio: row.pedido.folio ?? '',
          fecha_pedido: row.pedido.fecha_pedido ?? null,
          fecha_objetivo: row.pedido.fecha_objetivo ?? null,
          estatus: row.pedido.estatus ?? null,
        }
      : null,
    sucursal_origen: row?.sucursal_origen
      ? {
          id: Number(row.sucursal_origen.id ?? 0),
          nombre: row.sucursal_origen.nombre ?? '',
        }
      : null,
    sucursal_destino: row?.sucursal_destino
      ? {
          id: Number(row.sucursal_destino.id ?? 0),
          nombre: row.sucursal_destino.nombre ?? '',
        }
      : null,
    detalles: Array.isArray(row?.detalles) ? row.detalles.map(normalizeDetalle) : [],
  }
}

export const useRemisionesRecepcionStore = defineStore('remisiones-recepcion', () => {
  const loading = ref(false)
  const loadingOne = ref(false)
  const saving = ref(false)

  const items = ref<RemisionRecepcionRow[]>([])
  const current = ref<RemisionRecepcionRow | null>(null)

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
    solo_pendientes: true,
  })

  const form = ref({
    id: null as number | null,
    fecha_recepcion: today(),
    observaciones_recepcion: '',
    detalles: [] as RemisionRecepcionDetalleRow[],
  })

  const estatusOptions = [
    { title: 'Todos', value: '' },
    { title: 'Generada', value: 'GENERADA' },
    { title: 'Enviada', value: 'ENVIADA' },
    { title: 'Recibida parcial', value: 'RECIBIDA_PARCIAL' },
    { title: 'Recibida completa', value: 'RECIBIDA_COMPLETA' },
    { title: 'Cancelada', value: 'CANCELADA' },
  ]

  const canSubmit = computed(() => {
    return !!form.value.id && form.value.detalles.length > 0
  })

  const resumen = computed(() => {
    const detalles = form.value.detalles || []

    const completos = detalles.filter(d => d.cantidad_recibida === d.cantidad).length
    const parciales = detalles.filter(d => d.cantidad_recibida > 0 && d.cantidad_recibida < d.cantidad).length
    const noRecibidos = detalles.filter(d => d.cantidad_recibida <= 0).length

    return {
      total: detalles.length,
      completos,
      parciales,
      noRecibidos,
    }
  })

  const setDetalleCantidad = (detalleId: number, value: number | string) => {
    const detalle = form.value.detalles.find(d => d.id === detalleId)
    if (!detalle) return

    let cantidad = normalizeNumber(value)

    if (cantidad < 0) cantidad = 0
    if (cantidad > detalle.cantidad) cantidad = detalle.cantidad

    detalle.cantidad_recibida = cantidad
    detalle.diferencia = Number((detalle.cantidad - cantidad).toFixed(4))

    if (cantidad <= 0) detalle.estatus = 'NO_RECIBIDO'
    else if (cantidad < detalle.cantidad) detalle.estatus = 'RECIBIDO_PARCIAL'
    else detalle.estatus = 'RECIBIDO'
  }

  const marcarTodoRecibido = () => {
    form.value.detalles.forEach(detalle => {
      detalle.cantidad_recibida = detalle.cantidad
      detalle.diferencia = 0
      detalle.estatus = 'RECIBIDO'
    })
  }

  const resetList = () => {
    items.value = []
    total.value = 0
    lastPage.value = 1
    page.value = 1
  }

  const resetCurrent = () => {
    current.value = null
    form.value = {
      id: null,
      fecha_recepcion: today(),
      observaciones_recepcion: '',
      detalles: [],
    }
  }

  const fetchListado = async (customPage?: number) => {
    loading.value = true

    try {
      if (customPage) page.value = customPage

      const payload = {
        ...filters.value,
        page: page.value,
        per_page: perPage.value,
      }

      const res = await $api('/remisiones-erp/recepcion/listado', {
        method: 'POST',
        body: payload,
      }) as ApiListResponse

      const rows = Array.isArray(res?.data) ? res.data : []

      items.value = rows.map(normalizeRemision)
      total.value = Number(res?.meta?.total ?? 0)
      lastPage.value = Number(res?.meta?.last_page ?? 1)
      perPage.value = Number(res?.meta?.per_page ?? perPage.value)
      page.value = Number(res?.meta?.current_page ?? page.value)
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (id: number | string) => {
    loadingOne.value = true

    try {
      const res = await $api('/remisiones-erp/recepcion/detalle', {
        method: 'POST',
        body: {
          id: Number(id),
        },
      }) as ApiOneResponse

      const row = normalizeRemision(res?.data ?? {})
      current.value = row

      form.value = {
        id: row.id,
        fecha_recepcion: row.fecha_recepcion || today(),
        observaciones_recepcion: row.observaciones_recepcion || '',
        detalles: (row.detalles || []).map(det => ({
          ...det,
          cantidad_recibida: Number(det.cantidad_recibida ?? 0),
          diferencia: Number(det.diferencia ?? det.cantidad),
        })),
      }

      return row
    } finally {
      loadingOne.value = false
    }
  }

  const recibir = async () => {
    if (!form.value.id) throw new Error('No hay remisión seleccionada.')

    saving.value = true

    try {
      const payload = {
        id: form.value.id,
        fecha_recepcion: form.value.fecha_recepcion,
        observaciones_recepcion: form.value.observaciones_recepcion || null,
        detalles: form.value.detalles.map(det => ({
          id: det.id,
          cantidad_recibida: det.cantidad_recibida,
          observaciones_recepcion: det.observaciones_recepcion || null,
        })),
      }

      const res = await $api('/remisiones-erp/recepcion/recibir', {
        method: 'POST',
        body: payload,
      }) as ApiOneResponse

      const row = normalizeRemision(res?.data ?? {})
      current.value = row

      form.value = {
        id: row.id,
        fecha_recepcion: row.fecha_recepcion || today(),
        observaciones_recepcion: row.observaciones_recepcion || '',
        detalles: (row.detalles || []).map(normalizeDetalle),
      }

      return row
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    loadingOne,
    saving,

    items,
    current,

    page,
    perPage,
    total,
    lastPage,

    filters,
    form,

    estatusOptions,
    canSubmit,
    resumen,

    setDetalleCantidad,
    marcarTodoRecibido,
    resetList,
    resetCurrent,
    fetchListado,
    fetchOne,
    recibir,
  }
})
