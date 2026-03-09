import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type OrderTypeScheduleRow = {
  id: number
  tipo_pedido_id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
  tipoPedido?: {
    id: number
    nombre: string
  } | null
}

export const useOrderTypeSchedulesStore = defineStore('order_type_schedules', () => {
  const { success, error } = useSwal()

  const items = ref<OrderTypeScheduleRow[]>([])
  const loading = ref(false)

  const fetchItems = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/tipos-pedido-horarios')

      if (Array.isArray(res?.data?.data?.data)) items.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) items.value = res.data.data
      else if (Array.isArray(res?.data)) items.value = res.data
      else items.value = []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createItem = async (payload: {
    tipo_pedido_id: number
    dia_semana: number
    hora_inicio: string
    hora_fin: string
    activo: boolean
  }) => {
    try {
      const res: any = await $api('/catalogos/tipos-pedido-horarios', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Horario default creado correctamente.')
      await fetchItems()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateItem = async (
    id: number,
    payload: {
      tipo_pedido_id?: number
      dia_semana?: number
      hora_inicio?: string
      hora_fin?: string
      activo?: boolean
    },
  ) => {
    try {
      const res: any = await $api(`/catalogos/tipos-pedido-horarios/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Horario default actualizado correctamente.')
      await fetchItems()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteItem = async (id: number) => {
    try {
      await $api(`/catalogos/tipos-pedido-horarios/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Horario default eliminado correctamente.')
      await fetchItems()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const msg =
      data?.message ??
      data?.errors?.tipo_pedido_id?.[0] ??
      data?.errors?.dia_semana?.[0] ??
      data?.errors?.hora_inicio?.[0] ??
      data?.errors?.hora_fin?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formTipoPedidoId = ref<number | null>(null)
  const formDiaSemana = ref<number | null>(null)
  const formHoraInicio = ref('')
  const formHoraFin = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formTipoPedidoId.value = null
    formDiaSemana.value = null
    formHoraInicio.value = ''
    formHoraFin.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (item: OrderTypeScheduleRow) => {
    editingId.value = item.id
    formTipoPedidoId.value = item.tipo_pedido_id
    formDiaSemana.value = item.dia_semana
    formHoraInicio.value = item.hora_inicio
    formHoraFin.value = item.hora_fin
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (
      !formTipoPedidoId.value ||
      !formDiaSemana.value ||
      !formHoraInicio.value.trim() ||
      !formHoraFin.value.trim()
    ) return

    saving.value = true
    try {
      const payload = {
        tipo_pedido_id: formTipoPedidoId.value,
        dia_semana: formDiaSemana.value,
        hora_inicio: formHoraInicio.value,
        hora_fin: formHoraFin.value,
        activo: formActivo.value,
      }

      if (isEdit.value)
        await updateItem(editingId.value!, payload)
      else
        await createItem(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,

    drawerOpen,
    saving,
    editingId,
    isEdit,

    formTipoPedidoId,
    formDiaSemana,
    formHoraInicio,
    formHoraFin,
    formActivo,

    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
