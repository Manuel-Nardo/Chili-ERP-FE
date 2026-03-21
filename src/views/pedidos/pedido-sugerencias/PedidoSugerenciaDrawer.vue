<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import { computed, ref, watch } from 'vue'

const store = usePedidoSugerenciasStore()
const formRef = ref<any>(null)

const title = computed(() => store.isEdit ? 'Editar sugerencia' : 'Nueva sugerencia')

watch(() => store.formTipoPedidoId, async value => {
  await store.fetchProductosByTipoPedido(value)
})

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  await store.saveFromDrawer()
}

const onGenerar = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  await store.generarForecast()
}
</script>

<template>
  <VNavigationDrawer
    v-model="store.drawerOpen"
    location="right"
    temporary
    width="860"
    class="app-drawer"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div>
        <div class="text-subtitle-1 font-weight-medium">
          {{ title }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Genera, ajusta y confirma una sugerencia de pedido.
        </div>
      </div>

      <IconBtn @click="store.closeDrawer(); store.resetForm()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <div class="px-6 py-5">
      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="store.formClienteId"
              :items="store.clientes"
              item-title="title"
              item-value="value"
              label="Cliente"
              placeholder="Selecciona cliente"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppSelect
              v-model="store.formTipoPedidoId"
              :items="store.tiposPedido"
              item-title="title"
              item-value="value"
              label="Tipo de pedido"
              placeholder="Selecciona tipo de pedido"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppDateTimePicker
              v-model="store.formFechaObjetivo"
              label="Fecha objetivo"
              :config="{ dateFormat: 'Y-m-d' }"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect
              v-model="store.formOrigen"
              :items="store.origenOptions"
              item-title="title"
              item-value="value"
              label="Origen"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppTextField
              v-model="store.formModelo"
              label="Modelo"
              placeholder="forecast_v1"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppTextField
              v-model="store.formDiasHistorico"
              label="Días histórico"
              type="number"
              min="28"
              max="365"
            />
          </VCol>

          <VCol cols="12" md="4">
            <VSwitch
              v-model="store.formForzarRegeneracion"
              label="Forzar regeneración"
              inset
            />
          </VCol>

          <VCol cols="12">
            <AppTextarea
              v-model="store.formObservaciones"
              label="Observaciones"
              rows="2"
              placeholder="Notas operativas o comentarios del usuario"
            />
          </VCol>

          <VCol cols="12">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-2">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Detalle sugerido
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Puedes generar forecast o capturar productos manualmente.
                </div>
              </div>

              <div class="d-flex gap-2">
                <VBtn
                  color="info"
                  variant="tonal"
                  :loading="store.generating"
                  @click="onGenerar"
                >
                  <VIcon icon="tabler-wand" class="me-1" />
                  Generar forecast
                </VBtn>

                <VBtn
                  variant="tonal"
                  color="primary"
                  @click="store.addDetalle()"
                >
                  <VIcon icon="tabler-plus" class="me-1" />
                  Agregar producto
                </VBtn>
              </div>
            </div>

            <VTable class="text-no-wrap border rounded">
              <thead>
                <tr>
                  <th style="min-width: 240px;">Producto</th>
                  <th style="min-width: 120px;">Sugerida</th>
                  <th style="min-width: 120px;">Ajustada</th>
                  <th style="min-width: 120px;">Final</th>
                  <th style="min-width: 220px;">Observaciones</th>
                  <th style="width: 56px;" class="text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!store.formDetalles.length">
                  <td colspan="6" class="text-center py-6 text-medium-emphasis">
                    No hay productos en la sugerencia.
                  </td>
                </tr>

                <tr
                  v-for="(detalle, index) in store.formDetalles"
                  :key="`${index}-${detalle.producto_id}-${detalle.id ?? 'new'}`"
                >
                  <td>
                    <AppSelect
                      v-model="detalle.producto_id"
                      :items="store.productos"
                      item-title="title"
                      item-value="value"
                      placeholder="Producto"
                      @update:model-value="store.onProductoChange(index)"
                    />
                  </td>

                  <td>
                    <AppTextField
                      v-model="detalle.cantidad_sugerida"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </td>

                  <td>
                    <AppTextField
                      v-model="detalle.cantidad_ajustada"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </td>

                  <td>
                    <AppTextField
                      v-model="detalle.cantidad_final"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </td>

                  <td>
                    <AppTextField
                      v-model="detalle.observaciones"
                      placeholder="Opcional"
                    />
                  </td>

                  <td class="text-right">
                    <IconBtn @click="store.removeDetalle(index)">
                      <VIcon icon="tabler-trash" class="text-error" />
                    </IconBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCol>

          <VCol cols="12" class="d-flex flex-wrap gap-3">
            <VBtn
              type="submit"
              color="primary"
              :loading="store.saving"
            >
              Guardar
            </VBtn>

            <VBtn
              type="button"
              color="warning"
              variant="tonal"
              @click="store.closeDrawer(); store.resetForm()"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
