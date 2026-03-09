<script setup lang="ts">
import LineasList from '@/views/catalogs/lineas/LineasList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Líneas</h4>
      <p class="text-body-1 mb-0">
        Administra las líneas para clasificar los productos del catálogo.
      </p>
    </VCol>

    <VCol cols="12">
      <LineasList />
    </VCol>
  </VRow>
</template>
