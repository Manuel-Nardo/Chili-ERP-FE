<template>

    <VDialog
      v-model="imageModal"
      max-width="900px"
    >
      <DialogCloseBtn @click="imageModal = false" />
      <VCard>
        <VCardTitle>Pre Gate Out Images</VCardTitle>
        <VCardText>
          <swiper-container
            pagination-clickable="true"
            autoplay="true"
            navigation="true"
            events-prefix="swiper-"
          >
            <swiper-slide
              v-for="swiperImg in [
                selectedItem.license_plate_frame,
                selectedItem.container_number_frame,
                selectedItem.license_plate_roi,
                selectedItem.container_number_roi,
              ]"
              :key="swiperImg"
              lazy="true"
            >
              <VImg
                :src="swiperImg"
                cover
                loading="lazy"
              />
            </swiper-slide>
          </swiper-container>
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

const {  selectedItem, imageModal,customer,error,subcarrier } = storeToRefs(store)
const {  selectSubCarrier, submitForm } = store

const fallbackImage = 'https://via.placeholder.com/500x300?text=No+Image'
</script>
