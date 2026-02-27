import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')

  function notify(msg: string, type: 'success' | 'error' | 'warning' = 'success') {
    message.value = msg
    color.value = type
    show.value = true
  }

  return { show, message, color, notify }
})
