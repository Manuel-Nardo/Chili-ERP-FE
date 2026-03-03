<script setup lang="ts">
import { useSwal } from '@/composables/useSwal';
import { useRolesStore } from '@/stores/roles.store';
import { computed, onMounted, ref } from 'vue';

const { confirmDelete, success, error } = useSwal()

const rolesStore = useRolesStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return rolesStore.roles
  return rolesStore.roles.filter(r => (r.name ?? '').toLowerCase().includes(query))
})

const headers = [
  { title: 'Rol', key: 'name' },
  { title: 'Guard', key: 'guard_name' },
  { title: 'Usuarios', key: 'users_count', align: 'start' },
  { title: 'Permisos', key: 'permissions_count', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await rolesStore.fetchRoles()
})



const onDelete = async (id: number) => {
  const ok = await confirmDelete({ title: '¿Eliminar rol?', text: 'Esta acción no se puede deshacer.' })
  if (!ok) return

  try {
    await rolesStore.deleteRole(id)
    await success('Eliminado', 'El rol fue eliminado correctamente.')
  } catch (e: any) {
    await error('Error', e?.response?.data?.message ?? 'No se pudo eliminar el rol.')
  }
}
</script>

<template>
  <VCard>
    <!-- Header del módulo (más “enterprise”) -->
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-shield-lock" />
          <h4 class="text-h5 mb-0">Roles</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina roles del sistema.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <!-- Search -->
        <AppTextField
          v-model="q"
          placeholder="Buscar rol..."
          density="compact"
          style="min-width: 240px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <!-- Refresh -->
        <VBtn
          variant="tonal"
          :loading="rolesStore.loading"
          :disabled="rolesStore.loading"
          @click="rolesStore.fetchRoles()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <!-- Create -->
        <VBtn color="primary" @click="rolesStore.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo rol
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTable
      :headers="headers"
      :items="filtered"
      :loading="rolesStore.loading"
      item-value="id"
      density="compact"
      class="text-no-wrap"
    >
      <!-- Rol: chip sutil opcional -->
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-id-badge-2" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <!-- Guard -->
      <template #item.guard_name="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.guard_name || 'web' }}
        </VChip>
      </template>

      <!-- Usuarios -->
      <template #item.users_count="{ item }">
        <VChip size="small" variant="tonal">
          <VIcon icon="tabler-users" size="16" class="me-1" />
          {{ Number(item.users_count ?? 0) }}
        </VChip>
      </template>

      <!-- Permisos -->
      <template #item.permissions_count="{ item }">
        <VChip size="small" variant="tonal">
          <VIcon icon="tabler-key" size="16" class="me-1" />
          {{ Array.isArray(item.permissions) ? item.permissions.length : 0 }}
        </VChip>
      </template>

      <!-- Acciones: iconos + tooltips -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Asignar permisos" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="rolesStore.openPermissions(item)">
                <VIcon icon="tabler-key" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Editar rol" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="rolesStore.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar rol" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="onDelete(item.id)">
                <VIcon icon="tabler-trash" class="text-error" />
              </IconBtn>
            </template>
          </VTooltip>
        </div>
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="py-8 text-center text-medium-emphasis">
          <VIcon icon="tabler-folder-off" class="mb-2" />
          <div>No hay roles para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <!-- Dialog -->
    <RoleDialog />
    <RoleDrawer />
    <RolePermissionsDrawer />
  </VCard>
</template>

<script lang="ts">
import RoleDialog from '@/views/apps/roles/RoleDialog.vue';
import RoleDrawer from '@/views/apps/roles/RoleDrawer.vue';
import RolePermissionsDrawer from '@/views/apps/roles/RolePermissionsDrawer.vue';
export default {}
</script>
