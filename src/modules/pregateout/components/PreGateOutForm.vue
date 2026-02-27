<template>
    
    <VDialog
      v-model="editModal"
      persistent
      max-width="800px"
    >
      <DialogCloseBtn @click="editModal = false" />
      <VCard>
        <VCardTitle>Edit Pre Gate Out</VCardTitle>
        <Form ref="refForm" @submit.prevent="submitForm" :validation-schema="schema" v-slot="{ errors, handleSubmit }">
          <VCardText>
            <v-alert
              v-if="Object.keys(errors).length"
              type="warning"
              class="mb-4"
              title="Alert! 'You missed  fields."
              border="start"
            >
              <ul class="ma-0 pa-0">
                <li
                  v-for="(msg, field) in errors"
                  :key="field"
                  class="text-body-2"
                >
                  {{ msg }}
                </li>
              </ul>
            </v-alert>

            <VRow>
              <!-- 👉 GOUT -->
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="selectedItem.btt"
                  :items="gout"
                  label="Gate out"
                  placeholder="Select an option"
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VLabel text="Trailer Load Status" v-if="selectedItem.btt!='Tractor'"/>
                
                <Field name="trailer_load_status" v-slot="{ field, meta, errorMessage }" v-if="selectedItem.btt!='Tractor'" >
                    <VSelect
                      v-if="selectedItem.btt!='Tractor'"
                      v-bind="field"
                      :items="load"
                      v-model="selectedItem.trailer_load_status"
                      placeholder="Select trailer load status"
                      :error="meta.touched && !!meta.error"
                      :error-messages="meta.touched ? meta.error : []"
                      :class="{ 'input-error': meta.touched && errorMessage }"
                      />
                </Field>

                <AppSelect
                  v-else
                  v-model="selectedItem.trailer_load_status"
                  :items="load"
                  label="Trailer Load Status"
                  placeholder="Select trailer load status"
                  disabled="true"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VLabel text="Fuel Level" />
                <Field name="fuellevel" v-slot="{ field, meta, errorMessage }">
                  <VSelect
                      v-bind="field"
                      :items="fuel"
                      v-model="selectedItem.fuel_level"
                      placeholder="Select fuel level"
                      :error="meta.touched && !!meta.error"
                      :error-messages="meta.touched ? meta.error : []"
                      :class="{ 'input-error': meta.touched && errorMessage }"
                      />
                  </Field>
              </VCol>

              <VCol cols="12" md="6">
                <VLabel text="Company" />
                <Field name="customer" v-slot="{ field, meta, errorMessage }">
                    <VSelect
                      v-bind="field"
                      :items="customer"
                      v-model="selectedItem.customer_id"
                      placeholder="Select customer"
                      @update:model-value="selectSubCarrier"
                      :error="meta.touched && !!meta.error"
                      :error-messages="meta.touched ? meta.error : []"
                      :class="{ 'input-error': meta.touched && errorMessage }"
                      />
                  </Field>
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="selectedItem.sub_carried_id"
                  :items="subcarrier"
                  label="Select Sub Carrier"
                  placeholder="Select Sub carrier"
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VLabel text="Tractor No" v-if="selectedItem.btt!='Trailer'"/>
                <Field name="tractor_no" v-slot="{ field, meta, errorMessage }" v-if="selectedItem.btt!='Trailer'" >
                  <VTextField
                    v-if="selectedItem.btt!='Trailer'"
                    v-bind="field"
                    v-model="selectedItem.tractor_no"
                    placeholder="Tractor number"
                    :error="meta.touched && !!meta.error"
                    :error-messages="meta.touched ? meta.error : []"
                    :class="{ 'input-error': meta.touched && errorMessage }"
                  />
                </Field>

                <AppTextField
                  v-else 
                  v-model="selectedItem.tractor_no"
                  label="Tractor No"
                  placeholder="Tractor number"
                  disabled="true"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VLabel text="Trailer No" v-if="selectedItem.btt!='Tractor'"/>
                <Field name="trailer_no" v-slot="{ field, meta, errorMessage }" v-if="selectedItem.btt!='Tractor'">
                  <VTextField
                    v-if="selectedItem.btt!='Tractor'"
                    v-bind="field"
                    v-model="selectedItem.trailer_no"
                    placeholder="Trailer number"
                    :error="meta.touched && !!meta.error"
                    :error-messages="meta.touched ? meta.error : []"
                    :class="{ 'input-error': meta.touched && errorMessage }"
                  />
                </Field>
                <AppTextField
                  v-else
                  v-model="selectedItem.trailer_no"
                  label="Trailer No"
                  placeholder="Trailer number"
                  disabled="true"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="selectedItem.chassis_no"
                  label="Chassis No"
                  placeholder="Chassis number"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="selectedItem.seal_no"
                  label="Seal No"
                  placeholder="Seal number"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VLabel text="Driver"/>
                <Field name="driver" v-slot="{ field, meta,errorMessage}"> 
                   <VTextField
                    v-bind="field"
                    v-model="selectedItem.driver_name"
                    placeholder="Driver's name"
                    :error="meta.touched && !!meta.error"
                    :error-messages="meta.touched ? meta.error : []"
                    :class="{ 'input-error': meta.touched && errorMessage }"
                  />
                </Field>
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="selectedItem.reservation_no"
                  label="Reservation number"
                  placeholder="Reservation number"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="selectedItem.license_number"
                  label="License plate"
                  placeholder="License plate"
                />
              </VCol>

              <VCol cols="12" md="6">
                <Field name="dateout" v-slot="{ field, meta, errorMessage }">
                  <AppDateTimePicker
                    v-bind="field"
                    :model-value="selectedItem.checkout"
                    v-model="selectedItem.checkout"
                    label="Date Out"
                    placeholder="Select date out"
                    :config="{ enableTime: false }"
                    :error="meta.touched && !!meta.error"
                    :error-messages="meta.touched ? meta.error : []"
                    :class="{ 'is-invalid': meta.touched && errorMessage }"
                  />
                </Field>
              </VCol>
              
              <VCol cols="12" md="6">
                <!--
                  <VTextField
                      
                      v-model="selectedItem.time_out"
                      placeholder="__:__:__"
                      v-mask="'##:##:##'"
                      :error="meta.touched && !!meta.error"
                      :error-messages="meta.touched ? meta.error : []"
                      :class="{ 'input-error': meta.touched && errorMessage }"
                      maxlength="8"
                    />-->
                
                <Field name="timeout" v-slot="{ field, meta, errorMessage }">
                   <AppDateTimePicker
                    v-bind="field"
                    v-model="selectedItem.time_out"
                    :model-value="selectedItem.time_out"
                    :config="timePickerConfig"
                    label="Time out"
                    type="time"
                    placeholder="HH:mm:ss"
                    :error="meta.touched && !!meta.error"
                    :error-messages="meta.touched ? meta.error : []"
                    :class="{ 'is-invalid': meta.touched && errorMessage }"
                  />
                </Field>
              </VCol>

              <!-- 👉 images -->
              <VCol cols="12" md="6">
                <VLabel>License plate frame</VLabel>
                <VImg
                  :src="selectedItem.license_plate_frame"
                  
                  class="w-100 mx-auto"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VLabel>License plate roi</VLabel>
                <VImg
                  :src="selectedItem.license_plate_roi"
                  class="w-100 mx-auto"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VLabel>Container numbre frame</VLabel>
                <VImg
                  :src="selectedItem.container_number_frame"
                  class="w-100 mx-auto"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VLabel>Container numbre roi</VLabel>
                <VImg
                  :src="selectedItem.container_number_roi"
                  class="w-100 mx-auto"
                />
              </VCol>
            </VRow>
          </VCardText>  
          <VCardActions>
            <VCol cols="12" md="9"/>

            <VCol cols="12" md="3">
              <VBtn
                type="reset"
                color="error"
                variant="tonal"
                class="mr-3"
                @click="editModal = false"
              >Cancel
              </VBtn>
              <VBtn
                type="submit"
                color="warning"
                variant="tonal"
                @click="() => {
                  if (refForm?.validate) {
                    refForm.validate().then(res => {
                      valida = res
                    })
                  }
                }"
              >Update
              </VBtn>
            </VCol>
          </VCardActions>
        </Form>
      </VCard>
    </VDialog>
