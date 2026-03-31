<script setup lang="ts">
import { useRemisionesRecepcionStore } from '@/stores/remisiones/remisiones-recepcion.store'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = useRemisionesRecepcionStore()
const route = useRoute()
const router = useRouter()

const remisionId = computed(() => Number(route.params.id))
const current = computed(() => store.current)
const detalles = computed(() => store.form.detalles)

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value || 0)
}

const backToList = () => {
  router.push('/remisiones/recepcion')
}

const confirmarRecepcion = async () => {
  await store.recibir()
  await store.fetchOne(remisionId.value)
}

onMounted(async () => {
  store.resetCurrent()
  await store.fetchOne(remisionId.value)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
        <div>
          <div class="text-h5 font-weight-bold">
            Recepción de remisión
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Captura cantidades recibidas y confirma la recepción.
          </div>
        </div>

        <div class="d-flex gap-2">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="backToList"
          >
            Volver
          </VBtn>

          <VBtn
            color="success"
            variant="tonal"
            :disabled="detalles.length === 0"
            @click="store.marcarTodoRecibido"
          >
            Marcar todo recibido
          </VBtn>

          <VBtn
            color="primary"
            :loading="store.saving"
            :disabled="!store.canSubmit"
            @click="confirmarRecepcion"
          >
            Confirmar recepción
          </VBtn>
        </div>
      </div>
    </VCol>

    <VCol v-if="store.loadingOne" cols="12">
      <VCard>
        <VCardText class="py-8 text-center text-medium-emphasis">
          Cargando detalle de remisión...
        </VCardText>
      </VCard>
    </VCol>

    <template v-else-if="current">
      <VCol cols="12">
        <VCard class="mb-4">
          <VCardText>
            <div class="d-flex flex-wrap gap-2 mb-4">
              <VChip color="primary" variant="tonal">
                Remisión #{{ current.folio }}
              </VChip>

              <VChip variant="outlined">
                Pedido #{{ current.pedido?.folio || current.pedido_erp_id }}
              </VChip>

              <VChip variant="outlined">
                {{ current.estatus }}
              </VChip>

              <VChip variant="outlined">
                {{ current.fecha_remision || '-' }}
              </VChip>
            </div>

            <VRow>
              <VCol cols="12" md="3">
                <div class="text-caption text-medium-emphasis">Sucursal origen</div>
                <div class="text-body-2 font-weight-medium">
                  {{ current.sucursal_origen?.nombre || '-' }}
                </div>
              </VCol>

              <VCol cols="12" md="3">
                <div class="text-caption text-medium-emphasis">Sucursal destino</div>
                <div class="text-body-2 font-weight-medium">
                  {{ current.sucursal_destino?.nombre || '-' }}
                </div>
              </VCol>

              <VCol cols="12" md="2">
                <div class="text-caption text-medium-emphasis">Fecha recepción</div>
                <AppTextField
                  v-model="store.form.fecha_recepcion"
                  type="date"
                  density="compact"
                />
              </VCol>

              <VCol cols="12" md="4">
                <div class="text-caption text-medium-emphasis">Observaciones recepción</div>
                <AppTextField
                  v-model="store.form.observaciones_recepcion"
                  placeholder="Observación general"
                  density="compact"
                />
              </VCol>
            </VRow>

            <VRow class="mt-2">
              <VCol cols="12" md="4">
                <VAlert color="success" variant="tonal">
                  Completos: {{ store.resumen.completos }}
                </VAlert>
              </VCol>

              <VCol cols="12" md="4">
                <VAlert color="warning" variant="tonal">
                  Parciales: {{ store.resumen.parciales }}
                </VAlert>
              </VCol>

              <VCol cols="12" md="4">
                <VAlert color="error" variant="tonal">
                  No recibidos: {{ store.resumen.noRecibidos }}
                </VAlert>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard>
          <VCardText class="pa-0">
            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th class="text-left">Producto</th>
                  <th class="text-left">Enviado</th>
                  <th class="text-left">Recibido</th>
                  <th class="text-left">Diferencia</th>
                  <th class="text-left">Estatus</th>
                  <th class="text-left">Observación</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="detalle in detalles"
                  :key="detalle.id"
                >
                  <td style="min-width: 280px;">
                    <div class="font-weight-medium">
                      {{ detalle.producto?.nombre || `Producto #${detalle.articulo_id}` }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ detalle.producto?.clave || 'Sin clave' }}
                    </div>
                  </td>

                  <td>{{ detalle.cantidad }}</td>

                  <td style="min-width: 140px;">
                    <AppTextField
                      :model-value="detalle.cantidad_recibida"
                      type="number"
                      min="0"
                      :max="detalle.cantidad"
                      density="compact"
                      @update:model-value="store.setDetalleCantidad(detalle.id, $event)"
                    />
                  </td>

                  <td>
                    <VChip
                      size="small"
                      :color="detalle.diferencia > 0 ? 'warning' : 'success'"
                      variant="tonal"
                    >
                      {{ detalle.diferencia }}
                    </VChip>
                  </td>

                  <td>
                    <VChip
                      size="small"
                      :color="detalle.estatus === 'RECIBIDO'
                        ? 'success'
                        : detalle.estatus === 'RECIBIDO_PARCIAL'
                          ? 'warning'
                          : 'error'"
                      variant="tonal"
                    >
                      {{ detalle.estatus }}
                    </VChip>
                  </td>

                  <td style="min-width: 240px;">
                    <AppTextField
                      v-model="detalle.observaciones_recepcion"
                      placeholder="Observación del renglón"
                      density="compact"
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex justify-end">
            <VBtn
              color="primary"
              :loading="store.saving"
              :disabled="!store.canSubmit"
              @click="confirmarRecepcion"
            >
              Confirmar recepción
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard>
          <VCardText>
            <div class="text-subtitle-1 font-weight-medium mb-3">
              Resumen económico
            </div>

            <VRow>
              <VCol cols="12" md="4">
                <div class="text-caption text-medium-emphasis">Subtotal</div>
                <div class="text-body-1 font-weight-medium">
                  {{ formatMoney(current.subtotal) }}
                </div>
              </VCol>

              <VCol cols="12" md="4">
                <div class="text-caption text-medium-emphasis">Impuestos</div>
                <div class="text-body-1 font-weight-medium">
                  {{ formatMoney(current.impuestos) }}
                </div>
              </VCol>

              <VCol cols="12" md="4">
                <div class="text-caption text-medium-emphasis">Total</div>
                <div class="text-body-1 font-weight-bold">
                  {{ formatMoney(current.total) }}
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </template>
  </VRow>
</template>
