import { useSwal } from '@/composables/useSwal';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type CustomerTipo = { id: number; clave?: string; nombre?: string }
export type CustomerZona = { id: number; nombre?: string }
export type CustomerBack = {
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  cp?: string | null
  condicion_pago?: string | null
}

export type CustomerRow = {
  id: number
  nombre: string
  activo: boolean
  tipo_cliente_id: number
  zona_id: number | null
  tipo?: CustomerTipo | null
  zona?: CustomerZona | null
  back?: CustomerBack | null
}

export const useCustomersStore = defineStore('customers', () => {
  const { success, error } = useSwal()

  const customers = ref<CustomerRow[]>([])
  const loading = ref(false)

  const fetchCustomers = async () => {
    loading.value = true
    try {
      const res: any = await $api('/catalogos/clientes?with=tipo,zona,back')
      // Normaliza paginado/array
      if (Array.isArray(res?.data?.data?.data)) customers.value = res.data.data.data
      else if (Array.isArray(res?.data?.data)) customers.value = res.data.data
      else if (Array.isArray(res?.data)) customers.value = res.data
      else customers.value = []
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (payload: any) => {
    try {
      const res: any = await $api('/catalogos/clientes', { method: 'POST', body: payload })
      await success('Listo', 'Cliente creado correctamente.')
      await fetchCustomers()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const updateCustomer = async (id: number, payload: any) => {
    try {
      const res: any = await $api(`/catalogos/clientes/${id}`, { method: 'PUT', body: payload })
      await success('Listo', 'Cliente actualizado correctamente.')
      await fetchCustomers()
      return res
    } catch (e: any) {
      handleApiError(e)
      throw e
    }
  }

  const deleteCustomer = async (id: number) => {
    try {
      await $api(`/catalogos/clientes/${id}`, { method: 'DELETE' })
      await success('Eliminado', 'Cliente eliminado correctamente.')
      await fetchCustomers()
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
      data?.errors?.tipo_cliente_id?.[0] ??
      data?.errors?.zona_id?.[0] ??
      data?.errors?.['back.email']?.[0] ??
      (status === 422 ? 'Error de validación.' : null) ??
      'Ocurrió un error inesperado.'

    error('Error', msg)
  }

  // UI Drawer
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editingId = ref<number | null>(null)

  // Form base
  const formNombre = ref('')
  const formTipoClienteId = ref<number | null>(null)
  const formZonaId = ref<number | null>(null)
  const formActivo = ref(true)

  // Form back
  const formContacto = ref('')
  const formTelefono = ref('')
  const formEmail = ref('')
  const formDireccion = ref('')
  const formCp = ref('')
  const formCondicionPago = ref('')

  const isEdit = computed(() => editingId.value !== null)

  const resetForm = () => {
    editingId.value = null
    formNombre.value = ''
    formTipoClienteId.value = null
    formZonaId.value = null
    formActivo.value = true

    formContacto.value = ''
    formTelefono.value = ''
    formEmail.value = ''
    formDireccion.value = ''
    formCp.value = ''
    formCondicionPago.value = ''
  }

  const openCreate = () => {
    resetForm()
    drawerOpen.value = true
  }

  const openEdit = (c: CustomerRow) => {
    editingId.value = c.id
    formNombre.value = c.nombre ?? ''
    formTipoClienteId.value = c.tipo_cliente_id ?? null
    formZonaId.value = c.zona_id ?? null
    formActivo.value = !!c.activo

    formContacto.value = c.back?.contacto ?? ''
    formTelefono.value = c.back?.telefono ?? ''
    formEmail.value = c.back?.email ?? ''
    formDireccion.value = c.back?.direccion ?? ''
    formCp.value = c.back?.cp ?? ''
    formCondicionPago.value = c.back?.condicion_pago ?? ''

    drawerOpen.value = true
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  const buildPayload = () => {
    const payload: any = {
      nombre: formNombre.value.trim(),
      tipo_cliente_id: formTipoClienteId.value,
      zona_id: formZonaId.value,
      activo: formActivo.value,
      back: {
        contacto: formContacto.value.trim() || null,
        telefono: formTelefono.value.trim() || null,
        email: formEmail.value.trim() || null,
        direccion: formDireccion.value.trim() || null,
        cp: formCp.value.trim() || null,
        condicion_pago: formCondicionPago.value.trim() || null,
      },
    }

    // si back va completamente vacío, lo puedes omitir
    const b = payload.back
    const hasAnyBack = Object.values(b).some(v => v !== null && String(v).trim() !== '')
    if (!hasAnyBack) delete payload.back

    // zona_id nullable: si viene null está ok; si tu backend no acepta null, bórralo
    if (payload.zona_id === null) delete payload.zona_id

    return payload
  }

  const saveFromDialog = async () => {
    if (!formNombre.value.trim() || !formTipoClienteId.value) return

    saving.value = true
    try {
      const payload = buildPayload()

      if (isEdit.value) await updateCustomer(editingId.value!, payload)
      else await createCustomer(payload)

      closeDrawer()
      resetForm()
    } finally {
      saving.value = false
    }
  }

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    drawerOpen,
    saving,
    editingId,
    isEdit,

    formNombre,
    formTipoClienteId,
    formZonaId,
    formActivo,

    formContacto,
    formTelefono,
    formEmail,
    formDireccion,
    formCp,
    formCondicionPago,

    openCreate,
    openEdit,
    closeDrawer,
    resetForm,
    saveFromDialog,
  }
})
