<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const store = usePedidoSugerenciasStore()
const router = useRouter()
const formRef = ref<any>(null)
const showConfig = ref(false)

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
  if (store.loadingOne) return 'Cargando sugerencia...'
  return store.isEdit ? `Editar sugerencia #${store.editingId}` : 'Nueva sugerencia'
})

const subtitle = computed(() => {
  return store.isEdit
    ? 'Ajusta cantidades y observaciones del pedido sugerido.'
    : 'Genera, ajusta y confirma el pedido sugerido.'
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

const canGenerate = computed(() => {
  return store.isDraft
    && !!store.formClienteId
    && !!store.formTipoPedidoId
    && !!store.formFechaObjetivo
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

const onGenerar = async () => {
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
    <div class="pedido-workspace">
      <VCard class="mb-4">
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
              :disabled="!canGenerate || store.isEdit"
              @click="onGenerar"
            >
              <VIcon
                icon="tabler-wand"
                class="me-1"
              />
              Generar Forecast
            </VBtn>

            <VBtn
              color="primary"
              variant="tonal"
              :disabled="!canEditDetail"
              @click="store.addDetalle()"
            >
              <VIcon
                icon="tabler-plus"
                class="me-1"
              />
              Agregar producto
            </VBtn>

            <VBtn
              color="primary"
              type="submit"
              :loading="store.saving"
              :disabled="!canEditDetail"
            >
              <VIcon
                icon="tabler-device-floppy"
                class="me-1"
              />
              Guardar
            </VBtn>

            <VBtn
              v-if="store.isEdit && store.isDraft"
              color="success"
              variant="tonal"
              @click="onConfirm"
            >
              <VIcon
                icon="tabler-circle-check"
                class="me-1"
              />
              Confirmar
            </VBtn>

            <VBtn
              v-if="canGeneratePedido"
              color="primary"
              variant="tonal"
              :loading="store.generatingPedido"
              @click="onGenerarPedido"
            >
              <VIcon
                icon="tabler-file-invoice"
                class="me-1"
              />
              Generar pedido
            </VBtn>

            <VBtn
              v-if="store.isEdit && store.formEstatus !== 'cancelado' && store.formEstatus !== 'procesado'"
              color="warning"
              variant="tonal"
              @click="onCancel"
            >
              <VIcon
                icon="tabler-ban"
                class="me-1"
              />
              Cancelar
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <VCard class="mb-4">
        <VCardText class="py-3">
          <div class="d-flex flex-wrap align-center justify-space-between gap-3">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                Configuración general
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Cliente, tipo de pedido y parámetros para forecast.
              </div>
            </div>

            <div class="d-flex align-center gap-2 flex-wrap">
              <VChip size="small" variant="tonal">
                Cliente: {{ clienteLabel }}
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
            <div v-show="showConfig && canEditHeader">
              <VRow>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppSelect
                    v-model="store.formClienteId"
                    :items="store.clientes"
                    item-title="title"
                    item-value="value"
                    label="Sucursal / Cliente"
                    placeholder="Selecciona cliente"
                    :rules="[v => !!v || 'Requerido']"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="4"
                >
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

                <VCol
                  cols="12"
                  md="4"
                >
                  <AppDateTimePicker
                    v-model="store.formFechaObjetivo"
                    label="Fecha objetivo"
                    :config="{ dateFormat: 'Y-m-d' }"
                    :rules="[v => !!v || 'Requerido']"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="3"
                >
                  <AppSelect
                    v-model="store.formOrigen"
                    :items="store.origenOptions"
                    item-title="title"
                    item-value="value"
                    label="Origen"
                    :disabled="true"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="3"
                >
                  <AppTextField
                    v-model="store.formModelo"
                    label="Modelo"
                    placeholder="forecast_v1"
                    :disabled="true"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="3"
                >
                  <AppTextField
                    v-model="store.formDiasHistorico"
                    label="Días histórico"
                    type="number"
                    min="28"
                    max="365"
                    :disabled="!canEditHeader"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="3"
                  class="d-flex align-center"
                >
                  <VSwitch
                    v-model="store.formForzarRegeneracion"
                    label="Forzar regeneración"
                    inset
                    :disabled="!canEditHeader"
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
            <div class="text-subtitle-2 font-weight-medium">
              Detalle del pedido
            </div>

            <VChip
              size="small"
              variant="outlined"
            >
              {{ store.formDetalles.length }} productos
            </VChip>
          </div>
        </VCardText>

        <VDivider />

        <div class="workspace-table-wrap">
          <VTable class="workspace-table text-no-wrap">
            <thead>
              <tr>
                <th style="min-width: 140px;">
                  Clave
                </th>
                <th style="min-width: 320px;">
                  Producto
                </th>
                <th style="min-width: 120px;">
                  Sugerida
                </th>
                <th style="min-width: 120px;">
                  Ajustada
                </th>
                <th style="min-width: 120px;">
                  Final
                </th>
                <th style="min-width: 240px;">
                  Observaciones
                </th>
                <th
                  style="width: 70px;"
                  class="text-right"
                >
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!store.formDetalles.length">
                <td
                  colspan="7"
                  class="text-center py-8 text-medium-emphasis"
                >
                  No hay productos en la sugerencia.
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
                    :disabled="store.isEdit || !canEditDetail"
                    @update:model-value="store.onProductoChange(index)"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_sugerida"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="true"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_ajustada"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="!canEditDetail"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.cantidad_final"
                    type="number"
                    min="0"
                    step="0.01"
                    :disabled="!canEditDetail"
                  />
                </td>

                <td>
                  <AppTextField
                    v-model="detalle.observaciones"
                    placeholder="Opcional"
                    :disabled="!canEditDetail"
                  />
                </td>

                <td class="text-right">
                  <IconBtn
                    :disabled="!canEditDetail"
                    @click="store.removeDetalle(index)"
                  >
                    <VIcon
                      icon="tabler-trash"
                      class="text-error"
                    />
                  </IconBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>
      </VCard>
    </div>
  </VForm>
</template>

<style scoped>
.pedido-workspace {
  padding-bottom: 16px;
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

:deep(.v-field) {
  --v-input-control-height: 38px;
}

:deep(.v-field__input) {
  min-height: 38px;
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
