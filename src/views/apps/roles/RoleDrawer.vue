<script setup lang="ts">
import { useRolesStore } from '@/stores/roles.store'
import { computed, ref } from 'vue'

const store = useRolesStore()
const formRef = ref()

const title = computed(() => (store.isEdit ? 'Editar rol' : 'Nuevo rol'))

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  // Asegura que no mande permisos desde roles (fase 1)
  store.formPermissions = []

  await store.saveFromDialog()
}

const onReset = () => {
  store.resetForm()
}
</script>

<template>
  <VNavigationDrawer
    v-model="store.drawerOpen"
    location="right"
    temporary
    width="420"
    class="app-drawer"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div class="text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>

      <IconBtn @click="store.closeDrawer()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <div class="px-6 py-5">
      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="store.formName"
              label="Nombre"
              placeholder="admin"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-4">
            <VBtn type="submit" :loading="store.saving">
              Guardar
            </VBtn>

            <VBtn
              type="button"
              color="warning"
              variant="tonal"
              @click="store.closeDrawer()"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
