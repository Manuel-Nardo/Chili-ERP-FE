<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useCustomersStore } from '@/stores/catalogs/customers.store'
import { useOrderTypeAssignmentSchedulesStore } from '@/stores/catalogs/order_type_assignment_schedules.store'
import { useOrderTypeAssignmentsStore } from '@/stores/catalogs/order_type_assignments.store'
import { useOrderTypesStore } from '@/stores/catalogs/order_types.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()

const store = useOrderTypeAssignmentsStore()
const schedulesStore = useOrderTypeAssignmentSchedulesStore()
const customersStore = useCustomersStore()
const orderTypesStore = useOrderTypesStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.items

  return store.items.filter(i => {
    const cliente = (i.cliente?.nombre ?? '').toLowerCase()
    const tipo = (i.tipo_pedido?.nombre ?? '').toLowerCase()
    return cliente.includes(query) || tipo.includes(query)
  })
})

const headers = [
  { title: 'Sucursal', key: 'cliente' },
  { title: 'Tipo de Pedido', key: 'tipo_pedido' },
  { title: 'Horario', key: 'usar_horario_default' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await Promise.all([
    store.fetchItems(),
    customersStore.fetchCustomers(),
    orderTypesStore.fetchOrderTypes(),
  ])
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar asignación?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteItem(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-git-merge" />
          <h4 class="text-h5 mb-0">Asignaciones</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Configura qué tipos de pedido puede usar cada sucursal.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar asignación..."
          density="compact"
          style="min-width: 300px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn
          variant="tonal"
          :loading="store.loading"
          :disabled="store.loading"
          @click="store.fetchItems()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="store.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nueva asignación
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
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-building-store" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.cliente?.nombre ?? '—' }}</span>
        </div>
      </template>

      <template #item.tipo_pedido="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-clipboard-list" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.tipo_pedido?.nombre ?? '—' }}</span>
        </div>
      </template>

      <template #item.usar_horario_default="{ item }">
        <VChip
          size="small"
          :color="item.usar_horario_default ? 'primary' : 'warning'"
          variant="tonal"
        >
          <VIcon
            :icon="item.usar_horario_default ? 'tabler-clock' : 'tabler-adjustments'"
            size="16"
            class="me-1"
          />
          {{ item.usar_horario_default ? 'Default' : 'Personalizado' }}
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
          <VTooltip
            v-if="!item.usar_horario_default"
            text="Horarios personalizados"
            location="top"
          >
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="schedulesStore.openManager(item)">
                <VIcon icon="tabler-clock-cog" class="text-primary" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Editar asignación" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar asignación" location="top">
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
          <div>No hay asignaciones para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <OrderTypeAssignmentDialog />
    <OrderTypeAssignmentDrawer />
    <OrderTypeAssignmentSchedulesDialog />
  </VCard>
</template>

<script lang="ts">
import OrderTypeAssignmentSchedulesDialog from '@/views/catalogs/order_type_assignment_schedules/OrderTypeAssignmentScheduleDialog.vue'
import OrderTypeAssignmentDialog from '@/views/catalogs/order_type_assignments/OrderTypeAssignmentDialog.vue'
import OrderTypeAssignmentDrawer from '@/views/catalogs/order_type_assignments/OrderTypeAssignmentDrawer.vue'
export default {}
</script>
