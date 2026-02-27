import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  onRequest({ options }) {
    const token = useCookie('accessToken').value
    const headers = new Headers(options.headers as HeadersInit)

    if (token) headers.set('Authorization', `Bearer ${token}`)

    options.headers = headers
  },
})
