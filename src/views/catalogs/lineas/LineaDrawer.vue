<script setup lang="ts">
import { useLineasStore } from '@/stores/catalogs/lineas.store'
import { computed, ref } from 'vue'

const store = useLineasStore()
const formRef = ref<any>()

const title = computed(() => (store.isEdit ? 'Editar línea' : 'Nueva línea'))

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
              placeholder="Pan dulce"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppTextarea
              v-model="store.formDescripcion"
              label="Descripción"
              placeholder="Clasificación para productos de pan dulce"
              rows="3"
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
