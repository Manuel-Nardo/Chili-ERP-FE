<script setup lang="ts">
import TiposClientesList from '@/views/catalogs/client_types/TiposClientesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Tipos de Cliente</h4>
      <p class="text-body-1 mb-0">
        Administra el catálogo de tipos (INTERNO / EXTERNO).
      </p>
    </VCol>

    <VCol cols="12">
      <TiposClientesList />
    </VCol>
  </VRow>
</template>
