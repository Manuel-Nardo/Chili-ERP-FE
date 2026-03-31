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

const origenLabel = (origen: string) => {
  switch (origen) {
    case 'forecast': return 'Sugerido'
    case 'manual': return 'Manual'
    default: return origen
  }
}

const goNew = async () => {
  await store.openNewWorkspace()
}

const goEdit = async (id: number) => {
  await store.openEditWorkspace(id)
}
</script>

<template>
  <div class="position-relative">
    <PedidoSugerenciasFilters />

    <VCard class="prepedido-card">
      <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
        <div>
          <div class="d-flex align-center gap-2">
            <VIcon icon="tabler-package" />
            <h4 class="text-h5 mb-0">Prepedidos</h4>
          </div>

          <div class="text-body-2 text-medium-emphasis">
            Gestiona prepedidos manuales y sugeridos con una vista uniforme.
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

          <VBtn
            color="primary"
            :loading="store.actionLoading && store.actionLoadingKey === 'go-new'"
            :disabled="store.actionLoading"
            @click="goNew"
          >
            <VIcon icon="tabler-plus" class="me-1" />
            Nuevo prepedido
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
            {{ origenLabel(item.origen) }}
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
            <VTooltip text="Abrir prepedido" location="top">
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="store.actionLoading"
                  @click="goEdit(item.id)"
                >
                  <VProgressCircular
                    v-if="store.actionLoading && store.actionLoadingKey === `open-${item.id}`"
                    indeterminate
                    size="18"
                    width="2"
                  />
                  <VIcon v-else icon="tabler-edit" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'borrador'"
              text="Confirmar prepedido"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="store.actionLoading"
                  @click="store.confirmItem(item.id)"
                >
                  <VIcon icon="tabler-circle-check" class="text-success" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'confirmado' && !item.pedido_erp_id"
              text="Generar pedido ERP"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="store.generatingPedido || store.actionLoading"
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
              text="Cancelar prepedido"
              location="top"
            >
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="store.actionLoading"
                  @click="store.cancelItem(item.id)"
                >
                  <VIcon icon="tabler-ban" class="text-warning" />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip
              v-if="item.estatus === 'procesado' || item.pedido_erp_id"
              text="Pedido ERP generado"
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
            <div>No hay prepedidos para mostrar.</div>
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

    <VOverlay
      :model-value="store.actionLoading"
      contained
      persistent
      class="align-center justify-center"
    >
      <div class="loading-card">
        <VIcon icon="tabler-home" size="42" color="primary" class="mb-3" />
        <div class="text-subtitle-1 font-weight-medium">{{ store.actionLoadingText }}</div>
        <div class="text-body-2 text-medium-emphasis mt-1">Espera un momento...</div>
      </div>
    </VOverlay>
  </div>
</template>

<style scoped>
.prepedido-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.loading-card {
  min-width: 260px;
  padding: 24px 28px;
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
  text-align: center;
}
</style>
