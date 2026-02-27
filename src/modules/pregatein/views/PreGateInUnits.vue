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
        Checkpoint Ai Gate In
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

    <template>
      <VDialog v-model="editModal" max-width="960px">
        <VCard>
          <VCardTitle>Edit Pre Gate In</VCardTitle>
          <VCardText class="bg-light">
            <PreGateInForm :item="selectedItem" />
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn text @click="editModal = false">Cerrar</VBtn>
            <VBtn color="primary" @click="guardarCambios">Guardar</VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </template>

    <VDialog v-model="imageModal" max-width="900px">
      <VCard>
        <VCardTitle>Pre Gate In Images</VCardTitle>
        <VCardText>
          <div v-if="imageLoading">
            <VProgressLinear indeterminate color="primary" />
          </div>

          <div v-else>
            <Swiper
              :spaceBetween="20"
              :slidesPerView="1"
              navigation
              pagination
              class="my-swiper"
            >
              <SwiperSlide
                v-for="(img, idx) in imagesWithFallback"
                :key="idx"
              >
                <VImg
                  :src="img"
                  max-height="500"
                  width="100%"
                  cover
                  class="rounded"
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </VCardText>

        <VCardActions>
          <VBtn text @click="imageModal = false">Cerrar</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
const fallbackImage = 'https://via.placeholder.com/500x300?text=No+Image'


import PreGateInForm from '@/modules/pregatein/components/PreGateInForm.vue'
import { storeToRefs } from 'pinia'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { onMounted } from 'vue'
import { usePreAiGateInStore } from '../stores/aiPreGateInStore'

const store = usePreAiGateInStore()
const { entries, loading, error, initialDate, endDate, search, selectedItem, imageModal, imageLoading, editModal } = storeToRefs(store)
const { fetchEntries, filter, openImageModal, openEditModal } = store

const headers = [
  { title: 'Yard', key: 'yard.name' },
  { title: 'Check_in', key: 'check_in' },
  { title: 'Customer', key: 'customer.name' },
  { title: 'Driver', key: 'driver_name' },
  { title: 'Sub carrier', key: 'sub_carrier.name' },
  { title: 'Tractor No', key: 'tractor_no' },
  { title: 'Trailer No', key: 'trailer_no' },
  { title: 'Chassis', key: 'chassis_no' },
  { title: 'License plate', key: 'plate_number' },
  { title: 'Status', key: 'status' },
  { title: 'Options', key: 'actions',width: '10%', sortable: false },
]

onMounted(() => {
  fetchEntries()
})


const imagesWithFallback = computed(() => [
  selectedItem.value?.license_plate_frame || fallbackImage,
  selectedItem.value?.container_number_frame || fallbackImage,
  selectedItem.value?.license_plate_roi || fallbackImage,
  selectedItem.value?.container_number_roi || fallbackImage,
])

</script>
<style lang="scss" scoped>
swiper-container {
  background-color: #d5dbdb;
}
</style>
