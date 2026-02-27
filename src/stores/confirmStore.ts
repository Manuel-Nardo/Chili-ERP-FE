import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const show = ref(false)
  const message = ref('')
  let resolvePromise: ((result: boolean) => void) | null = null

  function confirm(msg: string) {
    message.value = msg
    show.value = true
    return new Promise<boolean>(resolve => {
      resolvePromise = resolve
    })
  }

  function accept() {
    show.value = false
    resolvePromise?.(true)
    resolvePromise = null
  }

  function cancel() {
    show.value = false
    resolvePromise?.(false)
    resolvePromise = null
  }

  return { show, message, confirm, accept, cancel }
})
