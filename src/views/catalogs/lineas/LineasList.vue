<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useLineasStore } from '@/stores/catalogs/lineas.store'
import LineaDialog from '@/views/catalogs/lineas/LineaDialog.vue'
import LineaDrawer from '@/views/catalogs/lineas/LineaDrawer.vue'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useLineasStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.lineas

  return store.lineas.filter(l =>
    (l.nombre ?? '').toLowerCase().includes(query)
    || (l.descripcion ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.fetchLineas()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar línea?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteLinea(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-category" />
          <h4 class="text-h5 mb-0">Líneas</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina líneas para clasificar productos.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar línea..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn
          variant="tonal"
          :loading="store.loading"
          :disabled="store.loading"
          @click="store.fetchLineas()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nueva línea
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
          <VIcon icon="tabler-category-2" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.nombre }}</span>
        </div>
      </template>

      <template #item.descripcion="{ item }">
        <span class="text-medium-emphasis">
          {{ item.descripcion || '-' }}
        </span>
      </template>

      <template #item.activo="{ item }">
        <VChip size="small" :color="item.activo ? 'success' : 'secondary'" variant="tonal">
          <VIcon :icon="item.activo ? 'tabler-check' : 'tabler-minus'" size="16" class="me-1" />
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar línea" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar línea" location="top">
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
          <div>No hay líneas para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <LineaDialog />
    <LineaDrawer />
  </VCard>
</template>
