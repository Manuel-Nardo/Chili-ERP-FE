<script setup lang="ts">
import OrderTypesList from '@/views/catalogs/order_types/OrderTypesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Tipos de Pedido</h4>
      <p class="text-body-1 mb-0">
        Administra el catálogo de tipos de pedido.
      </p>
    </VCol>

    <VCol cols="12">
      <OrderTypesList />
    </VCol>
  </VRow>
</template>
