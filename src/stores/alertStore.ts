import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')

  function notify(msg: string, type: string = 'success') {
    message.value = msg
    color.value = type
    show.value = true
  }

  function close() {
    show.value = false
  }

  return { show, message, color, notify, close }
})
