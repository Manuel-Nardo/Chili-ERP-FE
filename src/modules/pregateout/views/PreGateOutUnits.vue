<template>
  <div class="pt-6">
    <VRow>
      <VCol
        cols="4"
        md="3"
      >
        <label class="font-weight-bold">Initial Date</label>
        <VTextField
          v-model="initialDate"
          type="date"
          dense
          hide-details
          class="mb-2"
        />
      </VCol>
      <VCol
        cols="4"
        md="3"
      >
        <label class="font-weight-bold">End Date</label>
        <VTextField
          v-model="endDate"
          type="date"
          dense
          hide-details
          class="mb-2"
        />
      </VCol>
      <VCol cols="12">
        <VBtn
          color="info"
          block
          @click="filter"
        >
          Filter
        </VBtn>
      </VCol>
    </VRow>

    <!-- 👉 Tabla principal -->
    <VCard
      class="mt-2 mb-2"
      elevation="2"
    >
      <VCardTitle class="bg-primary text-white py-2">
        Checkpoint Ai Gate Out
      </VCardTitle>
      <VCardText>
        <VTextField
          v-model="search"
          label="Search"
          prepend-inner-icon="tabler-search"
          dense
          outlined
          hide-details
          class="mb-2 mt-2"
        />

        <VDataTable
          :headers="headers"
          :items="entries"
          :search="search"
          :loading="loading"
          loading-text="Cargando unidades..."
          class="elevation-0"
          items-per-page="10"
          hover
          :item-class="getRowClass"
        >
          <!-- Yard -->
          <template #item.yard.name="{ item }">
            {{ item.yard?.name || '-' }}
          </template>
          <!-- Customer -->
          <template #item.customer.name="{ item }">
            {{ item.customer?.name || '-' }}
          </template>
          <!-- Sub Carrier -->
          <template #item.sub_carrier.name="{ item }">
            {{ item.sub_carrier?.name || '-' }}
          </template>
          <!-- Actions -->
          <template #item.actions="{ item }">
            <VBtn
              icon
              rounded="lg"
              size="small"
              color="primary"
              @click="() => openEditModal(item)"
            >
              <VIcon>tabler-edit</VIcon>
            </VBtn>
            <VBtn
              icon
              rounded="lg"
              size="small"
              color="success"
              @click="() => openImageModal(item)"
            >
              <VIcon>tabler-photo</VIcon>
            </VBtn>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>

    <!-- Aquí va el formulario de edición -->
    <PreGateOutForm/>
    

    <!-- Formulario de imagenes -->
      <PreGateOutImagesForm/>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { register } from 'swiper/element/bundle'
import { onMounted } from 'vue'
import { usePreAiGateOutStore } from '../stores/aiPreGateOutStore'

import PreGateOutForm from '@/modules/pregateout/components/PreGateOutForm.vue'
import PreGateOutImagesForm from '@/modules/pregateout/components/PreGateOutImagesForm.vue'


const store = usePreAiGateOutStore()
const { entries, loading, error, initialDate, endDate, search} = storeToRefs(store)
const { fetchEntries, filter, openEditModal, openImageModal, } = store

const headers = [
  { title: 'Yard', key: 'yard.name' },
  { title: 'Customer', key: 'customer.name' },
  { title: 'Sub carrier', key: 'sub_carrier.name' },
  { title: 'Check out', key: 'checkout' },
  { title: 'Driver', key: 'driver_name' },
  { title: 'Tractor No', key: 'tractor_no' },
  { title: 'Trailer No', key: 'trailer_no' },
  { title: 'Chassis', key: 'chassis_no' },
  { title: 'License plate', key: 'plate_number' },
  { title: 'Processed', key: 'status' },
  { title: 'Options', key: 'actions', width: '10%', sortable: false },
]


const getRowClass = (item, index) => {
  console.log(index)
  
  return index % 2 === 0 ? 'striped-row' : ''
}

onMounted(() => {
  register()
  fetchEntries()
})
</script>

<style lang="scss" scoped>
swiper-container {
  background-color: #d5dbdb;
}

.striped-row {
  background-color: #f9f9f9;
}
</style>
