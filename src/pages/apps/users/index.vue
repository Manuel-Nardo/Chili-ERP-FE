<script setup lang="ts">
import UsersList from '@/views/apps/users/UsersList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Lista de Usuarios</h4>
      <p class="text-body-1 mb-0">
        Administra usuarios del sistema (crear, editar, eliminar).
      </p>
    </VCol>

    <VCol cols="12">
      <UsersList />
    </VCol>
  </VRow>
</template>
