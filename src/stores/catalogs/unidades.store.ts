import { useSwal } from '@/composables/useSwal'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type UnidadRow = {
  id: number
  clave: string
  nombre: string
  abreviatura: string
  activo: boolean
}

export const useUnidadesStore = defineStore('unidades', () => {
  const { success, error } = useSwal()

  const unidades = ref<UnidadRow[]>([])
  const loading = ref(false)

  const fetchUnidades = async () => {
    loading.value = true

    try {
      const res: any = await $api('/catalogos/unidades')

      const data = res?.data?.data ?? res?.data ?? res?.data?.data?.data

      if (Array.isArray(res?.data?.data?.data)) unidades.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) unidades.value = res.data.data
      else if (Array.isArray(res?.data)) unidades.value = res.data
      else unidades.value = Array.isArray(data) ? data : []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createUnidad = async (payload: {
    clave: string
    nombre: string
    abreviatura: string
    activo: boolean
  }) => {
    try {
      const res: any = await $api('/catalogos/unidades', {
        method: 'POST',
        body: payload,
      })

      await success('Listo', 'Unidad creada correctamente.')
      await fetchUnidades()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateUnidad = async (
    id: number,
    payload: {
      clave?: string
      nombre?: string
      abreviatura?: string
      activo?: boolean
    },
  ) => {
    try {
      const res: any = await $api(`/catalogos/unidades/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await success('Listo', 'Unidad actualizada correctamente.')
      await fetchUnidades()

      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteUnidad = async (id: number) => {
    try {
      await $api(`/catalogos/unidades/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Unidad eliminada correctamente.')
      await fetchUnidades()
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
      ?? data?.errors?.clave?.[0]
      ?? data?.errors?.nombre?.[0]
      ?? data?.errors?.abreviatura?.[0]
      ?? (status === 422 ? 'Error de validación.' : null)
      ?? 'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  const formClave = ref('')
  const formNombre = ref('')
  const formAbreviatura = ref('')
  const formActivo = ref(true)

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formClave.value = ''
    formNombre.value = ''
    formAbreviatura.value = ''
    formActivo.value = true
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (u: UnidadRow) => {
    editingId.value = u.id
    formClave.value = u.clave ?? ''
    formNombre.value = u.nombre ?? ''
    formAbreviatura.value = u.abreviatura ?? ''
    formActivo.value = !!u.activo
    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const saveFromDrawer = async () => {
    if (!formClave.value.trim() || !formNombre.value.trim() || !formAbreviatura.value.trim()) return

    saving.value = true

    try {
      const payload = {
        clave: formClave.value.trim(),
        nombre: formNombre.value.trim(),
        abreviatura: formAbreviatura.value.trim(),
        activo: formActivo.value,
      }

      if (isEdit.value) await updateUnidad(editingId.value!, payload)
      else await createUnidad(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    unidades,
    loading,
    fetchUnidades,
    createUnidad,
    updateUnidad,
    deleteUnidad,

    drawerOpen,
    saving,
    editingId,
    formClave,
    formNombre,
    formAbreviatura,
    formActivo,
    isEdit,
    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDrawer,
  }
})
