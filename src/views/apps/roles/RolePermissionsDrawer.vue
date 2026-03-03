<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { usePermissionsStore } from '@/stores/permissions.store'
import { useRolesStore } from '@/stores/roles.store'
import { computed, onMounted } from 'vue'

const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const { success, error } = useSwal()

onMounted(async () => {
  if (!permissionsStore.permissions.length)
    await permissionsStore.fetchPermissions()
})

const allNames = computed(() => permissionsStore.permissions.map(p => p.name))

// agrupar por prefijo para UX (users.*, rbac.*, inventario.*)
const grouped = computed(() => {
  const map: Record<string, string[]> = {}
  for (const name of allNames.value) {
    const prefix = (name.split('.')[0] || 'otros').toLowerCase()
    ;(map[prefix] ||= []).push(name)
  }
  Object.keys(map).forEach(k => map[k].sort())
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
})

const toggleGroup = (groupNames: string[]) => {
  const set = new Set(rolesStore.selectedPermissions)
  const allSelected = groupNames.every(n => set.has(n))

  if (allSelected) groupNames.forEach(n => set.delete(n))
  else groupNames.forEach(n => set.add(n))

  rolesStore.selectedPermissions = Array.from(set).sort()
}

const onSave = async () => {
  try {
    await rolesStore.syncRolePermissions()
    await success('Listo', 'Permisos asignados correctamente.')
    rolesStore.closePermissionsDrawer()
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.response?.data?.message ?? 'No se pudieron asignar permisos.'
    await error('Error', msg)
  }
}
</script>

<template>
  <VNavigationDrawer
    v-model="rolesStore.permissionsDrawerOpen"
    location="right"
    temporary
    width="520"
    class="app-drawer"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div>
        <div class="text-subtitle-1 font-weight-medium">
          Asignar permisos
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Rol: <b>{{ rolesStore.permissionsRoleName }}</b>
        </div>
      </div>

      <IconBtn @click="rolesStore.closePermissionsDrawer()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <div class="px-6 py-5">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center gap-2">
          <VIcon icon="tabler-key" />
          <div class="text-body-1 font-weight-medium">Permisos disponibles</div>
        </div>

        <VChip size="small" variant="tonal">
          {{ rolesStore.selectedPermissions.length }} seleccionados
        </VChip>
      </div>

      <VAlert variant="tonal" type="info" class="mb-4">
        Recomendación: usa permisos con formato <b>modulo.accion</b> (ej: <code>users.create</code>).
      </VAlert>

      <VExpansionPanels multiple>
        <VExpansionPanel v-for="[group, items] in grouped" :key="group">
          <VExpansionPanelTitle>
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center gap-2">
                <VIcon icon="tabler-folders" size="18" class="text-medium-emphasis" />
                <span class="font-weight-medium">{{ group }}</span>
              </div>

              <div class="d-flex align-center gap-2">
                <VBtn
                  size="small"
                  variant="tonal"
                  @click.stop="toggleGroup(items)"
                >
                  Seleccionar
                </VBtn>
              </div>
            </div>
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <VList density="compact">
              <VListItem v-for="name in items" :key="name">
                <template #prepend>
                  <VCheckbox
                    :model-value="rolesStore.selectedPermissions.includes(name)"
                    @update:model-value="val => {
                      const set = new Set(rolesStore.selectedPermissions)
                      if (val) set.add(name)
                      else set.delete(name)
                      rolesStore.selectedPermissions = Array.from(set).sort()
                    }"
                  />
                </template>

                <VListItemTitle class="text-body-2">
                  {{ name }}
                </VListItemTitle>
              </VListItem>
            </VList>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <div class="d-flex gap-3 mt-6">
        <VBtn color="primary" :loading="rolesStore.permissionsSaving" @click="onSave">
          <VIcon icon="tabler-device-floppy" class="me-1" />
          Guardar permisos
        </VBtn>

        <VBtn variant="tonal" color="secondary" :disabled="rolesStore.permissionsSaving" @click="rolesStore.closePermissionsDrawer()">
          Cancelar
        </VBtn>
      </div>
    </div>
  </VNavigationDrawer>
</template>
