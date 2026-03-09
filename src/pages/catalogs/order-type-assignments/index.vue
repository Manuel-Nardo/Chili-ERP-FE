<script setup lang="ts">
import OrderTypeAssignmentsList from '@/views/catalogs/order_type_assignments/OrderTypeAssignmentsList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Asignación de Tipos de Pedido</h4>
      <p class="text-body-1 mb-0">
        Asigna tipos de pedido a sucursales y define si usarán el horario default.
      </p>
    </VCol>

    <VCol cols="12">
      <OrderTypeAssignmentsList />
    </VCol>
  </VRow>
</template>
