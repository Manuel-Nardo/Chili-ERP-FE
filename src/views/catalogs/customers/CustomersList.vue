<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useCustomersStore } from '@/stores/catalogs/customers.store'
import { useTiposClientesStore } from '@/stores/catalogs/tipos_clientes.store'
import { useZonasStore } from '@/stores/catalogs/zonas.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()

const store = useCustomersStore()
const zonasStore = useZonasStore()
const tiposStore = useTiposClientesStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.customers
  return store.customers.filter(c => {
    const nombre = (c.nombre ?? '').toLowerCase()
    const email = (c.back?.email ?? '').toLowerCase()
    const phone = (c.back?.telefono ?? '').toLowerCase()
    const tipo = (c.tipo?.nombre ?? c.tipo?.clave ?? '').toLowerCase()
    const zona = (c.zona?.nombre ?? '').toLowerCase()
    return (
      nombre.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      tipo.includes(query) ||
      zona.includes(query)
    )
  })
})

const headers = [
  { title: 'Cliente', key: 'nombre' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Zona', key: 'zona' },
  { title: 'Contacto', key: 'contacto' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await Promise.all([
    store.fetchCustomers(),
    zonasStore.fetchZonas(),
    tiposStore.fetchTipos(),
  ])
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({ title: '¿Eliminar cliente?', text: 'Esta acción no se puede deshacer.' })
  if (!ok) return
  await store.deleteCustomer(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-building-store" />
          <h4 class="text-h5 mb-0">Clientes</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Gestiona clientes internos (sucursales) y externos.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar cliente..."
          density="compact"
          style="min-width: 320px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn variant="tonal" :loading="store.loading" :disabled="store.loading" @click="store.fetchCustomers()">
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo cliente
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTable
      :headers="headers"
      :items="filtered"
      :loading="store.loading"
      item-value="id"
      density="compact"
      class="text-no-wrap"
    >
      <template #item.nombre="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-user-square-rounded" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.nombre }}</span>
        </div>
        <div v-if="item.back?.email" class="text-body-2 text-medium-emphasis">
          {{ item.back.email }}
        </div>
      </template>

      <template #item.tipo="{ item }">
        <VChip size="small" variant="tonal">
          <VIcon icon="tabler-tag" size="16" class="me-1" />
          {{ item.tipo?.nombre ?? item.tipo?.clave ?? '—' }}
        </VChip>
      </template>

      <template #item.zona="{ item }">
        <span class="text-body-2">
          {{ item.zona?.nombre ?? '—' }}
        </span>
      </template>

      <template #item.contacto="{ item }">
        <div class="text-body-2">
          {{ item.back?.contacto ?? '—' }}
        </div>
        <div v-if="item.back?.telefono" class="text-body-2 text-medium-emphasis">
          {{ item.back.telefono }}
        </div>
      </template>

      <template #item.activo="{ item }">
        <VChip size="small" :color="item.activo ? 'success' : 'secondary'" variant="tonal">
          <VIcon :icon="item.activo ? 'tabler-check' : 'tabler-minus'" size="16" class="me-1" />
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar cliente" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar cliente" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="onDelete(item.id)">
                <VIcon icon="tabler-trash" class="text-error" />
              </IconBtn>
            </template>
          </VTooltip>
        </div>
      </template>

      <template #no-data>
        <div class="py-8 text-center text-medium-emphasis">
          <VIcon icon="tabler-folder-off" class="mb-2" />
          <div>No hay clientes para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <CustomerDialog />
    <CustomerDrawer />
  </VCard>
</template>

<script lang="ts">
import CustomerDialog from '@/views/catalogs/customers/CustomerDialog.vue'
import CustomerDrawer from '@/views/catalogs/customers/CustomerDrawer.vue'
export default {}
</script>
