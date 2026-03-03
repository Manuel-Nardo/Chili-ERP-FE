<script setup lang="ts">
import { usePermissionsStore } from '@/stores/permissions.store'
import { computed, ref, watchEffect } from 'vue'

const store = usePermissionsStore()
const formRef = ref()

const isEdit = computed(() => store.isEdit)
const title = computed(() => (isEdit.value ? 'Editar permiso' : 'Nuevo permiso'))

watchEffect(() => {
  // opcional: si quieres reset al cerrar
  if (!store.drawerOpen) formRef.value?.resetValidation?.()
})

const rules = [
  (v: string) => !!v?.trim() || 'Requerido',
  (v: string) => /^[a-z0-9]+(\.[a-z0-9_-]+)+$/.test(v?.trim() || '') || 'Formato: modulo.accion (ej: users.create)',
]

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return
  await store.saveFromDialog()
}
</script>

<template>
  <VNavigationDrawer
    v-model="store.drawerOpen"
    location="end"
    width="420"
    temporary
    class="scrollable-content"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div>
        <div class="text-h6">{{ title }}</div>
        <div class="text-body-2 text-medium-emphasis">
          Guard: <b>web</b>
        </div>
      </div>

      <IconBtn @click="store.closeDrawer(); store.resetForm()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <VCard flat>
      <VCardText class="px-6 pt-6 pb-2">
        <VForm ref="formRef" @submit.prevent="onSubmit">
          <AppTextField
            v-model="store.formName"
            label="Permiso"
            placeholder="users.create"
            :rules="rules"
            density="compact"
            clearable
          />

          <div class="text-caption text-medium-emphasis mt-2">
            Recomendación: <code>modulo.accion</code> (ej: <code>rbac.roles.update</code>)
          </div>

          <div class="d-flex gap-2 mt-6">
            <VBtn
              color="primary"
              type="submit"
              :loading="store.saving"
              :disabled="store.saving"
            >
              <VIcon icon="tabler-device-floppy" class="me-1" />
              Guardar
            </VBtn>

            <VBtn
              variant="tonal"
              color="warning"
              :disabled="store.saving"
              @click="store.closeDrawer(); store.resetForm()"
            >
              Cancelar
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
