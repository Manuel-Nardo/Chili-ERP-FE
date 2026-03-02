import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export interface Tax {
  id: number
  name: string
  rate: number
  active: boolean
}

export const useTaxesStore = defineStore('taxes', () => {
  // state
  const items = ref<Tax[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const form = reactive({
    name: '',
    rate: 16 as number | string,
    active: true,
  })

  const seq = ref(3)

  // actions
  const clearForm = () => {
    form.name = ''
    form.rate = 16
    form.active = true
    error.value = ''
  }

    const drawerOpen = ref(false)
    const editingId = ref<number | null>(null)

    const openCreate = () => {
    editingId.value = null
    clearForm()
    drawerOpen.value = true
    }

    const openEdit = async (id: number) => {
    editingId.value = id
    await load(id)
    drawerOpen.value = true
    }

    const closeDrawer = () => {
    drawerOpen.value = false
    editingId.value = null
    clearForm()
    }

  const fetch = async () => {
    loading.value = true
    error.value = ''
    try {
      // MOCK (luego lo conectas a API)
      items.value = [
        { id: 1, name: 'IVA', rate: 16, active: true },
        { id: 2, name: 'IVA 0%', rate: 0, active: true },
        { id: 3, name: 'IEPS', rate: 8, active: false },
      ]
      seq.value = Math.max(...items.value.map(x => x.id))
    } catch (e: any) {
      error.value = e?.message ?? 'Error al cargar'
    } finally {
      loading.value = false
    }
  }

  const load = async (id: number) => {
    error.value = ''
    const row = items.value.find(x => x.id === id)
    if (!row) {
      error.value = 'No encontrado'
      return
    }

    form.name = row.name
    form.rate = row.rate
    form.active = row.active
  }

  const save = async (id: number | null) => {
    saving.value = true
    error.value = ''
    try {
      const payload = {
        name: String(form.name).trim(),
        rate: Number(form.rate),
        active: !!form.active,
      }

      if (!payload.name) throw new Error('Nombre requerido')
      if (Number.isNaN(payload.rate)) throw new Error('Tasa inválida')
      if (payload.rate < 0 || payload.rate > 100) throw new Error('Tasa fuera de rango (0-100)')

      if (id) {
        const idx = items.value.findIndex(x => x.id === id)
        if (idx === -1) throw new Error('No encontrado')
        items.value[idx] = { id, ...payload }
      } else {
        seq.value += 1
        items.value.unshift({ id: seq.value, ...payload })
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Error al guardar'
      throw e
    } finally {
      saving.value = false
    }
  }

  const remove = async (id: number) => {
    items.value = items.value.filter(x => x.id !== id)
  }

  // getters (si los ocupas)
  const activeItems = computed(() => items.value.filter(x => x.active))

return {
  items, loading, saving, error, form,
  fetch, load, save, remove, clearForm,

  // drawer state
  drawerOpen,
  editingId,
  openCreate,
  openEdit,
  closeDrawer,
}
})
