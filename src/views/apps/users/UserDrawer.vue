<script setup lang="ts">
import { useRolesStore } from '@/stores/roles.store'
import { useUsersStore } from '@/stores/users.store'
import { computed, ref } from 'vue'

const store = useUsersStore()
const rolesStore = useRolesStore()
const formRef = ref()

const title = computed(() => (store.isEdit ? 'Editar usuario' : 'Nuevo usuario'))

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return
  await store.saveFromDialog()
}

const roleItems = computed(() => rolesStore.roles.map(r => r.name))
</script>

<template>
  <VNavigationDrawer v-model="store.drawerOpen" location="right" temporary width="460" class="app-drawer">
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
              v-model="store.formName"
              label="Nombre"
              placeholder="Juan Pérez"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formEmail"
              label="Email"
              placeholder="juan@empresa.com"
              :rules="[
                v => !!String(v ?? '').trim() || 'Requerido',
                v => /.+@.+\..+/.test(String(v ?? '')) || 'Email inválido',
              ]"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formPassword"
              :label="store.isEdit ? 'Password (opcional)' : 'Password'"
              placeholder="******"
              type="password"
              :rules="store.isEdit ? [] : [v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="store.formRoles"
              :items="roleItems"
              label="Roles"
              multiple
              chips
              closable-chips
            />
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
  </VNavigationDrawer>
</template>
