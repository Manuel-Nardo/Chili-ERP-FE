<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useImpuestosStore } from '@/stores/catalogs/impuestos.store'
import ImpuestoDialog from '@/views/catalogs/impuestos/ImpuestoDialog.vue'
import ImpuestoDrawer from '@/views/catalogs/impuestos/ImpuestoDrawer.vue'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useImpuestosStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.impuestos

  return store.impuestos.filter(i =>
    (i.nombre ?? '').toLowerCase().includes(query)
    || (i.codigo ?? '').toLowerCase().includes(query)
    || (i.tipo ?? '').toLowerCase().includes(query)
    || String(i.porcentaje ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Código', key: 'codigo' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Porcentaje', key: 'porcentaje' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.fetchImpuestos()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar impuesto?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteImpuesto(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-receipt-tax" />
          <h4 class="text-h5 mb-0">Impuestos</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina impuestos para usarlos en el catálogo de productos.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar impuesto..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn
          variant="tonal"
          :loading="store.loading"
          :disabled="store.loading"
          @click="store.fetchImpuestos()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo impuesto
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
          <VIcon icon="tabler-file-percent" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.nombre }}</span>
        </div>
      </template>

      <template #item.codigo="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.codigo }}
        </VChip>
      </template>

      <template #item.tipo="{ item }">
        <VChip size="small" color="primary" variant="tonal">
          {{ item.tipo }}
        </VChip>
      </template>

      <template #item.porcentaje="{ item }">
        <span class="font-weight-medium">{{ Number(item.porcentaje ?? 0).toFixed(2) }}%</span>
      </template>

      <template #item.activo="{ item }">
        <VChip size="small" :color="item.activo ? 'success' : 'secondary'" variant="tonal">
          <VIcon :icon="item.activo ? 'tabler-check' : 'tabler-minus'" size="16" class="me-1" />
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar impuesto" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar impuesto" location="top">
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
          <div>No hay impuestos para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <ImpuestoDialog />
    <ImpuestoDrawer />
  </VCard>
</template>
