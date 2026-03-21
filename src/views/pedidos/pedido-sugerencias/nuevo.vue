<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import PedidoSugerenciaWorkspace from '@/views/pedidos/pedido-sugerencias/PedidoSugerenciaWorkspace.vue'
import { onMounted } from 'vue'

const store = usePedidoSugerenciasStore()

onMounted(async () => {
  store.resetForm()
  await store.prepareWorkspace()
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <PedidoSugerenciaWorkspace />
      </VCol>
    </VRow>
  </div>
</template>
