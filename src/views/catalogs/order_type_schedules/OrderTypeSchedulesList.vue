<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useOrderTypeSchedulesStore } from '@/stores/catalogs/order_type_schedules.store'
import { useOrderTypesStore } from '@/stores/catalogs/order_types.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useOrderTypeSchedulesStore()
const orderTypesStore = useOrderTypesStore()

const q = ref('')

const dayLabel = (day: number) => {
  const days: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  }

  return days[day] ?? `Día ${day}`
}

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return store.items

  return store.items.filter(i => {
    const tipo = (i.tipoPedido?.nombre ?? '').toLowerCase()
    const dia = dayLabel(i.dia_semana).toLowerCase()

    return tipo.includes(query) || dia.includes(query)
  })
})

const headers = [
  { title: 'Tipo de Pedido', key: 'tipoPedido' },
  { title: 'Día', key: 'dia_semana' },
  { title: 'Horario', key: 'horario' },
  { title: 'Activo', key: 'activo', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await Promise.all([
    store.fetchItems(),
    orderTypesStore.fetchOrderTypes(),
  ])
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar horario default?',
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
          <VIcon icon="tabler-clock" />
          <h4 class="text-h5 mb-0">Horarios Default</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Define los días y horarios base para cada tipo de pedido.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar horario..."
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
          Nuevo horario
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
      <template #item.tipoPedido="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-clipboard-list" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.tipoPedido?.nombre ?? '—' }}</span>
        </div>
      </template>

      <template #item.dia_semana="{ item }">
        <VChip size="small" variant="tonal">
          {{ dayLabel(item.dia_semana) }}
        </VChip>
      </template>

      <template #item.horario="{ item }">
        <span class="text-body-2">
          {{ item.hora_inicio }} - {{ item.hora_fin }}
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
          <VTooltip text="Editar horario" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="store.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar horario" location="top">
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
          <div>No hay horarios default para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <OrderTypeScheduleDialog />
    <OrderTypeScheduleDrawer />
  </VCard>
</template>

<script lang="ts">
import OrderTypeScheduleDialog from '@/views/catalogs/order_type_schedules/OrderTypeScheduleDialog.vue'
import OrderTypeScheduleDrawer from '@/views/catalogs/order_type_schedules/OrderTypeScheduleDrawer.vue'
export default {}
</script>
