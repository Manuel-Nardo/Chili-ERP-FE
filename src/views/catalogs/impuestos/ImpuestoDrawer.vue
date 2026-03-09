<script setup lang="ts">
import { useImpuestosStore } from '@/stores/catalogs/impuestos.store'
import { computed, ref } from 'vue'

const store = useImpuestosStore()
const formRef = ref<any>()

const title = computed(() => (store.isEdit ? 'Editar impuesto' : 'Nuevo impuesto'))

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
    width="460"
    class="app-drawer"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div class="text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>

      <IconBtn @click="store.closeDrawer(); store.resetForm()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <div class="px-6 py-5">
      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="store.formNombre"
              label="Nombre"
              placeholder="IVA 16"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formCodigo"
              label="Código"
              placeholder="IVA16"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="store.formTipo"
              label="Tipo"
              placeholder="Selecciona un tipo"
              :items="store.tipoOptions"
              item-title="title"
              item-value="value"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formPorcentaje"
              label="Porcentaje"
              placeholder="16.00"
              type="number"
              step="0.01"
              min="0"
              :rules="[
                v => v !== null && v !== undefined && String(v).trim() !== '' || 'Requerido',
                v => !isNaN(Number(v)) || 'Debe ser numérico',
                v => Number(v) >= 0 || 'Debe ser mayor o igual a 0',
              ]"
            />
          </VCol>

          <VCol cols="12">
            <VSwitch
              v-model="store.formActivo"
              label="Activo"
              inset
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-4">
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
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
