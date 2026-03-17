<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useSeriesSucursalStore } from '@/stores/catalogs/series-sucursal.store'
import SerieSucursalDialog from '@/views/catalogs/series-sucursal/SerieSucursalDialog.vue'
import SerieSucursalDrawer from '@/views/catalogs/series-sucursal/SerieSucursalDrawer.vue'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useSeriesSucursalStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.seriesSucursal

  return store.seriesSucursal.filter(s =>
    (s.serie ?? '').toLowerCase().includes(query)
    || (s.cliente?.nombre ?? '').toLowerCase().includes(query)
    || (s.tipoSerie?.nombre ?? s.tipo_serie?.nombre ?? '').toLowerCase().includes(query)
    || (s.tipoSerie?.clave ?? s.tipo_serie?.clave ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Cliente', key: 'cliente' },
  { title: 'Tipo serie', key: 'tipoSerie' },
  { title: 'Serie', key: 'serie' },
  { title: 'Folio actual', key: 'folio_actual' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.initialize()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar serie por cliente?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteSerieSucursal(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-hash" />
          <h4 class="text-h5 mb-0">Series por cliente</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Configura consecutivos por cliente y tipo de serie.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar serie..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn variant="tonal" :loading="store.loading" :disabled="store.loading" @click="store.initialize()">
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nueva serie
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
      <template #item.cliente="{ item }">
        <span class="font-weight-medium">{{ item.cliente?.nombre || '-' }}</span>
      </template>

      <template #item.tipoSerie="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.tipoSerie?.nombre || item.tipo_serie?.nombre || '-' }}
        </VChip>
      </template>

      <template #item.serie="{ item }">
        <VChip size="small" color="primary" variant="tonal">
          {{ item.serie }}
        </VChip>
      </template>

      <template #item.folio_actual="{ item }">
        <span class="font-weight-medium">{{ item.folio_actual }}</span>
      </template>

      <template #item.activo="{ item }">
        <VChip size="small" :color="item.activo ? 'success' : 'secondary'" variant="tonal">
          <VIcon :icon="item.activo ? 'tabler-check' : 'tabler-minus'" size="16" class="me-1" />
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar serie" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar serie" location="top">
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
          <div>No hay series por cliente para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <SerieSucursalDialog />
    <SerieSucursalDrawer />
  </VCard>
</template>
