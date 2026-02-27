<template>
  <v-container fluid class="py-4">
    <!-- Header de bienvenida -->
    <v-row align="center" justify="space-between" class="mb-6">
      <v-col cols="12" md="6">
        <h1 class="text-h5 font-weight-bold">¡Bienvenido, {{ auth.user?.name || 'Usuario' }}!</h1>
        <p class="text-body-2 text-medium-emphasis">Dashboard de Movimientos</p>
      </v-col>

      <v-col cols="12" md="6" class="text-md-end">
        <v-btn variant="text" color="primary" @click="logout">
          Cerrar sesión
        </v-btn>
      </v-col>
    </v-row>

    <!-- Contenido del dashboard -->
    <v-row dense>
      <!-- Movimientos del día -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <h2 class="text-subtitle-1 font-weight-medium mb-4">Movimientos del día</h2>
          <div style="min-height: 300px;">
            <MovimientosChart :data="resumenMovimientos" />
          </div>
        </v-card>
      </v-col>

      <!-- Movimientos por Yard -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <h2 class="text-subtitle-1 font-weight-medium mb-4">Movimientos por Yard (hoy)</h2>
          <div style="min-height: 300px;">
            <MovimientosPorYardChart :data="movimientosPorYarda" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mt-6">
      <v-col cols="6" md = "6">
        <VehiclesOverviewWidget />
      </v-col>
    </v-row>
  </v-container>
</template>
  
  <script setup lang="ts">
  import MovimientosChart from '@/modules/admin/components/MovimientosChart.vue'
import MovimientosPorYardChart from '@/modules/admin/components/MovimientosPorYardChart.vue'
import VehiclesOverviewWidget from '@/modules/admin/components/VehiclesOverviewWidget.vue'
import { useHomeStore } from '@/modules/admin/stores/home'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
  
  const auth = useAuthStore()
  const router = useRouter()

  const { resumenMovimientos,movimientosPorYarda } = storeToRefs(useHomeStore())
  const { cargarResumenMovimientos,cargarMovimientosPorYarda } = useHomeStore()

  onMounted(() => {
    cargarResumenMovimientos()
    cargarMovimientosPorYarda()
  })


  
  const logout = () => {
    auth.logout()
    router.push('/login')
  }
  </script>
