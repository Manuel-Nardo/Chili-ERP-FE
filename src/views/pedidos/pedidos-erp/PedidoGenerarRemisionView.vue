<script setup lang="ts">
import { usePedidoRemisionStore } from '@/stores/pedidos/pedido-remision.store'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = usePedidoRemisionStore()
const route = useRoute()
const router = useRouter()

const pedidoId = computed(() => Number(route.params.id))

onMounted(async () => {
  if (pedidoId.value) {
    await store.fetchRemisionable(pedidoId.value)
  }
})

onUnmounted(() => {
  store.reset()
})

const currency = (value?: number | string | null) => {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num)
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const raw = String(value).trim().slice(0, 10)
  const parts = raw.split('-')
  if (parts.length !== 3) return raw
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

const goBack = () => {
  router.push(`/pedidos/pedidos-erp/${pedidoId.value}`)
}

const submit = async () => {
  const remision = await store.generarRemision(pedidoId.value)
  if (remision?.id) {
    router.push(`/remisiones/remisiones-erp/${remision.id}`)
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex justify-space-between align-center">
          <div>
            <h2 class="text-h5 mb-1">Generar remisión</h2>
            <div class="text-body-2 text-medium-emphasis">
              Captura las cantidades a remisionar para este pedido ERP.
            </div>
          </div>

          <VBtn variant="outlined" @click="goBack">
            Volver
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" md="3">
              <div class="text-caption text-medium-emphasis">Pedido</div>
              <div class="text-body-1 font-weight-medium">
                {{ store.pedido?.serie_sucursal?.serie || 'S/N' }} - {{ store.pedido?.folio || '-' }}
              </div>
            </VCol>

            <VCol cols="12" md="3">
              <div class="text-caption text-medium-emphasis">Fecha pedido</div>
              <div class="text-body-1 font-weight-medium">
                {{ formatDate(store.pedido?.fecha_pedido) }}
              </div>
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.fechaRemision"
                label="Fecha remisión"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.fechaObjetivo"
                label="Fecha objetivo"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="12">
              <AppTextField
                v-model="store.observaciones"
                label="Observaciones"
                placeholder="Observaciones de la remisión"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText class="text-subtitle-1 font-weight-medium">
          Partidas remisionables
        </VCardText>

        <VDivider />

        <VTable>
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Pedida</th>
              <th class="text-right">Remisionada</th>
              <th class="text-right">Pendiente</th>
              <th class="text-right">Precio unitario</th>
              <th style="width: 180px;">Cantidad a remisionar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.detalles" :key="item.pedido_det_erp_id">
              <td>
                <div class="font-weight-medium">
                  {{ item.producto?.nombre || '-' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.producto?.clave || '' }}
                </div>
              </td>

              <td class="text-right">{{ item.cantidad_pedida }}</td>
              <td class="text-right">{{ item.cantidad_remisionada }}</td>
              <td class="text-right">{{ item.cantidad_pendiente }}</td>
              <td class="text-right">{{ currency(item.precio_unitario) }}</td>

              <td>
                <AppTextField
                  v-model="item.cantidad_a_remisionar"
                  type="number"
                  min="0"
                  :max="item.cantidad_pendiente"
                />
              </td>
            </tr>
          </tbody>
        </VTable>

        <VDivider />

        <VCardText class="d-flex justify-end gap-2">
          <VBtn variant="outlined" @click="goBack">
            Cancelar
          </VBtn>

          <VBtn :loading="store.saving" @click="submit">
            Generar remisión
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
