<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const store = usePedidoSugerenciasStore()
const router = useRouter()
const formRef = ref<any>(null)
const showConfig = ref(true)

watch(
  () => store.formTipoPedidoId,
  async value => {
    if (!value) {
      store.productos = []
      return
    }

    await store.fetchProductosByTipoPedido(value)
  },
  { immediate: true },
)

const title = computed(() => {
  if (store.loadingOne) return 'Cargando prepedido...'
  return store.isEdit ? `Editar prepedido #${store.editingId}` : 'Nuevo prepedido'
})

const subtitle = computed(() => {
  return store.isEdit
    ? 'Ajusta cantidades y observaciones del prepedido.'
    : 'Crea un prepedido manual o genera uno sugerido.'
})

const statusColor = computed(() => {
  switch (store.formEstatus) {
    case 'confirmado': return 'success'
    case 'cancelado': return 'error'
    case 'procesado': return 'info'
    default: return 'warning'
  }
})

const clienteLabel = computed(() => {
  const found = store.clientes.find(item => item.value === store.formClienteId)
  return found?.title ?? store.formClienteId ?? '-'
})

const tipoPedidoLabel = computed(() => {
  const found = store.tiposPedido.find(item => item.value === store.formTipoPedidoId)
  return found?.title ?? store.formTipoPedidoId ?? '-'
})

const origenLabel = computed(() => {
  const found = store.origenOptions.find(item => item.value === store.formOrigen)
  return found?.title ?? store.formOrigen ?? '-'
})

const isForecastOrigin = computed(() => store.formOrigen === 'forecast')

const canGenerateForecast = computed(() => {
  return store.isDraft
    && !!store.formClienteId
    && !!store.formTipoPedidoId
    && !!store.formFechaObjetivo
    && !store.isEdit
  })

const canLoadBaseProducts = computed(() => {
  return store.isDraft
    && !!store.formClienteId
    && !!store.formTipoPedidoId
    && store.formOrigen === 'manual'
  })

const canGeneratePedido = computed(() => {
  return store.isEdit && store.formEstatus === 'confirmado'
})

const canEditHeader = computed(() => {
  return !store.isEdit && store.isDraft
})

const canEditDetail = computed(() => {
  return store.isDraft && store.formEstatus !== 'procesado'
})

const onSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  const wasEdit = store.isEdit
  const row = await store.save()

  if (!wasEdit && row?.id)
    router.replace(`/pedidos/pedido-sugerencias/${row.id}`)
}

const onGenerarForecast = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  const wasEdit = store.isEdit
  const row = await store.generarForecast()

  if (!wasEdit && row?.id)
    router.replace(`/pedidos/pedido-sugerencias/${row.id}`)
}

const onConfirm = async () => {
  await store.confirmItem()
}

const onGenerarPedido = async () => {
  await store.generarPedido()
}

const onCancel = async () => {
  await store.cancelItem()
}

const goBack = () => router.push('/pedidos/pedido-sugerencias')

const toggleConfig = () => {
  if (!canEditHeader.value) return
  showConfig.value = !showConfig.value
}
</script>

