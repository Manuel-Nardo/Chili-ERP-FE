<script setup lang="ts">
import { usePedidosErpStore } from '@/stores/pedidos/pedidos-erp.store'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = usePedidosErpStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchItems(1)
})

const currency = (value?: number | string | null) => {
  const num = Number(value ?? 0)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num)
}

/**
 * Formatea fechas de negocio sin convertir zona horaria.
 * Ejemplos soportados:
 * - 2026-03-26
 * - 2026-03-26T00:00:00.000000Z
 */
const formatDate = (value?: string | null) => {
  if (!value) return '-'

  const raw = String(value).trim()
  const datePart = raw.slice(0, 10)
  const parts = datePart.split('-')

  if (parts.length !== 3) return raw

  const [year, month, day] = parts

  if (!year || !month || !day) return raw

  return `${day}/${month}/${year}`
}

const goDetail = (id: number) => {
  router.push(`/pedidos/pedidos-erp/${id}`)
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex justify-space-between align-center flex-wrap gap-4">
          <div>
            <h2 class="text-h4 mb-1">
              Pedidos ERP
            </h2>

            <div class="text-body-2 text-medium-emphasis">
              Listado de pedidos generados desde sugerencias.
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.q"
                label="Buscar"
                placeholder="ID, folio, destino, tipo pedido..."
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.filtersFechaDesde"
                label="Fecha desde"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.filtersFechaHasta"
                label="Fecha hasta"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="3" class="d-flex align-end gap-2">
              <VBtn @click="store.applyFilters">
                Buscar
              </VBtn>

              <VBtn
                variant="outlined"
                color="secondary"
                @click="store.clearFilters"
              >
                Limpiar
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VDataTableServer
          v-model:page="store.currentPage"
          v-model:items-per-page="store.perPage"
          :items="store.items"
          :headers="store.headers"
          :items-length="store.total"
          :loading="store.loading"
          @update:page="store.handlePageChange"
          @update:items-per-page="store.handlePerPageChange"
        >
          <template #item.folio_display="{ item }">
            {{ item.serie_sucursal?.serie || 'S/N' }} - {{ item.folio }}
          </template>

          <template #item.tipo_pedido="{ item }">
            {{ item.tipo_pedido?.nombre || '-' }}
          </template>

          <template #item.fecha_pedido="{ item }">
            {{ formatDate(item.fecha_pedido) }}
          </template>

          <template #item.fecha_objetivo="{ item }">
            {{ formatDate(item.fecha_objetivo) }}
          </template>

          <template #item.sucursal_destino="{ item }">
            {{ item.sucursal_destino?.nombre || '-' }}
          </template>

          <template #item.estatus="{ item }">
            <VChip size="small" color="primary" variant="tonal">
              {{ item.estatus }}
            </VChip>
          </template>

          <template #item.total="{ item }">
            <div class="text-right">
              {{ currency(item.total) }}
            </div>
          </template>

          <template #item.actions="{ item }">
            <VBtn
              size="small"
              variant="text"
              color="primary"
              @click="goDetail(item.id)"
            >
              Ver
            </VBtn>
          </template>
        </VDataTableServer>
      </VCard>
    </VCol>
  </VRow>
</template>
