<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import { computed, ref } from 'vue'

const store = usePedidoSugerenciasStore()
const showFilters = ref(true)

const clienteLabel = computed(() => {
  const found = store.clientes.find(item => item.value === store.filtersClienteId)
  return found?.title ?? store.filtersClienteId
})

const tipoPedidoLabel = computed(() => {
  const found = store.tiposPedido.find(item => item.value === store.filtersTipoPedidoId)
  return found?.title ?? store.filtersTipoPedidoId
})

const estatusLabel = computed(() => {
  const found = store.estatusOptions.find(item => item.value === store.filtersEstatus)
  return found?.title ?? store.filtersEstatus
})

const origenLabel = computed(() => {
  const found = store.origenOptions.find(item => item.value === store.filtersOrigen)
  return found?.title ?? store.filtersOrigen
})

const activeFilters = computed(() => {
  const chips: string[] = []

  if (store.filtersClienteId) chips.push(`Sucursal: ${clienteLabel.value}`)
  if (store.filtersTipoPedidoId) chips.push(`Tipo: ${tipoPedidoLabel.value}`)
  if (store.filtersEstatus) chips.push(`Estatus: ${estatusLabel.value}`)
  if (store.filtersOrigen) chips.push(`Origen: ${origenLabel.value}`)
  if (store.filtersFechaDesde) chips.push(`Desde: ${store.filtersFechaDesde}`)
  if (store.filtersFechaHasta) chips.push(`Hasta: ${store.filtersFechaHasta}`)
  if (store.q) chips.push(`Buscar: ${store.q}`)

  return chips
})
</script>

<template>
  <VCard class="filters-card mb-4">
    <VCardText class="pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
        <div class="d-flex align-center gap-2 flex-wrap">
          <VChip
            color="primary"
            variant="tonal"
            size="small"
          >
            <VIcon icon="tabler-filter" start />
            Filtros
          </VChip>

          <VChip
            v-for="(chip, index) in activeFilters"
            :key="index"
            size="small"
            color="info"
            variant="tonal"
          >
            {{ chip }}
          </VChip>

          <VChip
            v-if="!activeFilters.length"
            size="small"
            variant="outlined"
            color="secondary"
          >
            Sin filtros activos
          </VChip>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <VBtn
            size="small"
            color="primary"
            :loading="store.loading"
            @click="store.fetchItems(1)"
          >
            <VIcon icon="tabler-search" class="me-1" />
            Buscar
          </VBtn>

          <VBtn
            size="small"
            variant="tonal"
            color="secondary"
            :disabled="store.loading"
            @click="store.clearFilters()"
          >
            <VIcon icon="tabler-eraser" class="me-1" />
            Limpiar
          </VBtn>

          <VBtn
            size="small"
            variant="text"
            color="secondary"
            @click="showFilters = !showFilters"
          >
            <VIcon
              :icon="showFilters ? 'tabler-chevron-up' : 'tabler-chevron-down'"
              class="me-1"
            />
            {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
          </VBtn>
        </div>
      </div>

      <VExpandTransition>
        <div v-show="showFilters">
          <VRow>
            <VCol cols="12" md="3">
              <AppSelect
                v-model="store.filtersClienteId"
                :items="store.clientes"
                item-title="title"
                item-value="value"
                label="Sucursal / Cliente"
                clearable
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppSelect
                v-model="store.filtersTipoPedidoId"
                :items="store.tiposPedido"
                item-title="title"
                item-value="value"
                label="Tipo de pedido"
                clearable
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppSelect
                v-model="store.filtersEstatus"
                :items="store.estatusOptions"
                item-title="title"
                item-value="value"
                label="Estatus"
                clearable
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppSelect
                v-model="store.filtersOrigen"
                :items="store.origenOptions"
                item-title="title"
                item-value="value"
                label="Origen"
                clearable
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppTextField
                v-model="store.q"
                label="Buscar"
                placeholder="ID, sucursal, modelo..."
                prepend-inner-icon="tabler-search"
                clearable
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppDateTimePicker
                v-model="store.filtersFechaDesde"
                label="Fecha desde"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppDateTimePicker
                v-model="store.filtersFechaHasta"
                label="Fecha hasta"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>
          </VRow>
        </div>
      </VExpandTransition>
    </VCardText>
  </VCard>
</template>

<style scoped>
.filters-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-surface), 1) 28%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}
</style>
