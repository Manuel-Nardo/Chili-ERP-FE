<script setup lang="ts">
import { useSeriesSucursalStore } from '@/stores/catalogs/series-sucursal.store'
import { computed, ref } from 'vue'

const store = useSeriesSucursalStore()
const formRef = ref<any>()

const title = computed(() => (store.isEdit ? 'Editar serie por cliente' : 'Nueva serie por cliente'))

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return
  await store.saveFromDrawer()
}
</script>

<template>
  <VNavigationDrawer v-model="store.drawerOpen" location="right" temporary width="520" class="app-drawer">
    <div class="drawer-shell d-flex flex-column h-100">
      <div class="d-flex align-center justify-space-between px-6 py-4">
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
            <VCol cols="12">
              <AppSelect
                v-model="store.formClienteId"
                label="Cliente"
                placeholder="Selecciona un cliente"
                :items="store.clienteOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="store.formTipoSerieId"
                label="Tipo de serie"
                placeholder="Selecciona un tipo"
                :items="store.tipoSerieOptions"
                item-title="title"
                item-value="value"
                :rules="[v => !!v || 'Requerido']"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="store.formSerie"
                label="Serie"
                placeholder="PED-OAX"
                :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="store.formFolioActual"
                label="Folio actual"
                type="number"
                min="0"
                placeholder="0"
                :rules="[
                  v => String(v ?? '').trim() !== '' || 'Requerido',
                  v => !isNaN(Number(v)) || 'Debe ser numérico',
                  v => Number(v) >= 0 || 'Debe ser mayor o igual a 0',
                ]"
              />
            </VCol>

            <VCol cols="12">
              <VSwitch v-model="store.formActivo" label="Activo" inset />
            </VCol>

            <VCol cols="12" class="d-flex gap-4">
              <VBtn type="submit" color="primary" :loading="store.saving">
                Guardar
              </VBtn>

              <VBtn type="button" color="warning" variant="tonal" @click="store.closeDrawer(); store.resetForm()">
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
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

.drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}
</style>
