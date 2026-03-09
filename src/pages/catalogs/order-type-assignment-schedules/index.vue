<script setup lang="ts">
import OrderTypeAssignmentSchedulesList from '@/views/catalogs/order_type_assignment_schedules/OrderTypeAssignmentSchedulesList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Horarios por Sucursal</h4>
      <p class="text-body-1 mb-0">
        Configura horarios personalizados por sucursal para tipos de pedido.
      </p>
    </VCol>

    <VCol cols="12">
      <OrderTypeAssignmentSchedulesList />
    </VCol>
  </VRow>
</template>
