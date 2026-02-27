<!-- src/components/pre-gate-in/PreGateInForm.vue -->
<template>
  <v-form>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-label>Is Bobtail?</v-label>
        <v-switch v-model="item.bobtail" color="success" inset />
      </v-col>

      <v-col cols="12" md="5">
        <v-select
          v-model="item.trailer_load_status"
          :items="['-', 'Empty', 'Loaded']"
          label="Trailer Load Status"
          clearable
          density="compact"
        />
      </v-col>

      <v-col cols="12" md="5">
        <v-select
          v-model="item.trailer_condition"
          :items="['-', 'Bad Order', 'Good Order']"
          label="Trailer Condition"
          clearable
          density="compact"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.tractor_no" label="Tractor No" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.trailer_no" label="Trailer No" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.chassis_no" label="Chassis" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.seal_no" label="Seal No" type="number" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.driver_name" label="Driver Name" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.plate_number" label="License Plate" />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="item.comments"
          label="Comments"
          auto-grow
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.date_in" type="date" label="Date In" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field v-model="item.time_in" type="time" label="Time In" />
      </v-col>

      <!-- Imágenes -->
      <v-col cols="12" md="6">
        <v-label>License Plate Frame</v-label>
        <v-img :src="item.license_plate_frame || fallbackImage" cover max-height="250" class="rounded" />
      </v-col>

      <v-col cols="12" md="6">
        <v-label>License Plate ROI</v-label>
        <v-img :src="item.license_plate_roi || fallbackImage" cover max-height="250" class="rounded" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
})
const fallbackImage = 'https://via.placeholder.com/500x300?text=No+Image'
</script>
