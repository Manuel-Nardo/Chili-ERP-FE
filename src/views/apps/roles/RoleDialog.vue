<script setup lang="ts">
import { useRolesStore } from '@/stores/roles.store'
import { computed, ref, watch } from 'vue'

const rolesStore = useRolesStore()

const permissionsText = ref('')

const title = computed(() => (rolesStore.isEdit ? 'Editar rol' : 'Crear rol'))

const parsePermissions = (txt: string): string[] => {
  const s = (txt ?? '').trim()
  if (!s) return []

  // 1) intenta JSON: ["users.read","users.create"]
  try {
    const json = JSON.parse(s)
    if (Array.isArray(json)) {
      return json
        .map(x => String(x).trim())
        .filter(Boolean)
    }
  } catch {}

  // 2) fallback: separados por coma/enter
  return s
    .split(/[\n,]+/g)
    .map(x => x.trim())
    .filter(Boolean)
}

watch(
  () => rolesStore.dialogVisible,
  visible => {
    if (!visible) return

    // al abrir: setear textarea desde store.formPermissions
    const perms = rolesStore.formPermissions ?? []
    permissionsText.value = perms.length ? JSON.stringify(perms, null, 2) : ''
  },
)

const onSave = async () => {
  rolesStore.formPermissions = parsePermissions(permissionsText.value)
  await rolesStore.saveFromDialog()
}
</script>

<template>
  <VDialog v-model="rolesStore.dialogVisible" max-width="720">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>{{ title }}</span>
        <IconBtn @click="rolesStore.closeDialog()">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </VCardTitle>

      <VCardText class="pt-2">
        <AppTextField
          v-model="rolesStore.formName"
          label="Nombre del rol"
          placeholder="admin"
        />

        <div class="mt-4">
          <div class="text-body-2 mb-2">Permisos</div>

          <AppTextarea
            v-model="permissionsText"
            rows="8"
            placeholder='Ej (JSON): ["users.read","users.create"]  o  users.read, users.create'
          />
        </div>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="rolesStore.closeDialog()">Cancelar</VBtn>
        <VBtn :loading="rolesStore.saving" @click="onSave">
          {{ rolesStore.isEdit ? 'Actualizar' : 'Crear' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
