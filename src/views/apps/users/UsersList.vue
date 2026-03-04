<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useRolesStore } from '@/stores/roles.store'
import { useUsersStore } from '@/stores/users.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete } = useSwal()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return usersStore.users
  return usersStore.users.filter(u =>
    (u.name ?? '').toLowerCase().includes(query) || (u.email ?? '').toLowerCase().includes(query),
  )
})

const headers = [
  { title: 'Usuario', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Roles', key: 'roles', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    rolesStore.fetchRoles(), // para llenar selector de roles en drawer
  ])
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({ title: '¿Eliminar usuario?', text: 'Esta acción no se puede deshacer.' })
  if (!ok) return
  await usersStore.deleteUser(id)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-users" />
          <h4 class="text-h5 mb-0">Usuarios</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina usuarios del sistema y asígnales roles.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <AppTextField
          v-model="q"
          placeholder="Buscar usuario..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <VBtn variant="tonal" :loading="usersStore.loading" :disabled="usersStore.loading" @click="usersStore.fetchUsers()">
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <VBtn color="primary" @click="usersStore.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo usuario
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTable
      :headers="headers"
      :items="filtered"
      :loading="usersStore.loading"
      item-value="id"
      density="compact"
      class="text-no-wrap"
    >
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-user" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.email="{ item }">
        <span class="text-body-2">{{ item.email }}</span>
      </template>

      <template #item.roles="{ item }">
        <div class="d-flex flex-wrap gap-1">
          <VChip v-for="r in (item.roles ?? [])" :key="r" size="small" variant="tonal">
            <VIcon icon="tabler-shield" size="16" class="me-1" />
            {{ r }}
          </VChip>
          <span v-if="!item.roles || item.roles.length === 0" class="text-medium-emphasis text-body-2">
            —
          </span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar usuario" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="usersStore.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar usuario" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="onDelete(item.id)">
                <VIcon icon="tabler-trash" class="text-error" />
              </IconBtn>
            </template>
          </VTooltip>
        </div>
      </template>

      <template #no-data>
        <div class="py-8 text-center text-medium-emphasis">
          <VIcon icon="tabler-folder-off" class="mb-2" />
          <div>No hay usuarios para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <UserDialog />
    <UserDrawer />
  </VCard>
</template>

<script lang="ts">
import UserDialog from '@/views/apps/users/UserDialog.vue'
import UserDrawer from '@/views/apps/users/UserDrawer.vue'
export default {}
</script>
