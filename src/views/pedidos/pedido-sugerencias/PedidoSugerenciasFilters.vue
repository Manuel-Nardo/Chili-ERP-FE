<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import { computed, ref } from 'vue'

const store = usePedidoSugerenciasStore()
const showFilters = ref(false)

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

  if (store.filtersClienteId) chips.push(`Cliente: ${clienteLabel.value}`)
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
  <VCard class="mb-4">
    <VCardText class="py-3">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex flex-wrap gap-2">
          <VChip
            v-for="(chip, index) in activeFilters"
            :key="index"
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ chip }}
          </VChip>

          <VChip
            v-if="!activeFilters.length"
            size="small"
            variant="outlined"
          >
            Sin filtros activos
          </VChip>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <VBtn size="small" color="primary" @click="store.fetchItems(1)">
            <VIcon icon="tabler-search" class="me-1" />
            Buscar
          </VBtn>

          <VBtn size="small" variant="tonal" color="secondary" @click="store.clearFilters()">
            <VIcon icon="tabler-eraser" class="me-1" />
            Limpiar
          </VBtn>

          <VBtn size="small" variant="text" color="secondary" @click="showFilters = !showFilters">
            <VIcon
              :icon="showFilters ? 'tabler-chevron-up' : 'tabler-filter'"
              class="me-1"
            />
            {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
          </VBtn>
        </div>
      </div>

      <VExpandTransition>
        <div v-show="showFilters" class="mt-4">
          <VRow>
            <VCol cols="12" md="3">
              <AppSelect
                v-model="store.filtersClienteId"
                :items="store.clientes"
                item-title="title"
                item-value="value"
                label="Cliente"
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
                placeholder="ID, cliente, modelo..."
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
