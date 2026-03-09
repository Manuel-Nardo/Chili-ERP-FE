import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type AssignmentScheduleRow = {
  id: number
  cliente_tipo_pedido_id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
  cliente_tipo_pedido?: {
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
  } | null
}

type AssignmentRef = {
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
}

export const useOrderTypeAssignmentSchedulesStore = defineStore('order_type_assignment_schedules', () => {
  const { success, error } = useSwal()

  const items = ref<AssignmentScheduleRow[]>([])
  const loading = ref(false)

  const dialogOpen = ref(false)
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const selectedAssignment = ref<AssignmentRef | null>(null)

  const formDiaSemana = ref<number | null>(null)
  const formHoraInicio = ref('')
  const formHoraFin = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const dayMap: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const msg =
      data?.message ??
      data?.errors?.cliente_tipo_pedido_id?.[0] ??
      data?.errors?.dia_semana?.[0] ??
      data?.errors?.hora_inicio?.[0] ??
      data?.errors?.hora_fin?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const fetchItems = async (clienteTipoPedidoId?: number) => {
    if (!clienteTipoPedidoId && !selectedAssignment.value?.id) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const targetId = clienteTipoPedidoId ?? selectedAssignment.value!.id

      const res: any = await $api('/catalogos/clientes-tipos-pedido-horarios', {
        query: {
          cliente_tipo_pedido_id: targetId,
          per_page: 100,
        },
      })

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
    cliente_tipo_pedido_id: number
    dia_semana: number
    hora_inicio: string
    hora_fin: string
    activo: boolean
  }) => {
    try {
      return await $api('/catalogos/clientes-tipos-pedido-horarios', {
        method: 'POST',
        body: payload,
      })
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateItem = async (
    id: number,
    payload: {
      cliente_tipo_pedido_id?: number
      dia_semana?: number
      hora_inicio?: string
      hora_fin?: string
      activo?: boolean
    },
  ) => {
    try {
      return await $api(`/catalogos/clientes-tipos-pedido-horarios/${id}`, {
        method: 'PUT',
        body: payload,
      })
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteItem = async (id: number) => {
    try {
      await $api(`/catalogos/clientes-tipos-pedido-horarios/${id}`, {
        method: 'DELETE',
      })

      await success('Eliminado', 'Horario personalizado eliminado correctamente.')
      await fetchItems()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const resetForm = () => {
    editingId.value = null
    formDiaSemana.value = null
    formHoraInicio.value = ''
    formHoraFin.value = ''
    formActivo.value = true
  }

    const openManager = async (assignment: AssignmentRef) => {
        if (assignment.usar_horario_default) {
            error('Error', 'Esta asignación usa horario default. Desactiva esa opción para personalizar horarios.')
            return
        }

        selectedAssignment.value = assignment
        dialogOpen.value = true
        resetForm()
        await fetchItems(assignment.id)
    }

  const closeManager = () => {
    dialogOpen.value = false
    drawerOpen.value = false
    selectedAssignment.value = null
    items.value = []
    resetForm()
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (item: AssignmentScheduleRow) => {
    editingId.value = item.id
    formDiaSemana.value = item.dia_semana
    formHoraInicio.value = item.hora_inicio?.slice(0, 5) ?? ''
    formHoraFin.value = item.hora_fin?.slice(0, 5) ?? ''
    formActivo.value = !!item.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDialog = async () => {
    if (!selectedAssignment.value?.id) {
      error('Error', 'No hay asignación seleccionada.')
      return
    }

    if (
      !formDiaSemana.value ||
      !formHoraInicio.value.trim() ||
      !formHoraFin.value.trim()
    ) {
      error('Error', 'Completa los campos requeridos.')
      return
    }

    saving.value = true
    try {
      const payload = {
        cliente_tipo_pedido_id: selectedAssignment.value.id,
        dia_semana: formDiaSemana.value,
        hora_inicio: formHoraInicio.value,
        hora_fin: formHoraFin.value,
        activo: formActivo.value,
      }

      if (isEdit.value) {
        await updateItem(editingId.value!, payload)
      } else {
        await createItem(payload)
      }

      await fetchItems()
      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

    return {
        items,
        loading,
        dialogOpen,
        drawerOpen,
        saving,
        editingId,
        selectedAssignment,
        isEdit,
        dayMap,

        formDiaSemana,
        formHoraInicio,
        formHoraFin,
        formActivo,

        fetchItems,
        createItem,
        updateItem,
        deleteItem,

        resetForm,
        openManager,
        closeManager,
        openCreate,
        openEdit,
        closeDrawer,
        saveFromDialog,
    }
})
