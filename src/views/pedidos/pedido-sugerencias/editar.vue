<script setup lang="ts">
import { usePedidoSugerenciasStore } from '@/stores/pedidos/pedido-sugerencias.store'
import PedidoSugerenciaWorkspace from '@/views/pedidos/pedido-sugerencias/PedidoSugerenciaWorkspace.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const store = usePedidoSugerenciasStore()
const route = useRoute()

onMounted(async () => {
  const id = Number(route.params.id)

  console.log('[PedidoEdit] route.params.id', route.params.id)
  console.log('[PedidoEdit] parsed id', id)

  store.resetForm()
  await store.prepareWorkspace()

  if (!id) {
    console.warn('[PedidoEdit] id inválido')
    return
  }

  await store.fetchById(id)

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