</template>
<script setup>
import { Field, Form, useForm } from 'vee-validate';
import * as yup from 'yup';

import { usePreAiGateOutStore } from '../stores/aiPreGateOutStore';
const store = usePreAiGateOutStore()

const {  selectedItem, editModal,customer,valida,refForm,error } = storeToRefs(store)
const {  selectSubCarrier, submitForm } = store


// Validation schema
const schema = yup.object({
  trailer_load_status: yup.string().required('Trailer load status is required'),
  fuellevel: yup.string().required('Trailer fuel level is required'),
  customer: yup.string().required('Company is required'),
  tractor_no: yup.string().required('Tractor number is required'),
  trailer_no: yup.string().required('Trailer number is required'),
  driver: yup.string().required('Driver is required'),
  dateout : yup.date().max(new Date(), 'Date must be not in the future').required('Date out is required'), 
  timeout: yup.string().required('Time out is required').matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Invalid time format (HH:mm:ss)'),
})

// Access form context
const { errors } = useForm({ validationSchema: schema })

const timePickerConfig = {
  enableTime: true,
  noCalendar: true,
  enableSeconds: true,
  time_24hr: true,
  dateFormat: 'H:i:S', // HH:mm:ss
}

const gout = [
  'Both',
  'Trailer',
  'Tractor',
]

const load = [
  'Empty',
  'Loaded',
]

const fuel = [
  'N/A',
  '20% Fuel',
  '40% Fuel',
  '60% Fuel',
  '80% Fuel',
  '100% Fuel',
]
</script>
<style scoped>
.input-error  {
  border: 2px solid rgb(255, 204, 0) !important;
  border-radius: 4px;
}

.is-invalid {
  border-color: rgb(255, 204, 0) !important;
}
</style>
