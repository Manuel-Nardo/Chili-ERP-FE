<script setup lang="ts">
import { usePedidosErpStore } from '@/stores/pedidos/pedidos-erp.store'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = usePedidosErpStore()
const route = useRoute()
const router = useRouter()

const pedidoId = computed(() => Number(route.params.id))

// Información general abierta, detalle cerrado
const infoPanel = ref([0])
const detailPanel = ref([])

onMounted(async () => {
  if (!pedidoId.value) return
  await store.fetchOne(pedidoId.value)
})

onBeforeUnmount(() => {
  store.reset()
})

const pedido = computed(() => store.pedido)

const currency = (value?: number | string | null) => {
  const num = Number(value ?? 0)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num)
}

const percent = (value?: number | string | null) => {
  const num = Number(value ?? 0) * 100
  return `${num.toFixed(2)}%`
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
  router.push('/pedidos/pedidos-erp')
}

const goGenerarRemision = () => {
  router.push(`/pedidos/pedidos-erp/${pedidoId.value}/generar-remision`)
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="border-sm">
        <VCardText class="py-3 px-4 detail-header-bg">
          <div class="d-flex justify-space-between align-start flex-wrap gap-3">
            <div class="d-flex align-start gap-2">
              <VBtn
                icon
                size="small"
                variant="text"
                @click="goBack"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>

              <div>
                <div class="d-flex align-center gap-2 flex-wrap mb-1">
                  <h2 class="text-h6 mb-0">
                    Pedido ERP
                    <span v-if="pedido">#{{ pedido.id }}</span>
                  </h2>

                  <VChip
                    v-if="pedido?.estatus"
                    color="primary"
                    size="small"
                    variant="flat"
                  >
                    {{ pedido.estatus }}
                  </VChip>

                  <VChip
                    v-if="pedido"
                    color="info"
                    size="small"
                    variant="tonal"
                  >
                    {{ pedido.serie_sucursal?.serie || 'S/N' }} - {{ pedido.folio }}
                  </VChip>

                  <VChip
                    v-if="pedido?.detalles?.length"
                    color="secondary"
                    size="small"
                    variant="tonal"
                  >
                    {{ pedido.detalles.length }} partidas
                  </VChip>
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  Consulta del pedido ERP y sus partidas registradas.
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <VBtn
                variant="outlined"
                color="secondary"
                size="small"
                @click="goBack"
              >
                Volver
              </VBtn>

              <VBtn
                color="primary"
                size="small"
                :disabled="store.loadingOne || !pedido"
                @click="goGenerarRemision"
              >
                Generar remisión
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      v-if="store.loadingOne"
      cols="12"
    >
      <VCard>
        <VCardText class="py-6 text-center">
          Cargando pedido...
        </VCardText>
      </VCard>
    </VCol>

    <template v-else-if="pedido">
      <VCol cols="12" md="9">
        <VExpansionPanels
          v-model="infoPanel"
          multiple
        >
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <div class="d-flex align-center justify-space-between w-100 pr-4">
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-file-description" size="18" />
                  <span class="font-weight-medium">Información general</span>
                </div>

                <VChip
                  size="small"
                  variant="tonal"
                  color="info"
                >
                  {{ pedido.serie_sucursal?.serie || 'S/N' }} - {{ pedido.folio }}
                </VChip>
              </div>
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VRow class="compact-row">
                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>ID pedido</span>
                    <strong>#{{ pedido.id }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Tipo pedido</span>
                    <strong>{{ pedido.tipo_pedido?.nombre || '-' }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Sucursal destino</span>
                    <strong>{{ pedido.sucursal_destino?.nombre || '-' }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Origen</span>
                    <strong>{{ pedido.origen_tipo || '-' }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Fecha pedido</span>
                    <strong>{{ formatDate(pedido.fecha_pedido) }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Fecha objetivo</span>
                    <strong>{{ formatDate(pedido.fecha_objetivo) }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Sugerencia origen</span>
                    <strong>{{ pedido.pedido_sugerencia_id || '-' }}</strong>
                  </div>
                </VCol>

                <VCol cols="6" md="3">
                  <div class="info-inline">
                    <span>Creado por</span>
                    <strong>{{ pedido.creado_por || '-' }}</strong>
                  </div>
                </VCol>

                <VCol cols="12">
                  <div class="info-inline">
                    <span>Observaciones</span>
                    <strong>{{ pedido.observaciones || '-' }}</strong>
                  </div>
                </VCol>
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCol>

      <VCol cols="12" md="3">
        <VCard>
          <VCardText class="py-3 px-4">
            <div class="text-subtitle-2 font-weight-medium mb-3">
              Resumen
            </div>

            <div class="summary-row">
              <span>Subtotal</span>
              <strong>{{ currency(pedido.subtotal) }}</strong>
            </div>

            <div class="summary-row">
              <span>Impuestos</span>
              <strong>{{ currency(pedido.impuestos) }}</strong>
            </div>

            <VDivider class="my-2" />

            <div class="summary-row total-row">
              <span>Total</span>
              <strong>{{ currency(pedido.total) }}</strong>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VExpansionPanels
          v-model="detailPanel"
          multiple
        >
          <VExpansionPanel>
            <VExpansionPanelTitle>
              <div class="d-flex align-center justify-space-between w-100 pr-4">
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-list-details" size="18" />
                  <span class="font-weight-medium">Detalle del pedido</span>
                </div>

                <VChip
                  color="secondary"
                  size="small"
                  variant="tonal"
                >
                  {{ pedido.detalles?.length || 0 }} partidas
                </VChip>
              </div>
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <div class="table-responsive">
                <VTable density="compact">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CLAVE</th>
                      <th>PRODUCTO</th>
                      <th class="text-right">CANTIDAD</th>
                      <th class="text-right">P. UNITARIO</th>
                      <th class="text-right">IMPORTE</th>
                      <th class="text-right">IVA</th>
                      <th class="text-right">IMPUESTO IVA</th>
                      <th class="text-right">TOTAL</th>
                      <th>OBSERVACIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="item in pedido.detalles"
                      :key="item.id"
                    >
                      <td>{{ item.id }}</td>
                      <td>{{ item.producto?.clave || item.articulo_id }}</td>
                      <td>{{ item.producto?.nombre || '-' }}</td>
                      <td class="text-right">{{ item.cantidad }}</td>
                      <td class="text-right">{{ currency(item.precio_unitario) }}</td>
                      <td class="text-right">{{ currency(item.importe) }}</td>
                      <td class="text-right">{{ percent(item.iva) }}</td>
                      <td class="text-right">{{ currency(item.impuesto_iva) }}</td>
                      <td class="text-right font-weight-medium">{{ currency(item.total) }}</td>
                      <td>{{ item.observaciones || '-' }}</td>
                    </tr>

                    <tr v-if="!pedido.detalles?.length">
                      <td
                        colspan="10"
                        class="text-center py-4"
                      >
                        Sin partidas.
                      </td>
                    </tr>
                  </tbody>
                </VTable>
              </div>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCol>
    </template>
  </VRow>
</template>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

.detail-header-bg {
  background: rgba(var(--v-theme-primary), 0.05);
}

.compact-row {
  row-gap: 8px;
}

.info-inline {
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(var(--v-theme-on-surface), 0.025);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  min-height: 58px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-inline span {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.62);
  margin-bottom: 2px;
}

.info-inline strong {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
}

.summary-row span {
  font-size: 0.84rem;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.summary-row strong {
  font-size: 0.94rem;
  font-weight: 700;
}

.total-row strong {
  font-size: 1rem;
  color: rgb(var(--v-theme-primary));
}
</style>
