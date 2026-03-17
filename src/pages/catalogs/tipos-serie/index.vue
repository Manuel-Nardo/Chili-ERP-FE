<script setup lang="ts">
import TiposSerieList from '@/views/catalogs/tipos-serie/TiposSerieList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Tipos de serie</h4>
      <p class="text-body-1 mb-0">
        Administra los tipos de serie para pedidos, remisiones, facturas y otros documentos.
      </p>
    </VCol>

    <VCol cols="12">
      <TiposSerieList />
    </VCol>
  </VRow>
</template>
