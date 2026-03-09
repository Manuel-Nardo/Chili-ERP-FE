<script setup lang="ts">
import { useSwal } from '@/composables/useSwal'
import { useOrderTypeAssignmentSchedulesStore } from '@/stores/catalogs/order_type_assignment_schedules.store'
import { computed, ref } from 'vue'

const { confirmDelete } = useSwal()
const store = useOrderTypeAssignmentSchedulesStore()

const formRef = ref<any>()

const headers = [
  { title: 'Día', key: 'dia_semana' },
  { title: 'Hora inicio', key: 'hora_inicio' },
  { title: 'Hora fin', key: 'hora_fin' },
  { title: 'Activo', key: 'activo' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const dayItems = [
  { title: 'Lunes', value: 1 },
  { title: 'Martes', value: 2 },
  { title: 'Miércoles', value: 3 },
  { title: 'Jueves', value: 4 },
  { title: 'Viernes', value: 5 },
  { title: 'Sábado', value: 6 },
  { title: 'Domingo', value: 7 },
]

const formTitle = computed(() =>
  store.isEdit ? 'Editar horario' : 'Nuevo horario',
)

const formSubtitle = computed(() =>
  store.isEdit
    ? 'Actualiza el horario personalizado seleccionado.'
    : 'Captura un nuevo horario personalizado para esta asignación.',
)

const onDelete = async (id: number) => {
  const ok = await confirmDelete({
    title: '¿Eliminar horario?',
    text: 'Esta acción no se puede deshacer.',
  })

  if (!ok) return
  await store.deleteItem(id)
}

const onSubmit = async () => {
  const result = await formRef.value?.validate()

  const isValid =
    typeof result === 'boolean'
      ? result
      : !!result?.valid

  if (!isValid) return

  await store.saveFromDialog()
}

const onNew = () => {
  store.resetForm()
}

const onCancelEdit = () => {
  store.resetForm()
}
</script>

<template>
  <VDialog
    v-model="store.dialogOpen"
    max-width="1280"
    persistent
    scrollable
  >
    <VCard class="assignment-schedules-dialog">
      <VCardText class="pa-6">
        <div class="d-flex flex-wrap align-start justify-space-between gap-4 mb-6">
          <div>
            <div class="d-flex align-center gap-2 mb-1">
              <VIcon icon="tabler-clock-cog" />
              <h4 class="text-h5 mb-0">Horarios personalizados</h4>
            </div>

            <div class="text-body-2 text-medium-emphasis">
              Administra los horarios específicos para esta asignación.
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              variant="tonal"
              :loading="store.loading"
              :disabled="store.loading"
              @click="store.fetchItems()"
            >
              <VIcon icon="tabler-refresh" class="me-1" />
              Refrescar
            </VBtn>

            <VBtn
              color="primary"
              @click="onNew"
            >
              <VIcon icon="tabler-plus" class="me-1" />
              Nuevo horario
            </VBtn>

            <VBtn
              color="secondary"
              variant="tonal"
              @click="store.closeManager()"
            >
              Cerrar
            </VBtn>
          </div>
        </div>

        <VAlert
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-6"
        >
          <div class="d-flex flex-column flex-md-row gap-2 gap-md-6">
            <div>
              <strong>Sucursal:</strong>
              {{ store.selectedAssignment?.cliente?.nombre ?? '—' }}
            </div>

            <div>
              <strong>Tipo de pedido:</strong>
              {{ store.selectedAssignment?.tipo_pedido?.nombre ?? '—' }}
            </div>
          </div>
        </VAlert>

        <VRow class="ma-0">
          <VCol cols="12" md="7" class="pa-0 pe-md-3">
            <VCard variant="outlined" class="h-100">
              <VCardItem>
                <VCardTitle class="text-subtitle-1 font-weight-semibold">
                  Listado de horarios
                </VCardTitle>
                <VCardSubtitle>
                  Un registro por día configurado para esta asignación.
                </VCardSubtitle>
              </VCardItem>

              <VDivider />

              <VDataTable
                :headers="headers"
                :items="store.items"
                :loading="store.loading"
                item-value="id"
                density="comfortable"
                class="text-no-wrap"
              >
                <template #item.dia_semana="{ item }">
                  <div class="d-flex align-center gap-2">
                    <VIcon
                      icon="tabler-calendar-week"
                      size="18"
                      class="text-medium-emphasis"
                    />
                    <span class="font-weight-medium">
                      {{ store.dayMap[item.dia_semana] ?? '—' }}
                    </span>
                  </div>
                </template>

                <template #item.hora_inicio="{ item }">
                  <span>{{ item.hora_inicio?.slice(0, 5) ?? '—' }}</span>
                </template>

                <template #item.hora_fin="{ item }">
                  <span>{{ item.hora_fin?.slice(0, 5) ?? '—' }}</span>
                </template>

                <template #item.activo="{ item }">
                  <VChip
                    size="small"
                    :color="item.activo ? 'success' : 'secondary'"
                    variant="tonal"
                  >
                    <VIcon
                      :icon="item.activo ? 'tabler-check' : 'tabler-minus'"
                      size="16"
                      class="me-1"
                    />
                    {{ item.activo ? 'Activo' : 'Inactivo' }}
                  </VChip>
                </template>

                <template #item.actions="{ item }">
                  <div class="d-flex justify-end gap-1">
                    <VTooltip text="Editar horario" location="top">
                      <template #activator="{ props }">
                        <IconBtn v-bind="props" @click="store.openEdit(item)">
                          <VIcon icon="tabler-edit" />
                        </IconBtn>
                      </template>
                    </VTooltip>

                    <VTooltip text="Eliminar horario" location="top">
                      <template #activator="{ props }">
                        <IconBtn v-bind="props" @click="onDelete(item.id)">
                          <VIcon icon="tabler-trash" class="text-error" />
                        </IconBtn>
                      </template>
                    </VTooltip>
                  </div>
                </template>

                <template #no-data>
                  <div class="py-10 text-center text-medium-emphasis">
                    <VIcon icon="tabler-folder-off" class="mb-2" />
                    <div>No hay horarios personalizados para mostrar.</div>
                  </div>
                </template>
              </VDataTable>
            </VCard>
          </VCol>

          <VCol cols="12" md="5" class="pa-0 ps-md-3 mt-4 mt-md-0">
            <VCard variant="outlined">
              <VCardItem>
                <VCardTitle class="text-subtitle-1 font-weight-semibold">
                  {{ formTitle }}
                </VCardTitle>
                <VCardSubtitle>
                  {{ formSubtitle }}
                </VCardSubtitle>
              </VCardItem>

              <VDivider />

              <VCardText class="pt-5">
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

                    <VCol cols="12">
                      <div class="d-flex flex-wrap gap-3">
                        <VBtn
                          type="submit"
                          color="primary"
                          :loading="store.saving"
                        >
                          {{ store.isEdit ? 'Actualizar' : 'Guardar' }}
                        </VBtn>

                        <VBtn
                          type="button"
                          color="warning"
                          variant="tonal"
                          @click="onCancelEdit"
                        >
                          Limpiar
                        </VBtn>
                      </div>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.assignment-schedules-dialog :deep(.v-card) {
  border-radius: 14px;
}
</style>
