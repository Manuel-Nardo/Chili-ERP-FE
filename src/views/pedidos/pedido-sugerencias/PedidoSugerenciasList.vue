<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import PedidoSugerenciasFilters from '@/views/pedidos/pedido-sugerencias/PedidoSugerenciasFilters.vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = usePedidoSugerenciasStore()
const router = useRouter()

onMounted(async () => {
  await Promise.all([
    store.fetchClientes(),
    store.fetchTiposPedido(),
  ])

  await store.fetchItems()
})

const estatusColor = (estatus: string) => {
  switch (estatus) {
    case 'confirmado': return 'success'
    case 'cancelado': return 'error'
    case 'procesado': return 'info'
    default: return 'warning'
  }
}

const origenColor = (origen: string) => {
  switch (origen) {
    case 'forecast': return 'info'
    case 'manual': return 'secondary'
    default: return 'primary'
  }
}

const goNew = async () => {
  try {
    await router.push('/pedidos/pedido-sugerencias/nuevo')
  } catch (e) {
    console.error('[PedidoList] push error', e)
  }
}

const goEdit = (id: number) => router.push(`/pedidos/pedido-sugerencias/${id}`)
</script>

<template>
  <div>
    <PedidoSugerenciasFilters />

    <VCard>
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
        <div>
          <div class="d-flex align-center gap-2">
            <VIcon icon="tabler-bulb" />
            <h4 class="text-h5 mb-0">Pedido sugerido</h4>
          </div>

          <div class="text-body-2 text-medium-emphasis">
            Genera, ajusta y confirma sugerencias de pedido por cliente y tipo.
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 align-center">
          <VBtn
            variant="tonal"
            :loading="store.loading"
            :disabled="store.loading"
            @click="store.fetchItems(store.currentPage)"
          >
            <VIcon icon="tabler-refresh" class="me-1" />
            Refrescar
          </VBtn>

          <VBtn color="primary" @click="goNew">
            <VIcon icon="tabler-plus" class="me-1" />
            Nueva sugerencia
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <VDataTable
        :headers="store.headers"
        :items="store.items"
        :loading="store.loading"
        item-value="id"
        density="compact"
        class="text-no-wrap"
      >
        <template #item.id="{ item }">
          <span class="font-weight-medium">#{{ item.id }}</span>
        </template>

        <template #item.cliente="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.cliente?.nombre || '-' }}</span>
            <span class="text-caption text-medium-emphasis">ID {{ item.cliente_id }}</span>
          </div>
        </template>

        <template #item.tipo_pedido="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.tipo_pedido?.nombre || '-' }}</span>
            <span class="text-caption text-medium-emphasis">ID {{ item.tipo_pedido_id }}</span>
          </div>
        </template>

        <template #item.origen="{ item }">
          <VChip size="small" :color="origenColor(item.origen)" variant="tonal">
            {{ item.origen }}
          </VChip>
        </template>

        <template #item.modelo="{ item }">
          <span class="text-medium-emphasis">{{ item.modelo || '-' }}</span>
        </template>

        <template #item.estatus="{ item }">
          <VChip size="small" :color="estatusColor(item.estatus)" variant="tonal">
            {{ item.estatus }}
          </VChip>
        </template>

        <template #item.productos="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.detalles?.length ?? 0 }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <VTooltip text="Abrir workspace" location="top">
              <template #activator="{ props }">
                <IconBtn v-bind="props" @click="goEdit(item.id)">
                  <VIcon icon="tabler-edit" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'borrador'"
              text="Confirmar"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn v-bind="props" @click="store.confirmItem(item.id)">
                  <VIcon icon="tabler-circle-check" class="text-success" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'confirmado' && !item.pedido_erp_id"
              text="Generar pedido"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="store.generatingPedido"
                  @click="store.generarPedido(item.id)"
                >
                  <VProgressCircular
                    v-if="store.generatingPedido && store.generatingPedidoId === item.id"
                    indeterminate
                    size="18"
                    width="2"
                  />
                  <VIcon
                    v-else
                    icon="tabler-file-invoice"
                    class="text-primary"
                  />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus !== 'cancelado' && item.estatus !== 'procesado'"
              text="Cancelar"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn v-bind="props" @click="store.cancelItem(item.id)">
                  <VIcon icon="tabler-ban" class="text-warning" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'procesado' || item.pedido_erp_id"
              text="Pedido generado"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn v-bind="props" disabled>
                  <VIcon icon="tabler-circle-check-filled" class="text-info" />
                </IconBtn>
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-center text-medium-emphasis">
            <VIcon icon="tabler-package-off" class="mb-2" />
            <div>No hay sugerencias para mostrar.</div>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-4">
            <div class="text-body-2 text-medium-emphasis">
              Total: {{ store.total }}
            </div>

            <VPagination
              v-model="store.currentPage"
              :length="Math.max(1, Math.ceil(store.total / store.perPage))"
              @update:model-value="store.fetchItems"
            />
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
