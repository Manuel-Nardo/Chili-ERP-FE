<script setup lang="ts">
import { useOrderTypeAssignmentSchedulesStore } from '@/stores/catalogs/order_type_assignment_schedules.store'
import { computed, ref } from 'vue'

const store = useOrderTypeAssignmentSchedulesStore()
const formRef = ref<any>()

const title = computed(() =>
  store.isEdit ? 'Editar horario personalizado' : 'Nuevo horario personalizado',
)

const dayItems = [
  { title: 'Lunes', value: 1 },
  { title: 'Martes', value: 2 },
  { title: 'Miércoles', value: 3 },
  { title: 'Jueves', value: 4 },
  { title: 'Viernes', value: 5 },
  { title: 'Sábado', value: 6 },
  { title: 'Domingo', value: 7 },
]

const onSubmit = async () => {
  const result = await formRef.value?.validate()

  const isValid =
    typeof result === 'boolean'
      ? result
      : !!result?.valid

  if (!isValid) return

  await store.saveFromDialog()
}
</script>

<template>
  <VNavigationDrawer
    v-model="store.drawerOpen"
    location="right"
    temporary
    width="460"
    class="app-drawer"
  >
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <div class="text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>

      <IconBtn @click="store.closeDrawer(); store.resetForm()">
        <VIcon icon="tabler-x" />
      </IconBtn>
    </div>

    <VDivider />

    <div class="px-6 py-5">
      <VAlert
        type="info"
        variant="tonal"
        class="mb-4"
      >
        <div class="text-body-2">
          <strong>Sucursal:</strong>
          {{ store.selectedAssignment?.cliente?.nombre ?? '—' }}
        </div>
        <div class="text-body-2 mt-1">
          <strong>Tipo de pedido:</strong>
          {{ store.selectedAssignment?.tipo_pedido?.nombre ?? '—' }}
        </div>
      </VAlert>

      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <AppSelect
              v-model="store.formDiaSemana"
              :items="dayItems"
              label="Día"
              placeholder="Selecciona un día"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formHoraInicio"
              label="Hora inicio"
              type="time"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formHoraFin"
              label="Hora fin"
              type="time"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <VSwitch
              v-model="store.formActivo"
              label="Activo"
              inset
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-4">
            <VBtn type="submit" color="primary" :loading="store.saving">
              Guardar
            </VBtn>

            <VBtn
              type="button"
              color="warning"
              variant="tonal"
              @click="store.closeDrawer(); store.resetForm()"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
