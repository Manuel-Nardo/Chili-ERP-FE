<script setup lang="ts">
import { useRolesStore } from '@/stores/roles.store'
import { computed, ref, watch } from 'vue'

const store = useRolesStore()
const formRef = ref()

// textarea helper
const permissionsText = ref('')

const title = computed(() => (store.isEdit ? 'Editar rol' : 'Nuevo rol'))

const parsePermissions = (txt: string): string[] => {
  const s = (txt ?? '').trim()
  if (!s) return []

  // JSON array: ["users.read","users.create"]
  try {
    const json = JSON.parse(s)
    if (Array.isArray(json))
      return json.map(x => String(x).trim()).filter(Boolean)
  } catch {}

  // CSV / newlines: users.read, users.create
  return s.split(/[\n,]+/g).map(x => x.trim()).filter(Boolean)
}

watch(
  () => store.drawerOpen,
  v => {
    if (!v) return
    permissionsText.value = store.formPermissions?.length
      ? JSON.stringify(store.formPermissions, null, 2)
      : ''
  },
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  store.formPermissions = parsePermissions(permissionsText.value)
  await store.saveFromDialog()
}

const onReset = () => {
  if (store.isEdit) {
    // reset a valores originales del edit (mantenemos lo que trae el store)
    permissionsText.value = store.formPermissions?.length
      ? JSON.stringify(store.formPermissions, null, 2)
      : ''
  } else {
    store.resetForm()
    permissionsText.value = ''
  }
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

          <VCol cols="12">
            <AppTextarea
              v-model="permissionsText"
              label="Permisos"
              rows="10"
              placeholder='Ej: ["users.read","users.create"]  o  users.read, users.create'
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-4">
            <VBtn type="submit" :loading="store.saving">
              Guardar
            </VBtn>

            <VBtn
              type="button"
              color="secondary"
              variant="tonal"
              @click="onReset"
            >
              Reset
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
