<script setup lang="ts">
import ZonasList from '@/views/catalogs/zonas/ZonasList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Zonas</h4>
      <p class="text-body-1 mb-0">
        Administra zonas para clasificar clientes (crear, editar, eliminar).
      </p>
    </VCol>

    <VCol cols="12">
      <ZonasList />
    </VCol>
  </VRow>
</template>
