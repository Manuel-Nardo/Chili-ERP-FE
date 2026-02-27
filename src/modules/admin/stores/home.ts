import api from '@/services/api'
import { useWithLoading } from '@/utils/useWithLoading'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHomeStore = defineStore('home', () => {
    
    const resumenMovimientos = ref({})
    const movimientosPorYarda = ref([])

    const cargarResumenMovimientos = async () => {
        await useWithLoading(async () => {
            const response = await api.get('/auth/movimientosHoy')
            resumenMovimientos.value = response.data || {}
        })
    }
   
    const cargarMovimientosPorYarda = async () => {
        await useWithLoading(async () => {
        
        const response = await api.get('/auth/movimientosxYarda')
        movimientosPorYarda.value = response.data || []
        })
    }


    return {
        resumenMovimientos,
        movimientosPorYarda,
        cargarResumenMovimientos,
        cargarMovimientosPorYarda,
        
    }
})
