<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useTiposClientesStore } from '@/stores/catalogs/tipos_clientes.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useTiposClientesStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.tipos
  return store.tipos.filter(t =>
    (t.nombre ?? '').toLowerCase().includes(query) ||
    (t.clave ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Clave', key: 'clave' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.fetchTipos()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({ title: '¿Eliminar tipo?', text: 'Esta acción no se puede deshacer.' })
  if (!ok) return
  await store.deleteTipo(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-id-badge-2" />
          <h4 class="text-h5 mb-0">Tipos de Cliente</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Catálogo para clasificar clientes internos y externos.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar tipo..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn variant="tonal" :loading="store.loading" :disabled="store.loading" @click="store.fetchTipos()">
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo tipo
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
      <template #item.clave="{ item }">
        <VChip size="small" variant="tonal">
          <VIcon icon="tabler-key" size="16" class="me-1" />
          {{ item.clave }}
        </VChip>
      </template>

      <template #item.nombre="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-tag" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.nombre }}</span>
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
          <VTooltip text="Editar tipo" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar tipo" location="top">
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
          <div>No hay tipos para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <TipoClienteDialog />
    <TipoClienteDrawer />
  </VCard>
</template>

<script lang="ts">
import TipoClienteDialog from '@/views/catalogs/client_types/TipoClienteDialog.vue'
import TipoClienteDrawer from '@/views/catalogs/client_types/TipoClienteDrawer.vue'
export default {}
</script>
