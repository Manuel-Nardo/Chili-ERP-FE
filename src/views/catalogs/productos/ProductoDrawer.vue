<script setup lang="ts">
import { useProductosStore } from '@/stores/catalogs/productos.store'
import { computed, ref } from 'vue'

const store = useProductosStore()
const formRef = ref<any>()

const title = computed(() => (store.isEdit ? 'Editar producto' : 'Nuevo producto'))

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  await store.saveFromDrawer()
}
</script>

<template>
  <VNavigationDrawer
    v-model="store.drawerOpen"
    location="right"
    temporary
    width="640"
    class="app-drawer"
  >
    <div class="drawer-shell d-flex flex-column h-100">
      <div class="d-flex align-center justify-space-between px-6 py-4 drawer-header">
        <div class="text-subtitle-1 font-weight-medium">
          {{ title }}
        </div>

        <IconBtn @click="store.closeDrawer(); store.resetForm()">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </div>

      <VDivider />

      <div class="drawer-body px-6 py-5">
        <VForm ref="formRef" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12" md="4">
              <AppTextField
                v-model="store.formClave"
                label="Clave"
                placeholder="1001"
                type="number"
                :rules="[
                  v => String(v ?? '').trim() !== '' || 'Requerido',
                  v => !isNaN(Number(v)) || 'Debe ser numérico',
                ]"
              />
            </VCol>

            <VCol cols="12" md="8">
              <AppTextField
                v-model="store.formClaveSat"
                label="Clave SAT"
                placeholder="50181900"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="store.formNombre"
                label="Nombre"
                placeholder="Concha vainilla"
                :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="store.formDescripcion"
                label="Descripción"
                placeholder="Descripción del producto"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formLineaId"
                label="Línea"
                placeholder="Selecciona una línea"
                :items="store.lineaOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formTipoPedidoId"
                label="Tipo de pedido"
                placeholder="Selecciona un tipo"
                :items="store.tipoPedidoOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formMedidaId"
                label="Unidad"
                placeholder="Selecciona una unidad"
                :items="store.unidadOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formMedidaCompraId"
                label="Unidad compra"
                placeholder="Selecciona una unidad"
                :items="store.unidadOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formRuta"
                label="Ruta"
                placeholder="Selecciona una ruta"
                :items="store.rutaOptions"
                item-title="title"
                item-value="value"
                clearable
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppSelect
                v-model="store.formImpuestos"
                label="Impuestos"
                placeholder="Selecciona impuestos"
                :items="store.impuestoOptions"
                item-title="title"
                item-value="value"
                multiple
                chips
                closable-chips
                clearable
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="store.formPrecioActual"
                label="Precio actual"
                placeholder="12.50"
                type="number"
                step="0.01"
                min="0"
                :rules="[
                  v => String(v ?? '').trim() === '' || !isNaN(Number(v)) || 'Debe ser numérico',
                  v => String(v ?? '').trim() === '' || Number(v) >= 0 || 'Debe ser mayor o igual a 0',
                ]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="store.formCostoActual"
                label="Costo actual"
                placeholder="6.20"
                type="number"
                step="0.01"
                min="0"
                :rules="[
                  v => String(v ?? '').trim() === '' || !isNaN(Number(v)) || 'Debe ser numérico',
                  v => String(v ?? '').trim() === '' || Number(v) >= 0 || 'Debe ser mayor o igual a 0',
                ]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="store.formMotivoPrecio"
                label="Motivo precio"
                placeholder="Alta inicial / ajuste"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="store.formMotivoCosto"
                label="Motivo costo"
                placeholder="Alta inicial / ajuste proveedor"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppDateTimePicker
                v-model="store.formFechaInicioPrecio"
                label="Fecha inicio precio"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppDateTimePicker
                v-model="store.formFechaInicioCosto"
                label="Fecha inicio costo"
                :config="{ dateFormat: 'Y-m-d' }"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSwitch
                v-model="store.formActivo"
                label="Activo"
                inset
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSwitch
                v-model="store.formFacturable"
                label="Facturable"
                inset
              />
            </VCol>
          </VRow>

          <div class="drawer-actions d-flex gap-4 pt-4">
            <VBtn type="submit" color="primary" :loading="store.saving">
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
          </div>
        </VForm>
      </div>
    </div>
  </VNavigationDrawer>
</template>

<style scoped>
.drawer-shell {
  height: 100%;
  overflow: hidden;
}

.drawer-header {
  flex: 0 0 auto;
}

.drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.drawer-actions {
  position: sticky;
  bottom: 0;
  background: rgb(var(--v-theme-surface));
  padding-bottom: 8px;
}
</style>
