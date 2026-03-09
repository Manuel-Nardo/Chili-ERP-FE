<script setup lang="ts">
import { useCustomersStore } from '@/stores/catalogs/customers.store'
import { useOrderTypeAssignmentsStore } from '@/stores/catalogs/order_type_assignments.store'
import { useOrderTypesStore } from '@/stores/catalogs/order_types.store'
import { computed, ref } from 'vue'

const store = useOrderTypeAssignmentsStore()
const customersStore = useCustomersStore()
const orderTypesStore = useOrderTypesStore()

const formRef = ref<any>()

const title = computed(() =>
  store.isEdit ? 'Editar asignación' : 'Nueva asignación',
)

const customerItems = computed(() =>
  customersStore.customers.map(c => ({
    title: c.nombre,
    value: c.id,
  })),
)

const orderTypeItems = computed(() =>
  orderTypesStore.orderTypes.map(t => ({
    title: t.nombre,
    value: t.id,
  })),
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return
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
      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <AppSelect
              v-model="store.formClienteId"
              :items="customerItems"
              label="Sucursal"
              placeholder="Selecciona una sucursal"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="store.formTipoPedidoId"
              :items="orderTypeItems"
              label="Tipo de pedido"
              placeholder="Selecciona un tipo"
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <VSwitch
              v-model="store.formUsarHorarioDefault"
              label="Usar horario default"
              inset
              color="primary"
            />
            <div class="text-body-2 text-medium-emphasis">
              Si se desactiva, después podrás configurar horarios personalizados por sucursal.
            </div>
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
