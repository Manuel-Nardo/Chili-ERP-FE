import api from '@/services/api'
import { defineStore } from 'pinia'

import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'



export const usePreAiGateOutStore = defineStore('aiPreGateOut', () => {
  const entries = ref([])
  const customer = ref([])
  const subcarrier = ref([])
  const loading = ref(false)
  const error = ref(null)
  const initialDate = ref('')
  const endDate = ref('')
  const search = ref('')
  const refForm = ref()
  const selectedItem = ref(null)
  const editModal = ref(false)
  const imageModal = ref(false)
  const valida= ref()
  const $toast = useToast()
  
  async function fetchEntries(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/getPreGatesOut', { params } )

      entries.value = res.data.data
    } catch (e) {
      error.value = e.message || 'Error fetching data'
    } finally {
      loading.value = false
    }
  }

  async function fetchCustomer(params = {}) {
    
    error.value = null
    try {
      const res = await api.get('/auth/getCustomerApiSelect', { params })

      customer.value = res.data.customer
    } catch (e) {
      error.value = e.message || 'Error fetching data'
    } finally {
    }
  }

  async function fetchSubCarrier(params = { id }) {
    
    error.value = null
    try {
      const res = await api.post('/auth/getCustomerSubCarrierApiSelect', { params })

      subcarrier.value = res.data
    } catch (e) {
      error.value = e.message || 'Error fetching data'
    } finally {
    }
  }

  async function updateItem(current) {
    
    error.value = null
    try {
      const res = await api.post('/auth/updatePreGateOut', current)

      console.log(res.data)
      if(res.data.success=='success'){
        editModal.value = false
        $toast.success('You did it!')
      }
    } catch (e) {
      error.value = e.message || 'Error update item'
    }
  }

  const filter = () => {
    fetchEntries({
      initial_date: initialDate.value,
      end_date: endDate.value,
    })
  }

  function selectSubCarrier (newValue){
    console.log('hola', newValue)
    fetchSubCarrier({ customer_id: newValue })

  }

  function openEditModal(item) {
    selectedItem.value = item;
    selectedItem.value.btt = 'Both';
    const fruits = selectedItem.value.checkout.toString().split(" ");
    console.log(fruits[1])
    selectedItem.value.time_out = fruits[1]

    selectSubCarrier(selectedItem.value.customer_id)
    editModal.value = true
  }

  function openImageModal(item) {
    selectedItem.value = item
    imageModal.value = true
  }

  const submitForm = async () => {
    
    console.log('cosa es valida:', valida.value.valid)

    if (valida.value.valid)
      updateItem(selectedItem.value)
            
  }

  fetchCustomer()

  return { entries, loading, error, initialDate, endDate, customer, subcarrier, search, selectedItem, editModal, imageModal, valida, refForm,
    fetchEntries, filter, selectSubCarrier, openEditModal, openImageModal, submitForm }
})
