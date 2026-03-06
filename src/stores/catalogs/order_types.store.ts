import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type OrderTypeRow = {
  id: number
  nombre: string
  detalle: string | null
  activo: boolean
}

export const useOrderTypesStore = defineStore('order_types', () => {
  const { success, error } = useSwal()

  const orderTypes = ref<OrderTypeRow[]>([])
  const loading = ref(false)

  const fetchOrderTypes = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/tipos-pedido')

      if (Array.isArray(res?.data?.data?.data)) orderTypes.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) orderTypes.value = res.data.data
      else if (Array.isArray(res?.data)) orderTypes.value = res.data
      else orderTypes.value = []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createOrderType = async (payload: { nombre: string; detalle: string | null; activo: boolean }) => {
    try {
      const res: any = await $api('/catalogos/tipos-pedido', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Tipo de pedido creado correctamente.')
      await fetchOrderTypes()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateOrderType = async (
    id: number,
    payload: { nombre?: string; detalle?: string | null; activo?: boolean },
  ) => {
    try {
      const res: any = await $api(`/catalogos/tipos-pedido/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Tipo de pedido actualizado correctamente.')
      await fetchOrderTypes()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteOrderType = async (id: number) => {
    try {
      await $api(`/catalogos/tipos-pedido/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Tipo de pedido eliminado correctamente.')
      await fetchOrderTypes()
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
      data?.errors?.nombre?.[0] ??
      data?.errors?.detalle?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formNombre = ref('')
  const formDetalle = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formDetalle.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (item: OrderTypeRow) => {
    editingId.value = item.id
    formNombre.value = item.nombre ?? ''
    formDetalle.value = item.detalle ?? ''
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!formNombre.value.trim()) return

    saving.value = true
    try {
      const payload = {
        nombre: formNombre.value.trim(),
        detalle: formDetalle.value.trim() || null,
        activo: formActivo.value,
      }

      if (isEdit.value) {
        await updateOrderType(editingId.value!, payload)
      } else {
        await createOrderType(payload)
      }

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    orderTypes,
    loading,
    fetchOrderTypes,
    createOrderType,
    updateOrderType,
    deleteOrderType,

    drawerOpen,
    saving,
    editingId,
    formNombre,
    formDetalle,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
