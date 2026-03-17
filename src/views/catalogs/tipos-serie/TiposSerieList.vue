<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useTiposSerieStore } from '@/stores/catalogs/tipos-serie.store'
import TipoSerieDialog from '@/views/catalogs/tipos-serie/TipoSerieDialog.vue'
import TipoSerieDrawer from '@/views/catalogs/tipos-serie/TipoSerieDrawer.vue'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useTiposSerieStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.tiposSerie

  return store.tiposSerie.filter(t =>
    (t.nombre ?? '').toLowerCase().includes(query)
    || (t.clave ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Clave', key: 'clave' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.fetchTiposSerie()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar tipo de serie?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteTipoSerie(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-tags" />
          <h4 class="text-h5 mb-0">Tipos de serie</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina tipos de serie.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar tipo de serie..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn variant="tonal" :loading="store.loading" :disabled="store.loading" @click="store.fetchTiposSerie()">
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
      <template #item.nombre="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-tag" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.nombre }}</span>
        </div>
      </template>

      <template #item.clave="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.clave }}
        </VChip>
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
          <div>No hay tipos de serie para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <TipoSerieDialog />
    <TipoSerieDrawer />
  </VCard>
</template>
