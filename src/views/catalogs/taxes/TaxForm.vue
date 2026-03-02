<script setup lang="ts">
import { useTaxesStore } from '@/stores/catalogs/taxes.store';
import { computed, ref, watchEffect } from 'vue';

const props = defineProps<{
  id: number | null
}>()

const store = useTaxesStore()
const formRef = ref()

const isEdit = computed(() => !!props.id)

watchEffect(() => {
  if (props.id) store.load(props.id)
  else store.clearForm()
})

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  await store.save(props.id)

  store.closeDrawer()
}
</script>

<template>
  <VForm ref="formRef" @submit.prevent="onSubmit">
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="store.form.name"
          label="Nombre"
          placeholder="IVA"
          :rules="[v => !!v || 'Requerido']"
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="store.form.rate"
          label="Tasa (%)"
          type="number"
          placeholder="16"
          :rules="[
            v => v !== '' || 'Requerido',
            v => Number(v) >= 0 || 'Debe ser >= 0',
            v => Number(v) <= 100 || 'Debe ser <= 100',
          ]"
        />
      </VCol>

      <VCol cols="12">
        <VSwitch
          v-model="store.form.active"
          label="Activo"
        />
      </VCol>

      <VCol cols="12" class="d-flex gap-4">
        <VBtn type="submit" :loading="store.saving">
          Guardar
        </VBtn>

        <VBtn
          type="button"
          color="secondary"
          variant="tonal"
          @click="store.clearForm()"
        >
          Reset
        </VBtn>
      </VCol>

      <VCol v-if="store.error" cols="12">
        <VAlert type="error" variant="tonal">
          {{ store.error }}
        </VAlert>
      </VCol>
    </VRow>
  </VForm>
</template>
