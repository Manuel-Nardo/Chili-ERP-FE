<script setup lang="ts">
import RolesList from '@/views/apps/roles/RolesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Lista de Roles</h4>
      <p class="text-body-1 mb-0">
        Administra roles del sistema (crear, editar, eliminar).
      </p>
    </VCol>

    <VCol cols="12">
      <RolesList />
    </VCol>
  </VRow>
</template>
