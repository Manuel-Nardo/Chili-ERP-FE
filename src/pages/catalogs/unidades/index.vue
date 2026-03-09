<script setup lang="ts">
import UnidadesList from '@/views/catalogs/unidades/UnidadesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Unidades</h4>
      <p class="text-body-1 mb-0">
        Administra las unidades de medida para productos y compras.
      </p>
    </VCol>

    <VCol cols="12">
      <UnidadesList />
    </VCol>
  </VRow>
</template>
