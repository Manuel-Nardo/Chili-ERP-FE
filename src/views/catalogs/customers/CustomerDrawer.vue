<script setup lang="ts">
import { useCustomersStore } from '@/stores/catalogs/customers.store'
import { useTiposClientesStore } from '@/stores/catalogs/tipos_clientes.store'
import { useZonasStore } from '@/stores/catalogs/zonas.store'
import { computed, ref } from 'vue'

const store = useCustomersStore()
const zonasStore = useZonasStore()
const tiposStore = useTiposClientesStore()

const formRef = ref<any>()
const title = computed(() => (store.isEdit ? 'Editar cliente' : 'Nuevo cliente'))

const zonaItems = computed(() =>
  zonasStore.zonas.map(z => ({ title: z.nombre, value: z.id })),
)

const tipoItems = computed(() =>
  tiposStore.tipos.map(t => ({ title: `${t.nombre} (${t.clave})`, value: t.id })),
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return
  await store.saveFromDialog()
}
</script>

<template>
  <VNavigationDrawer v-model="store.drawerOpen" location="right" temporary width="520" class="app-drawer">
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
            <AppTextField
              v-model="store.formNombre"
              label="Nombre"
              placeholder="Sucursal Centro"
              :rules="[v => !!String(v ?? '').trim() || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="store.formTipoClienteId"
              :items="tipoItems"
              label="Tipo de cliente"
              placeholder="Selecciona..."
              :rules="[v => !!v || 'Requerido']"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="store.formZonaId"
              :items="zonaItems"
              label="Zona"
              placeholder="Selecciona..."
              clearable
            />
          </VCol>

          <VCol cols="12">
            <VSwitch v-model="store.formActivo" label="Activo" inset />
          </VCol>

          <VCol cols="12">
            <VDivider class="my-2" />
            <div class="text-subtitle-2 mb-2">Backoffice</div>
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formContacto"
              label="Contacto"
              placeholder="Nombre del contacto"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formTelefono"
              label="Teléfono"
              placeholder="9510000000"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formEmail"
              label="Email"
              placeholder="contacto@empresa.com"
              :rules="store.formEmail?.trim() ? [v => /.+@.+\..+/.test(String(v ?? '')) || 'Email inválido'] : []"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="store.formDireccion"
              label="Dirección"
              placeholder="Calle, número, colonia..."
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formCp"
              label="CP"
              placeholder="68000"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="store.formCondicionPago"
              label="Condición de pago"
              placeholder="CONTADO / CREDITO 15 DIAS..."
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-4">
            <VBtn type="submit" color="primary" :loading="store.saving">
              Guardar
            </VBtn>

            <VBtn type="button" color="warning" variant="tonal" @click="store.closeDrawer(); store.resetForm()">
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VNavigationDrawer>
</template>
