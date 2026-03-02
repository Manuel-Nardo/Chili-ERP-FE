<script setup lang="ts">
import { useTaxesStore } from '@/stores/catalogs/taxes.store'
import TaxForm from '@/views/catalogs/taxes/TaxForm.vue'
import { computed, ref, watch } from 'vue'

const store = useTaxesStore()

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref<number[]>([])

const isDrawerOpen = ref(false)
const editingId = ref<number | null>(null)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Tasa (%)', key: 'rate' },
  { title: 'Activo', key: 'active' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const openCreate = () => {
  editingId.value = null
  isDrawerOpen.value = true
}

const openEdit = (id: number) => {
  editingId.value = id
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

watch(isDrawerOpen, val => {
  if (!val) store.clearForm()
})

store.fetch()

const filtered = computed(() => {
  if (!searchQuery.value) return store.items

  const q = searchQuery.value.toLowerCase()
  return store.items.filter(x =>
    x.name.toLowerCase().includes(q),
  )
})
</script>

<template>
  <VCard>
    <!-- Filtros -->
    <VCardText class="d-flex justify-space-between flex-wrap gap-4">
      <AppTextField
        v-model="searchQuery"
        placeholder="Buscar impuesto..."
        style="max-inline-size: 250px;"
      />

      <VBtn prepend-icon="tabler-plus" @click="openCreate">
        Nuevo
      </VBtn>
    </VCardText>

    <VDivider />

    <!-- Tabla -->
    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :headers="headers"
      :items="filtered"
      :items-length="filtered.length"
      class="text-no-wrap"
    >
      <!-- Tasa -->
      <template #item.rate="{ item }">
        {{ item.rate }}%
      </template>

      <!-- Activo -->
      <template #item.active="{ item }">
        <VChip
          :color="item.active ? 'success' : 'warning'"
          size="small"
          label
        >
          {{ item.active ? 'Sí' : 'No' }}
        </VChip>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <IconBtn>
          <VIcon icon="tabler-dots-vertical" />
          <VMenu activator="parent">
            <VList density="compact">
              <VListItem
                prepend-icon="tabler-edit"
                @click="openEdit(item.id)"
              >
                Editar
              </VListItem>

              <VListItem
                prepend-icon="tabler-trash"
                class="text-error"
                @click="store.remove(item.id)"
              >
                Eliminar
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </template>
    </VDataTableServer>
  </VCard>

  <!-- Drawer -->
  <VNavigationDrawer
    v-model="isDrawerOpen"
    location="end"
    width="420"
    temporary
  >
    <div class="pa-6 d-flex justify-space-between align-center">
      <h6 class="text-h6">
        {{ editingId ? 'Editar impuesto' : 'Nuevo impuesto' }}
      </h6>

      <VBtn icon variant="text" @click="closeDrawer">
        <VIcon icon="tabler-x" />
      </VBtn>
    </div>

    <VDivider />

    <div class="pa-6">
      <TaxForm
        :id="editingId"
        @saved="closeDrawer"
      />
    </div>
  </VNavigationDrawer>
</template>
