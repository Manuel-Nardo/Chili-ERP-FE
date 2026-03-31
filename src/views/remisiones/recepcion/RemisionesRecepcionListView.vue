<script setup lang="ts">
import { useRemisionesRecepcionStore } from '@/stores/remisiones/remisiones-recepcion.store'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = useRemisionesRecepcionStore()
const router = useRouter()

const rows = computed(() => store.items)

const goDetail = (id: number) => {
  router.push(`/remisiones/recepcion/${id}`)
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value || 0)
}

const clearFilters = async () => {
  store.filters.search = ''
  store.filters.estatus = ''
  store.filters.fecha_desde = ''
  store.filters.fecha_hasta = ''
  store.filters.sucursal_destino_id = null
  store.filters.solo_pendientes = true

  await store.fetchListado(1)
}

onMounted(async () => {
  store.resetCurrent()
  await store.fetchListado()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="mb-4">
        <VCardText>
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
            <div>
              <div class="text-h5 font-weight-bold">
                Recepción de remisiones
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Consulta remisiones pendientes y confirma la recepción de mercancía.
              </div>
            </div>

            <VChip color="primary" variant="tonal">
              {{ store.total }} remisión(es)
            </VChip>
          </div>

          <VRow>
            <VCol cols="12" md="3">
              <AppTextField
                v-model="store.filters.search"
                label="Buscar"
                placeholder="Folio, pedido, sucursal..."
                clearable
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppSelect
                v-model="store.filters.estatus"
                :items="store.estatusOptions"
                item-title="title"
                item-value="value"
                label="Estatus"
                clearable
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppTextField
                v-model="store.filters.fecha_desde"
                label="Fecha desde"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="2">
              <AppTextField
                v-model="store.filters.fecha_hasta"
                label="Fecha hasta"
                type="date"
              />
            </VCol>

            <VCol cols="12" md="2" class="d-flex align-center">
              <VCheckbox
                v-model="store.filters.solo_pendientes"
                label="Sólo pendientes"
                hide-details
              />
            </VCol>

            <VCol cols="12" md="1" class="d-flex align-center justify-end gap-2">
              <VBtn
                color="secondary"
                variant="tonal"
                @click="clearFilters"
              >
                Limpiar
              </VBtn>

              <VBtn
                color="primary"
                :loading="store.loading"
                @click="store.fetchListado(1)"
              >
                Buscar
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText v-if="store.loading" class="py-8">
          <div class="text-center text-medium-emphasis">
            Cargando remisiones...
          </div>
        </VCardText>

        <VCardText v-else-if="rows.length === 0" class="py-8">
          <div class="text-center text-medium-emphasis">
            No se encontraron remisiones para recepción.
          </div>
        </VCardText>

        <VCardText v-else>
          <div class="d-flex flex-column gap-4">
            <VCard
              v-for="row in rows"
              :key="row.id"
              variant="outlined"
            >
              <VCardText>
                <div class="d-flex flex-wrap justify-space-between align-start gap-3 mb-3">
                  <div class="d-flex flex-wrap gap-2">
                    <VChip color="primary" size="small" variant="tonal">
                      Remisión #{{ row.folio }}
                    </VChip>

                    <VChip size="small" variant="outlined">
                      Pedido #{{ row.pedido?.folio || row.pedido_erp_id }}
                    </VChip>

                    <VChip size="small" variant="outlined">
                      {{ row.estatus }}
                    </VChip>
                  </div>

                  <VBtn
                    color="primary"
                    @click="goDetail(row.id)"
                  >
                    Recibir
                  </VBtn>
                </div>

                <VRow>
                  <VCol cols="12" md="3">
                    <div class="text-caption text-medium-emphasis">Origen</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ row.sucursal_origen?.nombre || '-' }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="3">
                    <div class="text-caption text-medium-emphasis">Destino</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ row.sucursal_destino?.nombre || '-' }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="2">
                    <div class="text-caption text-medium-emphasis">Fecha remisión</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ row.fecha_remision || '-' }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="2">
                    <div class="text-caption text-medium-emphasis">Partidas</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ row.detalles_count || 0 }}
                    </div>
                  </VCol>

                  <VCol cols="12" md="2">
                    <div class="text-caption text-medium-emphasis">Total</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ formatMoney(row.total) }}
                    </div>
                  </VCol>
                </VRow>

                <div
                  v-if="row.observaciones"
                  class="mt-3 text-body-2 text-medium-emphasis"
                >
                  {{ row.observaciones }}
                </div>
              </VCardText>
            </VCard>
          </div>

          <div class="d-flex justify-end mt-6">
            <VPagination
              v-model="store.page"
              :length="store.lastPage"
              :total-visible="7"
              @update:model-value="store.fetchListado"
            />
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
