import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ImpuestoRow = {
  id: number
  nombre: string
  codigo: string
  tipo: 'IVA' | 'IEPS' | 'ISR' | 'OTRO'
  porcentaje: number | string
  activo: boolean
}

export const useImpuestosStore = defineStore('impuestos', () => {
  const { success, error } = useSwal()

  const impuestos = ref<ImpuestoRow[]>([])
  const loading = ref(false)

  const tipoOptions = [
    { title: 'IVA', value: 'IVA' },
    { title: 'IEPS', value: 'IEPS' },
    { title: 'ISR', value: 'ISR' },
    { title: 'OTRO', value: 'OTRO' },
  ]

  const fetchImpuestos = async () => {
    loading.value = true

    try {
      const res: any = await $api('/catalogos/impuestos')
      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

      if (Array.isArray(res?.data?.data?.data)) impuestos.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) impuestos.value = res.data.data
      else if (Array.isArray(res?.data)) impuestos.value = res.data
      else impuestos.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createImpuesto = async (payload: {
    nombre: string
    codigo: string
    tipo: string
    porcentaje: number
    activo: boolean
  }) => {
    try {
      const res: any = await $api('/catalogos/impuestos', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Impuesto creado correctamente.')
      await fetchImpuestos()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateImpuesto = async (
    id: number,
    payload: {
      nombre?: string
      codigo?: string
      tipo?: string
      porcentaje?: number
      activo?: boolean
    },
  ) => {
    try {
      const res: any = await $api(`/catalogos/impuestos/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Impuesto actualizado correctamente.')
      await fetchImpuestos()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteImpuesto = async (id: number) => {
    try {
      await $api(`/catalogos/impuestos/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Impuesto eliminado correctamente.')
      await fetchImpuestos()
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const handleApiError = (e: any) => {
    const status = e?.status ?? e?.response?.status
    const data = e?.data ?? e?.response?.data ?? e?.response?._data

    const msg =
      data?.message
      ?? data?.errors?.nombre?.[0]
      ?? data?.errors?.codigo?.[0]
      ?? data?.errors?.tipo?.[0]
      ?? data?.errors?.porcentaje?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formNombre = ref('')
  const formCodigo = ref('')
  const formTipo = ref<'IVA' | 'IEPS' | 'ISR' | 'OTRO' | ''>('')
  const formPorcentaje = ref<number | string>('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formCodigo.value = ''
    formTipo.value = ''
    formPorcentaje.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (i: ImpuestoRow) => {
    editingId.value = i.id
    formNombre.value = i.nombre ?? ''
    formCodigo.value = i.codigo ?? ''
    formTipo.value = (i.tipo as 'IVA' | 'IEPS' | 'ISR' | 'OTRO') ?? ''
    formPorcentaje.value = i.porcentaje ?? ''
    formActivo.value = !!i.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDrawer = async () => {
    if (
      !formNombre.value.trim()
      || !formCodigo.value.trim()
      || !String(formTipo.value).trim()
      || String(formPorcentaje.value).trim() === ''
    ) return

    saving.value = true

    try {
      const payload = {
        nombre: formNombre.value.trim(),
        codigo: formCodigo.value.trim().toUpperCase(),
        tipo: String(formTipo.value).trim().toUpperCase(),
        porcentaje: Number(formPorcentaje.value),
        activo: formActivo.value,
      }

      if (isEdit.value) await updateImpuesto(editingId.value!, payload)
      else await createImpuesto(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    impuestos,
    loading,
    tipoOptions,
    fetchImpuestos,
    createImpuesto,
    updateImpuesto,
    deleteImpuesto,

    drawerOpen,
    saving,
    editingId,
    formNombre,
    formCodigo,
    formTipo,
    formPorcentaje,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDrawer,
  }
})
