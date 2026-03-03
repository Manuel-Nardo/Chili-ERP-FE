<script setup lang="ts">
import PermissionsList from '@/views/apps/permissions/PermissionsList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Lista de Permisos</h4>
      <p class="text-body-1 mb-0">
        Administra permisos del sistema (crear, editar, eliminar).
      </p>
    </VCol>

    <VCol cols="12">
      <PermissionsList />
    </VCol>
  </VRow>
</template>
