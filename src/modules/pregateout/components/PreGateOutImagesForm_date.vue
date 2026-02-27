<template>

    <VDialog
      v-model="imageModal"
      max-width="900px"
    >
      <DialogCloseBtn @click="imageModal = false" />
      <VCard>
        <VCardTitle>Pre Gate Out Images</VCardTitle>
        <VCardText>
{{ selectedItem.date_out }}
         <Field name="birthDate" v-slot="{ field, meta, errorMessage }">
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="formatDate(field.value)"
                  label="Fecha de nacimiento"
                  readonly
                  prepend-icon="mdi-calendar"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  :class="{ 'input-error': meta.touched && errorMessage }"
                />
              </template>

              <v-date-picker
                v-model="internalDate"
                @update:modelValue="val => selectDate(val, field)"
                color="primary"
              />
            </v-menu>
          </Field>
          
        </VCardText>
        <VCardActions>
          <VBtn
            type="reset"
            color="error"
            variant="tonal"
            @click="imageModal = false"
          >
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
</template>
<script setup>
import { usePreAiGateOutStore } from '../stores/aiPreGateOutStore';
const store = usePreAiGateOutStore()

const {  selectedItem, imageModal } = storeToRefs(store)

import { Field } from 'vee-validate';
import { ref } from 'vue';
import * as yup from 'yup';

// 🎯 Formato a usar
const DATE_FORMAT = 'dd/MM/yyyy'

// Estado del menú y valor interno del date-picker
const menu = ref(false)
const internalDate = ref(null)

// Esquema de validación con Yup
const schema = yup.object({
  birthDate: yup
    .string()
    .required('La fecha de nacimiento es obligatoria')
})

// Selección de fecha desde date-picker
function selectDate(date, field) {
  const formatted = format(new Date(date), DATE_FORMAT)
  field.value = formatted
  internalDate.value = date
  menu.value = false
}

// Formateo de fecha para mostrar en input
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const parsed = parse(dateString, DATE_FORMAT, new Date())
    return format(parsed, DATE_FORMAT)
  } catch {
    return dateString
  }
}


</script>
