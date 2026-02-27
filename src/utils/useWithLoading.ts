import { useLoadingStore } from '../stores/loadingStore'

export async function useWithLoading(fn) {
  const loading = useLoadingStore()
  try {
    loading.show()
    return await fn()
  } finally {
    loading.hide()
  }
}
