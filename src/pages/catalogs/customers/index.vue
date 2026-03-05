<script setup lang="ts">
import CustomersList from '@/views/catalogs/customers/CustomersList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Clientes</h4>
      <p class="text-body-1 mb-0">
        Administra clientes (internos/externos) y su información de backoffice.
      </p>
    </VCol>

    <VCol cols="12">
      <CustomersList />
    </VCol>
  </VRow>
</template>
