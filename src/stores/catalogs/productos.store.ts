import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TIPOS_PEDIDO_ENDPOINT = '/catalogos/tipos-pedido' 

type BasicOption = {
  title: string
  value: number
}

type ProductoRelation = {
  id: number
  nombre?: string
  abreviatura?: string
}

export type ProductoRow = {
  id: number
  clave: number | string
  clave_sat?: string | null
  nombre: string
  descripcion?: string | null
  activo: boolean
  facturable: boolean
  ruta?: 'FRIA' | 'CALIENTE' | 'PAN' | null
  precio_actual?: number | string | null
  costo_actual?: number | string | null
  linea?: ProductoRelation | null
  tipoPedido?: ProductoRelation | null
  tipo_pedido?: ProductoRelation | null
  medida?: ProductoRelation | null
  medidaCompra?: ProductoRelation | null
  medida_compra?: ProductoRelation | null
  impuestos?: Array<{
    id: number
    nombre: string
    codigo?: string
    tipo?: string
    porcentaje?: number | string
  }>
  linea_id?: number
  tipo_pedido_id?: number
  medida_id?: number
  medida_compra_id?: number
}

export const useProductosStore = defineStore('productos', () => {
  const { success, error } = useSwal()

  const productos = ref<ProductoRow[]>([])
  const loading = ref(false)

  const lineaOptions = ref<BasicOption[]>([])
  const unidadOptions = ref<BasicOption[]>([])
  const impuestoOptions = ref<BasicOption[]>([])
  const tipoPedidoOptions = ref<BasicOption[]>([])

  const rutaOptions = [
    { title: 'Fría', value: 'FRIA' },
    { title: 'Caliente', value: 'CALIENTE' },
    { title: 'Pan', value: 'PAN' },
  ]

  const fetchProductos = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/productos')
      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

      if (Array.isArray(res?.data?.data?.data)) productos.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) productos.value = res.data.data
      else if (Array.isArray(res?.data)) productos.value = res.data
      else productos.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const fetchLineas = async () => {
    try {
      const res: any = await $api('/catalogos/lineas')
      const items = extractArray(res)
      lineaOptions.value = items.map((item: any) => ({
        title: item.nombre,
        value: item.id,
      }))
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const fetchUnidades = async () => {
    try {
      const res: any = await $api('/catalogos/unidades')
      const items = extractArray(res)
      unidadOptions.value = items.map((item: any) => ({
        title: `${item.nombre}${item.abreviatura ? ` (${item.abreviatura})` : ''}`,
        value: item.id,
      }))
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const fetchImpuestos = async () => {
    try {
      const res: any = await $api('/catalogos/impuestos')
      const items = extractArray(res)
      impuestoOptions.value = items.map((item: any) => ({
        title: `${item.nombre} (${Number(item.porcentaje ?? 0).toFixed(2)}%)`,
        value: item.id,
      }))
    } catch (e: any) {
      handleApiError(e)
    }
  }

  const fetchTiposPedido = async () => {
    try {
      const res: any = await $api(TIPOS_PEDIDO_ENDPOINT)
      const items = extractArray(res)
      tipoPedidoOptions.value = items
        .filter((item: any) => item.activo === undefined || item.activo === true || item.activo === 1)
        .map((item: any) => ({
          title: item.nombre,
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
        fetchProductos(),
        fetchLineas(),
        fetchUnidades(),
        fetchImpuestos(),
        fetchTiposPedido(),
      ])
    } finally {
      loading.value = false
    }
  }

  const createProducto = async (payload: Record<string, any>) => {
    try {
      const res: any = await $api('/catalogos/productos', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Producto creado correctamente.')
      await fetchProductos()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateProducto = async (id: number, payload: Record<string, any>) => {
    try {
      const res: any = await $api(`/catalogos/productos/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Producto actualizado correctamente.')
      await fetchProductos()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteProducto = async (id: number) => {
    try {
      await $api(`/catalogos/productos/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Producto eliminado correctamente.')
      await fetchProductos()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const extractArray = (res: any) => {
    const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data)) return res.data
    return Array.isArray(data) ? data : []
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const msg =
      data?.message
      ?? data?.errors?.clave?.[0]
      ?? data?.errors?.clave_sat?.[0]
      ?? data?.errors?.nombre?.[0]
      ?? data?.errors?.descripcion?.[0]
      ?? data?.errors?.linea_id?.[0]
      ?? data?.errors?.tipo_pedido_id?.[0]
      ?? data?.errors?.medida_id?.[0]
      ?? data?.errors?.medida_compra_id?.[0]
      ?? data?.errors?.ruta?.[0]
      ?? data?.errors?.precio_actual?.[0]
      ?? data?.errors?.costo_actual?.[0]
      ?? data?.errors?.impuestos?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formClave = ref<number | string | ''>('')
  const formClaveSat = ref('')
  const formNombre = ref('')
  const formDescripcion = ref('')
  const formActivo = ref(true)
  const formFacturable = ref(false)

  const formLineaId = ref<number | null>(null)
  const formTipoPedidoId = ref<number | null>(null)
  const formMedidaId = ref<number | null>(null)
  const formMedidaCompraId = ref<number | null>(null)

  const formRuta = ref<'FRIA' | 'CALIENTE' | 'PAN' | null>(null)

  const formPrecioActual = ref<number | string | ''>('')
  const formCostoActual = ref<number | string | ''>('')

  const formImpuestos = ref<number[]>([])

  const formMotivoPrecio = ref('')
  const formMotivoCosto = ref('')
  const formFechaInicioPrecio = ref<string | null>(null)
  const formFechaInicioCosto = ref<string | null>(null)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formClave.value = ''
    formClaveSat.value = ''
    formNombre.value = ''
    formDescripcion.value = ''
    formActivo.value = true
    formFacturable.value = false
    formLineaId.value = null
    formTipoPedidoId.value = null
    formMedidaId.value = null
    formMedidaCompraId.value = null
    formRuta.value = null
    formPrecioActual.value = ''
    formCostoActual.value = ''
    formImpuestos.value = []
    formMotivoPrecio.value = ''
    formMotivoCosto.value = ''
    formFechaInicioPrecio.value = null
    formFechaInicioCosto.value = null
  }

  const openCreate = async () => {
    resetForm()

    if (!lineaOptions.value.length || !unidadOptions.value.length || !impuestoOptions.value.length || !tipoPedidoOptions.value.length)
      await Promise.all([fetchLineas(), fetchUnidades(), fetchImpuestos(), fetchTiposPedido()])

    drawerOpen.value = true
  }

  const openEdit = async (p: ProductoRow) => {
    if (!lineaOptions.value.length || !unidadOptions.value.length || !impuestoOptions.value.length || !tipoPedidoOptions.value.length)
      await Promise.all([fetchLineas(), fetchUnidades(), fetchImpuestos(), fetchTiposPedido()])

    editingId.value = p.id
    formClave.value = p.clave ?? ''
    formClaveSat.value = p.clave_sat ?? ''
    formNombre.value = p.nombre ?? ''
    formDescripcion.value = p.descripcion ?? ''
    formActivo.value = !!p.activo
    formFacturable.value = !!p.facturable
    formLineaId.value = p.linea_id ?? p.linea?.id ?? null
    formTipoPedidoId.value = p.tipo_pedido_id ?? p.tipoPedido?.id ?? p.tipo_pedido?.id ?? null
    formMedidaId.value = p.medida_id ?? p.medida?.id ?? null
    formMedidaCompraId.value = p.medida_compra_id ?? p.medidaCompra?.id ?? p.medida_compra?.id ?? null
    formRuta.value = p.ruta ?? null
    formPrecioActual.value = p.precio_actual ?? ''
    formCostoActual.value = p.costo_actual ?? ''
    formImpuestos.value = Array.isArray(p.impuestos) ? p.impuestos.map(i => i.id) : []
    formMotivoPrecio.value = ''
    formMotivoCosto.value = ''
    formFechaInicioPrecio.value = null
    formFechaInicioCosto.value = null

    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const normalizeDate = (value: string | null) => {
    if (!value) return null
    if (value.length >= 10) return value.slice(0, 10)
    return value
  }

  const saveFromDrawer = async () => {
    if (
      String(formClave.value ?? '').trim() === ''
      || !formNombre.value.trim()
      || !formLineaId.value
      || !formTipoPedidoId.value
      || !formMedidaId.value
      || !formMedidaCompraId.value
    ) return

    saving.value = true

    try {
      const payload: Record<string, any> = {
        clave: Number(formClave.value),
        clave_sat: formClaveSat.value.trim() || null,
        nombre: formNombre.value.trim(),
        descripcion: formDescripcion.value.trim() || null,
        activo: formActivo.value,
        facturable: formFacturable.value,
        linea_id: formLineaId.value,
        tipo_pedido_id: formTipoPedidoId.value,
        medida_id: formMedidaId.value,
        medida_compra_id: formMedidaCompraId.value,
        ruta: formRuta.value || null,
        precio_actual: String(formPrecioActual.value).trim() === '' ? null : Number(formPrecioActual.value),
        costo_actual: String(formCostoActual.value).trim() === '' ? null : Number(formCostoActual.value),
        impuestos: formImpuestos.value,
        motivo_precio: formMotivoPrecio.value.trim() || null,
        motivo_costo: formMotivoCosto.value.trim() || null,
        fecha_inicio_precio: normalizeDate(formFechaInicioPrecio.value),
        fecha_inicio_costo: normalizeDate(formFechaInicioCosto.value),
      }

      if (isEdit.value) await updateProducto(editingId.value!, payload)
      else await createProducto(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    productos,
    loading,

    lineaOptions,
    unidadOptions,
    impuestoOptions,
    tipoPedidoOptions,
    rutaOptions,

    initialize,
    fetchProductos,
    fetchLineas,
    fetchUnidades,
    fetchImpuestos,
    fetchTiposPedido,
    createProducto,
    updateProducto,
    deleteProducto,

    drawerOpen,
    saving,
    editingId,

    formClave,
    formClaveSat,
    formNombre,
    formDescripcion,
    formActivo,
    formFacturable,
    formLineaId,
    formTipoPedidoId,
    formMedidaId,
    formMedidaCompraId,
    formRuta,
    formPrecioActual,
    formCostoActual,
    formImpuestos,
    formMotivoPrecio,
    formMotivoCosto,
    formFechaInicioPrecio,
    formFechaInicioCosto,

    isEdit,
    resetForm,
    openCreate,
    openEdit,
    closeDrawer,
    saveFromDrawer,
  }
})
