<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { usePermissionsStore } from '@/stores/permissions.store'
import { computed, onMounted, ref } from 'vue'

const { confirmDelete, success, error } = useSwal()
const permissionsStore = usePermissionsStore()

const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return permissionsStore.permissions
  return permissionsStore.permissions.filter(p => (p.name ?? '').toLowerCase().includes(query))
})

const headers = [
  { title: 'Permiso', key: 'name' },
  { title: 'Guard', key: 'guard_name' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

onMounted(async () => {
  await permissionsStore.fetchPermissions()
})

const onDelete = async (id: number) => {
  const ok = await confirmDelete({ title: '¿Eliminar permiso?', text: 'Esta acción no se puede deshacer.' })
  if (!ok) return

  try {
    await permissionsStore.deletePermission(id)
    await success('Eliminado', 'El permiso fue eliminado correctamente.')
  } catch (e: any) {
    // Soporta $api/ofetch y axios
    const msg =
      e?.data?.message ??
      e?.response?.data?.message ??
      'No se pudo eliminar el permiso.'

    await error('Error', msg)
  }
}
</script>

<template>
  <VCard>
    <!-- Header del módulo (misma línea que Roles) -->
    <VCardText class="d-flex flex-wrap align-center justify-space-between gap-3">
      <div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-key" />
          <h4 class="text-h5 mb-0">Permisos</h4>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Crea, edita o elimina permisos del sistema.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-center">
        <!-- Search -->
        <AppTextField
          v-model="q"
          placeholder="Buscar permiso..."
          density="compact"
          style="min-width: 280px;"
          prepend-inner-icon="tabler-search"
          clearable
        />

        <!-- Refresh -->
        <VBtn
          variant="tonal"
          :loading="permissionsStore.loading"
          :disabled="permissionsStore.loading"
          @click="permissionsStore.fetchPermissions()"
        >
          <VIcon icon="tabler-refresh" class="me-1" />
          Refrescar
        </VBtn>

        <!-- Create -->
        <VBtn color="primary" @click="permissionsStore.openCreate()">
          <VIcon icon="tabler-plus" class="me-1" />
          Nuevo permiso
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTable
      :headers="headers"
      :items="filtered"
      :loading="permissionsStore.loading"
      item-value="id"
      density="compact"
      class="text-no-wrap"
    >
      <!-- Permiso -->
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-lock" size="18" class="text-medium-emphasis" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <!-- Guard -->
      <template #item.guard_name="{ item }">
        <VChip size="small" variant="tonal">
          {{ item.guard_name || 'web' }}
        </VChip>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <VTooltip text="Editar permiso" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="permissionsStore.openEdit(item)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VTooltip>

          <VTooltip text="Eliminar permiso" location="top">
            <template #activator="{ props }">
              <IconBtn v-bind="props" @click="onDelete(item.id)">
                <VIcon icon="tabler-trash" class="text-error" />
              </IconBtn>
            </template>
          </VTooltip>
        </div>
      </template>

      <!-- Empty -->
      <template #no-data>
        <div class="py-8 text-center text-medium-emphasis">
          <VIcon icon="tabler-folder-off" class="mb-2" />
          <div>No hay permisos para mostrar.</div>
        </div>
      </template>
    </VDataTable>

    <!-- Igual que roles -->
    <PermissionDialog />
    <PermissionDrawer />
  </VCard>
</template>

<script lang="ts">
import PermissionDialog from '@/views/apps/permissions/PermissionDialog.vue'
import PermissionDrawer from '@/views/apps/permissions/PermissionDrawer.vue'
export default {}
</script>
