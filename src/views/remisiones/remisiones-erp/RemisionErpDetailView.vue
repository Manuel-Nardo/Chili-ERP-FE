<script setup lang="ts">
import { useRemisionesErpStore } from '@/stores/remisiones/remisiones-erp.store'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = useRemisionesErpStore()
const route = useRoute()
const router = useRouter()

const remisionId = computed(() => Number(route.params.id))
const showExtraInfo = ref(false)

const formatCurrency = (value?: number | string | null) => {
  const amount = Number(value ?? 0)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const getStatusColor = (status?: string | null) => {
  switch ((status ?? '').toUpperCase()) {
    case 'GENERADA':
      return 'primary'
    case 'CANCELADA':
      return 'error'
    case 'ENTREGADA':
      return 'success'
    default:
      return 'secondary'
  }
}

const getProductoNombre = (detalle: any) => {
  return detalle?.producto?.nombre
    ?? detalle?.articulo_nombre
    ?? `Artículo #${detalle?.articulo_id ?? '-'}`
}

const pedidoLabel = computed(() => {
  const item = store.currentItem

  if (!item) return '-'

  if (item.pedido?.folio)
    return `Pedido #${item.pedido.folio}`

  if (item.pedido_id)
    return `ID ${item.pedido_id}`

  return '-'
})

onMounted(async () => {
  if (!remisionId.value) return
  await store.fetchOne(remisionId.value)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
        <VBtn
          variant="text"
          color="primary"
          prepend-icon="tabler-arrow-left"
          @click="router.push('/remisiones/remisiones-erp')"
        >
          Volver
        </VBtn>

        <VBtn
          variant="tonal"
          color="secondary"
          :prepend-icon="showExtraInfo ? 'tabler-chevron-up' : 'tabler-chevron-down'"
          @click="showExtraInfo = !showExtraInfo"
        >
          {{ showExtraInfo ? 'Ocultar info' : 'Más info' }}
        </VBtn>
      </div>

      <VCard v-if="store.loadingOne">
        <VCardText class="py-10 text-center">
          Cargando remisión...
        </VCardText>
      </VCard>

      <VCard v-else-if="!store.currentItem">
        <VCardText class="py-10 text-center">
          No se encontró la remisión.
        </VCardText>
      </VCard>

      <template v-else>
        <VCard class="mb-4">
          <VCardText class="py-4">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
              <div>
                <div class="text-h5 font-weight-bold">
                  Remisión #{{ store.currentItem.folio ?? store.currentItem.id }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  ID interno: {{ store.currentItem.id }}
                </div>
              </div>

              <VChip
                size="large"
                :color="getStatusColor(store.currentItem.estatus)"
                variant="tonal"
              >
                {{ store.currentItem.estatus ?? '-' }}
              </VChip>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <VChip variant="tonal" color="info">
                {{ pedidoLabel }}
              </VChip>

              <VChip variant="tonal" color="secondary">
                Fecha remisión: {{ formatDate(store.currentItem.fecha_remision) }}
              </VChip>

              <VChip variant="tonal" color="secondary">
                Fecha objetivo: {{ formatDate(store.currentItem.fecha_objetivo) }}
              </VChip>

              <VChip variant="tonal" color="secondary">
                Subtotal: {{ formatCurrency(store.currentItem.subtotal) }}
              </VChip>

              <VChip variant="tonal" color="secondary">
                Impuestos: {{ formatCurrency(store.currentItem.impuestos) }}
              </VChip>

              <VChip variant="flat" color="primary">
                Total: {{ formatCurrency(store.currentItem.total) }}
              </VChip>
            </div>

            <VExpandTransition>
              <div v-show="showExtraInfo" class="mt-4 pt-4 border-t">
                <VRow>
                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Observaciones
                    </div>
                    <div class="text-body-2">
                      {{ store.currentItem.observaciones || 'Sin observaciones' }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Sucursal origen
                    </div>
                    <div class="text-body-2">
                      {{ store.currentItem.sucursal_origen_id ?? '-' }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Sucursal destino
                    </div>
                    <div class="text-body-2">
                      {{ store.currentItem.sucursal_destino_id ?? '-' }}
                    </div>
                  </VCol>
                </VRow>
              </div>
            </VExpandTransition>
          </VCardText>
        </VCard>

        <VCard>
          <VCardText class="pb-2">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Detalles de la remisión
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Productos incluidos en la remisión.
                </div>
              </div>

              <VChip color="primary" variant="tonal">
                {{ (store.currentItem.detalles || []).length }} productos
              </VChip>
            </div>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th class="font-weight-bold">Producto</th>
                <th class="font-weight-bold text-right">Cantidad</th>
                <th class="font-weight-bold text-right">Precio unitario</th>
                <th class="font-weight-bold text-right">Importe</th>
                <th class="font-weight-bold text-right">IVA</th>
                <th class="font-weight-bold text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="detalle in store.currentItem.detalles || []"
                :key="detalle.id ?? `${detalle.articulo_id}-${detalle.cantidad}`"
              >
                <td class="font-weight-medium">
                  {{ getProductoNombre(detalle) }}
                </td>
                <td class="text-right">
                  {{ detalle.cantidad }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(detalle.precio_unitario) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(detalle.importe) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(detalle.impuesto_iva) }}
                </td>
                <td class="text-right font-weight-bold">
                  {{ formatCurrency(detalle.total) }}
                </td>
              </tr>

              <tr v-if="!(store.currentItem.detalles || []).length">
                <td colspan="6" class="text-center py-8 text-medium-emphasis">
                  Esta remisión no tiene detalles registrados.
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </template>
    </VCol>
  </VRow>
</template>

<style scoped>
.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
