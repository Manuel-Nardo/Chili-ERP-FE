import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { ref } from 'vue'

type RemisionableDetalle = {
  pedido_det_erp_id: number
  articulo_id: number
  producto: {
    id: number
    nombre: string
    clave?: string | null
  } | null
  cantidad_pedida: number
  cantidad_remisionada: number
  cantidad_pendiente: number
  precio_unitario: number
  importe: number
  iva: number
  impuesto_iva: number
  total: number
  estatus: string
  observaciones?: string | null
  cantidad_a_remisionar?: number
}

type PedidoRemisionable = {
  id: number
  folio: number
  estatus: string
  fecha_pedido: string
  fecha_objetivo?: string | null
  subtotal: number
  impuestos: number
  total: number
  tipo_pedido?: { id: number; nombre: string } | null
  sucursal_origen?: { id: number; nombre: string } | null
  sucursal_destino?: { id: number; nombre: string } | null
  serie_sucursal?: { id: number; serie?: string | null } | null
}

export const usePedidoRemisionStore = defineStore('pedido-remision', () => {
  const { error, success } = useSwal()

  const loading = ref(false)
  const saving = ref(false)

  const pedido = ref<PedidoRemisionable | null>(null)
  const detalles = ref<RemisionableDetalle[]>([])

  const fechaRemision = ref('')
  const fechaObjetivo = ref('')
  const observaciones = ref('')

  const fetchRemisionable = async (pedidoId: number) => {
    loading.value = true

    try {
      const res: any = await $api(`/pedidos-erp/${pedidoId}/remisionable`, {
        method: 'GET',
      })

      pedido.value = res?.data?.pedido ?? null
      detalles.value = Array.isArray(res?.data?.detalles)
        ? res.data.detalles.map((item: any) => ({
            ...item,
            cantidad_a_remisionar: item.cantidad_pendiente > 0 ? item.cantidad_pendiente : 0,
          }))
        : []

      fechaRemision.value = new Date().toISOString().slice(0, 10)
      fechaObjetivo.value = pedido.value?.fecha_objetivo ?? ''
      observaciones.value = ''
    } catch (e: any) {
      pedido.value = null
      detalles.value = []
      await error('Error', e?.message || 'No se pudo cargar el resumen remisionable.')
    } finally {
      loading.value = false
    }
  }

  const generarRemision = async (pedidoId: number) => {
    saving.value = true

    try {
      const payload = {
        fecha_remision: fechaRemision.value,
        fecha_objetivo: fechaObjetivo.value || null,
        observaciones: observaciones.value || null,
        detalles: detalles.value
          .filter(item => Number(item.cantidad_a_remisionar ?? 0) > 0)
          .map(item => ({
            pedido_det_erp_id: item.pedido_det_erp_id,
            cantidad: Number(item.cantidad_a_remisionar ?? 0),
          })),
      }

      const res: any = await $api(`/remisiones-erp/generar-desde-pedido/${pedidoId}`, {
        method: 'POST',
        body: payload,
      })

      await success('Listo', res?.message || 'Remisión generada correctamente.')
      return res?.data ?? null
    } catch (e: any) {
      await error('Error', e?.message || 'No se pudo generar la remisión.')
      return null
    } finally {
      saving.value = false
    }
  }

  const reset = () => {
    pedido.value = null
    detalles.value = []
    fechaRemision.value = ''
    fechaObjetivo.value = ''
    observaciones.value = ''
  }

  return {
    loading,
    saving,
    pedido,
    detalles,
    fechaRemision,
    fechaObjetivo,
    observaciones,
    fetchRemisionable,
    generarRemision,
    reset,
  }
})
