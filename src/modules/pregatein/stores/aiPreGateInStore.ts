import api from '@/services/api'
import { defineStore } from 'pinia'

export const usePreAiGateInStore = defineStore('aiPreGateIn', () => {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const initialDate = ref('')
  const endDate = ref('')
  const search = ref('')

  const selectedItem = ref(null)
  const imageModal = ref(false)
  const imageLoading = ref(false)
  const editModal = ref(false)

  async function fetchEntries(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/getPreGatesIn', { params })
      entries.value = res.data.data
    } catch (e) {
      error.value = e.message || 'Error fetching data'
    } finally {
      loading.value = false
    }
  }

  const filter = () => {
    fetchEntries({
      initial_date: initialDate.value,
      end_date: endDate.value,
    })
  }

  async function openImageModal(item) {
    selectedItem.value = null
    imageModal.value = true
    imageLoading.value = true

    try {
      const { data } = await api.post('/auth/getFilesPreGate', { id: item.id })

      const parseImage = (val) => {
        if (!val) return null
        return val.startsWith('http') ? val : `data:image/jpeg;base64,${val}`
      }

      selectedItem.value = {
        ...item,
        license_plate_frame: parseImage(data.license_plate_frame),
        container_number_frame: parseImage(data.container_number_frame),
        license_plate_roi: parseImage(data.license_plate_roi),
        container_number_roi: parseImage(data.container_number_roi),
        trailer_video: data.trailer_video,
        plate_number_video: data.plate_number_video,
      }
    } catch (e) {
      console.warn('Error al cargar imágenes', e)
    } finally {
      imageLoading.value = false
    }
  }

  function openEditModal(item) {
    selectedItem.value = item
    editModal.value = true
  }

  return { entries, loading, error, initialDate, endDate, selectedItem, imageModal, imageLoading, editModal, fetchEntries, filter, openImageModal, openEditModal }
})
