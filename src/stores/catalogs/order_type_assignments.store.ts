import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type AssignmentRow = {
  id: number
  cliente_id: number
  tipo_pedido_id: number
  usar_horario_default: boolean
  activo: boolean
  cliente?: {
    id: number
    nombre: string
  } | null
  tipo_pedido?: {
    id: number
    nombre: string
  } | null
  horarios?: Array<any>
}

export const useOrderTypeAssignmentsStore = defineStore('order_type_assignments', () => {
  const { success, error } = useSwal()

  const items = ref<AssignmentRow[]>([])
  const loading = ref(false)

  const fetchItems = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/clientes-tipos-pedido')

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
    cliente_id: number
    tipo_pedido_id: number
    usar_horario_default: boolean
    activo: boolean
  }) => {
    try {
      const res: any = await $api('/catalogos/clientes-tipos-pedido', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Asignación creada correctamente.')
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
      cliente_id?: number
      tipo_pedido_id?: number
      usar_horario_default?: boolean
      activo?: boolean
    },
  ) => {
    try {
      const res: any = await $api(`/catalogos/clientes-tipos-pedido/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Asignación actualizada correctamente.')
      await fetchItems()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteItem = async (id: number) => {
    try {
      await $api(`/catalogos/clientes-tipos-pedido/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Asignación eliminada correctamente.')
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
      data?.errors?.cliente_id?.[0] ??
      data?.errors?.tipo_pedido_id?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formClienteId = ref<number | null>(null)
  const formTipoPedidoId = ref<number | null>(null)
  const formUsarHorarioDefault = ref(true)
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formClienteId.value = null
    formTipoPedidoId.value = null
    formUsarHorarioDefault.value = true
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (item: AssignmentRow) => {
    editingId.value = item.id
    formClienteId.value = item.cliente_id
    formTipoPedidoId.value = item.tipo_pedido_id
    formUsarHorarioDefault.value = !!item.usar_horario_default
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formClienteId.value || !formTipoPedidoId.value) return

    saving.value = true
    try {
      const payload = {
        cliente_id: formClienteId.value,
        tipo_pedido_id: formTipoPedidoId.value,
        usar_horario_default: formUsarHorarioDefault.value,
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

    formClienteId,
    formTipoPedidoId,
    formUsarHorarioDefault,
    formActivo,

    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
