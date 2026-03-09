<script setup lang="ts">
import ProductosList from '@/views/catalogs/productos/ProductosList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Productos</h4>
      <p class="text-body-1 mb-0">
        Administra los productos del catálogo, sus unidades, línea, tipo de pedido e impuestos.
      </p>
    </VCol>

    <VCol cols="12">
      <ProductosList />
    </VCol>
  </VRow>
</template>
