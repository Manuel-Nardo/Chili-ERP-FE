<script setup lang="ts">
import PedidoSugerenciasList from '@/views/pedidos/pedido-sugerencias/PedidoSugerenciasList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Prepedidos</h4>
      <p class="text-body-1 mb-0">
        Administra prepedidos manuales y sugeridos, con una operación visual consistente.
      </p>
    </VCol>

    <VCol cols="12">
      <PedidoSugerenciasList />
    </VCol>
  </VRow>
</template>
