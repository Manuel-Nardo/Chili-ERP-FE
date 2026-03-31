<script setup lang="ts">
import { useRemisionesErpStore } from '@/stores/remisiones/remisiones-erp.store'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = useRemisionesErpStore()
const router = useRouter()

const goDetail = (id: number) => {
  router.push(`/remisiones/remisiones-erp/${id}`)
}

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

const totalMonto = computed(() => {
  return store.items.reduce((acc, item) => acc + Number(item.total ?? 0), 0)
})

const totalRegistros = computed(() => store.total || store.items.length)

onMounted(async () => {
  await store.fetchList()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="mb-6">
        <VCardText class="d-flex flex-wrap align-center justify-space-between gap-4 py-5">
          <div>
            <div class="text-h5 font-weight-bold">
              Remisiones ERP
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Consulta, filtra y revisa las remisiones generadas en ERP.
            </div>
          </div>

          <div class="d-flex flex-wrap gap-3">
            <VChip color="primary" variant="tonal" size="large">
              Registros: {{ totalRegistros }}
            </VChip>

            <VChip color="success" variant="tonal" size="large">
              Monto visible: {{ formatCurrency(totalMonto) }}
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard class="mb-6">
        <VCardText>
          <div class="text-subtitle-1 font-weight-medium mb-4">
            Filtros
          </div>

          <VRow>
            <VCol cols="12" md="4">
              <AppTextField
                v-model="store.filters.search"
                label="Buscar"
                placeholder="Folio, pedido u observaciones"
                prepend-inner-icon="tabler-search"
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

            <VCol cols="12" md="2">
              <AppTextField
                v-model="store.filters.estatus"
                label="Estatus"
                placeholder="GENERADA"
              />
            </VCol>

            <VCol cols="12" md="2" class="d-flex align-end gap-2">
              <VBtn
                color="primary"
                prepend-icon="tabler-search"
                @click="store.page = 1; store.fetchList()"
              >
                Buscar
              </VBtn>

              <VBtn
                variant="tonal"
                color="secondary"
                prepend-icon="tabler-refresh"
                @click="store.resetFilters()"
              >
                Limpiar
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText class="pb-2">
          <div class="text-subtitle-1 font-weight-medium">
            Listado
          </div>
        </VCardText>

        <VDivider />

        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th class="font-weight-bold">
                ID
              </th>
              <th class="font-weight-bold">
                Folio
              </th>
              <th class="font-weight-bold">
                Pedido
              </th>
              <th class="font-weight-bold">
                Fecha remisión
              </th>
              <th class="font-weight-bold">
                Estatus
              </th>
              <th class="font-weight-bold text-right">
                Total
              </th>
              <th class="font-weight-bold text-center">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="store.loading">
              <td colspan="7" class="text-center py-8">
                Cargando remisiones...
              </td>
            </tr>

            <tr v-else-if="!store.items.length">
              <td colspan="7" class="text-center py-8 text-medium-emphasis">
                No se encontraron remisiones con los filtros actuales.
              </td>
            </tr>

            <tr
              v-for="item in store.items"
              :key="item.id"
            >
              <td>#{{ item.id }}</td>
              <td class="font-weight-medium">
                {{ item.folio ?? '-' }}
              </td>
              <td class="font-weight-medium">
                {{
                  item.pedido?.folio
                    ? `Pedido #${item.pedido.folio}`
                    : item.pedido_id
                      ? `ID ${item.pedido_id}`
                      : '-'
                }}
              </td>
              <td>
                {{ formatDate(item.fecha_remision) }}
              </td>
              <td>
                <VChip
                  size="small"
                  :color="getStatusColor(item.estatus)"
                  variant="tonal"
                >
                  {{ item.estatus ?? '-' }}
                </VChip>
              </td>
              <td class="text-right font-weight-medium">
                {{ formatCurrency(item.total) }}
              </td>
              <td class="text-center">
                <VBtn
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-eye"
                  @click="goDetail(item.id)"
                >
                  Ver detalle
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <VDivider />

        <VCardText class="d-flex justify-space-between align-center flex-wrap gap-3">
          <div class="text-body-2 text-medium-emphasis">
            Página {{ store.page }} de {{ store.lastPage }}
          </div>

          <VPagination
            v-model="store.page"
            :length="store.lastPage"
            total-visible="7"
            @update:model-value="store.fetchList()"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
