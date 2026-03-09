<script setup lang="ts">
import OrderTypeSchedulesList from '@/views/catalogs/order_type_schedules/OrderTypeSchedulesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Horarios Default de Tipos de Pedido</h4>
      <p class="text-body-1 mb-0">
        Configura los días y horarios por defecto para cada tipo de pedido.
      </p>
    </VCol>

    <VCol cols="12">
      <OrderTypeSchedulesList />
    </VCol>
  </VRow>
</template>