<template>
  <VForm
    ref="formRef"
    @submit.prevent="onSave"
  >
    <div class="pedido-workspace position-relative">
      <VCard class="mb-4 workspace-hero-card">
        <VCardText class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div>
            <div class="d-flex align-center gap-2">
              <IconBtn @click="goBack">
                <VIcon icon="tabler-arrow-left" />
              </IconBtn>

              <div>
                <div class="d-flex align-center gap-2 flex-wrap">
                  <h4 class="text-h4 mb-0">
                    {{ title }}
                  </h4>

                  <VChip
                    size="small"
                    :color="statusColor"
                    variant="tonal"
                  >
                    {{ store.formEstatus }}
                  </VChip>

                  <VChip
                    v-if="store.formEstatus === 'procesado'"
                    size="small"
                    color="success"
                    variant="tonal"
                  >
                    Pedido ERP generado
                  </VChip>
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{ subtitle }}
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              color="info"
              variant="tonal"
              :loading="store.generating"
              :disabled="!canGenerateForecast || store.actionLoading"
              @click="onGenerarForecast"
            >
              <VIcon icon="tabler-wand" class="me-1" />
              Generar sugerido
            </VBtn>

            <VBtn
              v-if="canLoadBaseProducts"
              color="secondary"
              variant="tonal"
              :loading="store.loadingBaseProductos"
              :disabled="store.actionLoading"
              @click="store.hydrateManualProductos()"
            >
              <VIcon icon="tabler-packages" class="me-1" />
              Cargar productos base
            </VBtn>

            <VBtn
              color="primary"
              variant="tonal"
              :disabled="!canEditDetail || store.actionLoading"
              @click="store.addDetalle()"
            >
              <VIcon icon="tabler-plus" class="me-1" />
              Agregar producto
            </VBtn>

            <VBtn
              color="primary"
              type="submit"
              :loading="store.saving"
              :disabled="!canEditDetail || store.actionLoading"
            >
              <VIcon icon="tabler-device-floppy" class="me-1" />
              Guardar
            </VBtn>

            <VBtn
              v-if="store.isEdit && store.isDraft"
              color="success"
              variant="tonal"
              :disabled="store.actionLoading"
              @click="onConfirm"
            >
              <VIcon icon="tabler-circle-check" class="me-1" />
              Confirmar
            </VBtn>

            <VBtn
              v-if="canGeneratePedido"
              color="primary"
              variant="tonal"
              :loading="store.generatingPedido"
              :disabled="store.actionLoading"
              @click="onGenerarPedido"
            >
              <VIcon icon="tabler-file-invoice" class="me-1" />
              Generar pedido
            </VBtn>

            <VBtn
              v-if="store.isEdit && store.formEstatus !== 'cancelado' && store.formEstatus !== 'procesado'"
              color="warning"
              variant="tonal"
              :disabled="store.actionLoading"
              @click="onCancel"
            >
              <VIcon icon="tabler-ban" class="me-1" />
              Cancelar
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <VCard class="mb-4 config-card">
        <VCardText class="py-3">
          <div class="d-flex flex-wrap align-center justify-space-between gap-3">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                Configuración general
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Sucursal, tipo de pedido y modo de captura del prepedido.
              </div>
            </div>

            <div class="d-flex align-center gap-2 flex-wrap">
              <VChip size="small" variant="tonal">
                Sucursal: {{ clienteLabel }}
              </VChip>

              <VChip size="small" variant="tonal">
                Tipo: {{ tipoPedidoLabel }}
              </VChip>

              <VChip size="small" variant="tonal">
                Origen: {{ origenLabel }}
              </VChip>

              <VBtn
                variant="text"
                size="small"
                :disabled="!canEditHeader"
                @click="toggleConfig"
              >
                {{ showConfig ? 'Ocultar filtros' : 'Editar filtros' }}
              </VBtn>
            </div>
          </div>

          <VExpandTransition>
            <div v-show="showConfig && canEditHeader" class="mt-4">
              <VRow>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="store.formClienteId"
                    :items="store.clientes"
                    item-title="title"
                    item-value="value"
                    label="Sucursal / Cliente"
                    placeholder="Selecciona sucursal"
                    :rules="[v => !!v || 'Requerido']"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="store.formTipoPedidoId"
                    :items="store.tiposPedido"
                    item-title="title"
                    item-value="value"
                    label="Tipo de pedido"
                    placeholder="Selecciona tipo de pedido"
                    :rules="[v => !!v || 'Requerido']"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppDateTimePicker
                    v-model="store.formFechaObjetivo"
                    label="Fecha objetivo"
                    :config="{ dateFormat: 'Y-m-d' }"
                    :rules="[v => !!v || 'Requerido']"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="store.formOrigen"
                    :items="store.origenOptions"
                    item-title="title"
                    item-value="value"
                    label="Origen"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    :model-value="store.formModelo || (isForecastOrigin ? 'forecast_v1' : 'manual')"
                    label="Modelo"
                    readonly
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    :model-value="store.formDiasHistorico"
                    label="Días histórico"
                    readonly
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextarea
                    v-model="store.formObservaciones"
                    label="Observaciones"
                    rows="2"
                    placeholder="Notas operativas o comentarios"
                    :disabled="!canEditHeader"
                  />
                </VCol>
              </VRow>
            </div>
          </VExpandTransition>
        </VCardText>
      </VCard>

      <VCard>
        <VCardText class="py-3">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div>
              <div class="text-subtitle-2 font-weight-medium">
                Detalle del prepedido
              </div>
              <div class="text-body-2 text-medium-emphasis">
                En manual puedes capturar o cargar productos base. En sugerido se genera desde forecast.
              </div>
            </div>

            <VChip size="small" variant="outlined">
              {{ store.formDetalles.length }} productos
            </VChip>
          </div>
        </VCardText>

        <VDivider />

        <div class="workspace-table-wrap">
          <VTable class="workspace-table text-no-wrap">
            <thead>
              <tr>
                <th style="min-width: 140px;">Clave</th>
                <th style="min-width: 320px;">Producto</th>
                <th style="min-width: 120px;">Sugerida</th>
                <th style="min-width: 120px;">Ajustada</th>
                <th style="min-width: 120px;">Final</th>
                <th style="min-width: 240px;">Observaciones</th>
                <th style="width: 70px;" class="text-right">Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!store.formDetalles.length">
                <td colspan="7" class="text-center py-8 text-medium-emphasis">
                  No hay productos en el prepedido.
                </td>
              </tr>

              <tr
                v-for="(detalle, index) in store.formDetalles"
                :key="`${index}-${detalle.id ?? 'new'}-${detalle.producto_id}`"
              >
                <td>
                  <AppTextField
                    :model-value="detalle.producto?.clave || detalle.producto_id || ''"
                    placeholder="-"
                    readonly
                  />
                </td>

                <td>
                  <AppSelect
                    v-model="detalle.producto_id"
                    :items="store.productos"
                    item-title="title"
                    item-value="value"
                    placeholder="Selecciona producto"
                    :disabled="store.isEdit || !canEditDetail || store.actionLoading"
                    @update:model-value="store.onProductoChange(index)"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_sugerida"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="store.formOrigen === 'forecast' || store.actionLoading"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_ajustada"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="!canEditDetail || store.actionLoading"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_final"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="!canEditDetail || store.actionLoading"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.observaciones"
                    placeholder="Opcional"
                    :disabled="!canEditDetail || store.actionLoading"
                  />
                </td>

                <td class="text-right">
                  <IconBtn
                    :disabled="!canEditDetail || store.actionLoading"
                    @click="store.removeDetalle(index)"
                  >
                    <VIcon icon="tabler-trash" class="text-error" />
                  </IconBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>
      </VCard>

      <VOverlay
        :model-value="store.actionLoading || store.loadingOne"
        persistent
        contained
        class="align-center justify-center"
      >
        <div class="loading-card">
          <VIcon icon="tabler-home" size="44" color="primary" class="mb-3" />
          <div class="text-subtitle-1 font-weight-medium">
            {{ store.loadingOne ? 'Cargando prepedido...' : store.actionLoadingText }}
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Procesando información...
          </div>
        </div>
      </VOverlay>
    </div>
  </VForm>
</template>

<style scoped>
.pedido-workspace {
  padding-bottom: 16px;
}

.workspace-hero-card,
.config-card,
.summary-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.workspace-table-wrap {
  overflow-x: auto;
}

.workspace-table th {
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  color: rgba(var(--v-theme-on-surface), 0.75);
  position: sticky;
  top: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 1;
}

.workspace-table td {
  vertical-align: middle;
}

.summary-box {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.summary-label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 700;
}

.loading-card {
  min-width: 280px;
  padding: 26px 30px;
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.2);
  text-align: center;
}

:deep(.v-field) {
  --v-input-control-height: 38px;
}

:deep(.v-field__input) {
  min-height: 38px;
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
