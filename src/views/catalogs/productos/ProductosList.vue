<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useProductosStore } from '@/stores/catalogs/productos.store'
import ProductoDialog from '@/views/catalogs/productos/ProductoDialog.vue'
import ProductoDrawer from '@/views/catalogs/productos/ProductoDrawer.vue'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useProductosStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.productos

  return store.productos.filter(p =>
    String(p.clave ?? '').toLowerCase().includes(query)
    || String(p.clave_sat ?? '').toLowerCase().includes(query)
    || String(p.nombre ?? '').toLowerCase().includes(query)
    || String(p.descripcion ?? '').toLowerCase().includes(query)
    || String(p.linea?.nombre ?? '').toLowerCase().includes(query)
    || String(p.tipo_pedido?.nombre ?? p.tipoPedido?.nombre ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Clave', key: 'clave' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Línea', key: 'linea' },
  { title: 'Tipo pedido', key: 'tipoPedido' },
  { title: 'Unidad', key: 'medida' },
  { title: 'Precio', key: 'precio_actual' },
  { title: 'Costo', key: 'costo_actual' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await store.initialize()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteProducto(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-package" />
          <h4 class="text-h5 mb-0">Productos</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina productos del catálogo interno.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar producto..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn
          variant="tonal"
          :loading="store.loading"
          :disabled="store.loading"
          @click="store.initialize()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo producto
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
        <span class="font-weight-medium">{{ item.clave }}</span>
      </template>

      <template #item.nombre="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-box" size="18" class="text-medium-emphasis" />
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.nombre }}</span>
            <span class="text-body-2 text-medium-emphasis">
              {{ item.clave_sat || 'Sin clave SAT' }}
            </span>
          </div>
        </div>
      </template>

      <template #item.linea="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.linea?.nombre || '-' }}
        </VChip>
      </template>

      <template #item.tipoPedido="{ item }">
        <VChip size="small" color="primary" variant="tonal">
          {{ item.tipoPedido?.nombre || item.tipo_pedido?.nombre || '-' }}
        </VChip>
      </template>

      <template #item.medida="{ item }">
        <span>{{ item.medida?.abreviatura || item.medida?.nombre || '-' }}</span>
      </template>

      <template #item.precio_actual="{ item }">
        <span class="font-weight-medium">
          {{ item.precio_actual !== null && item.precio_actual !== undefined ? Number(item.precio_actual).toFixed(2) : '-' }}
        </span>
      </template>

      <template #item.costo_actual="{ item }">
        <span class="font-weight-medium">
          {{ item.costo_actual !== null && item.costo_actual !== undefined ? Number(item.costo_actual).toFixed(2) : '-' }}
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
          <VTooltip text="Editar producto" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar producto" location="top">
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
          <div>No hay productos para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <ProductoDialog />
    <ProductoDrawer />
  </VCard>
</template>
