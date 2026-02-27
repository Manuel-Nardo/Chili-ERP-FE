import api from './api';

export const fetchUsers = (params?: any) =>
  api.get('/users', { params })

export const fetchUser = (id: number) =>
  api.get(`/users/${id}`)

export const createUser = (payload: any) =>
  api.post('/users', payload)

export const updateUser = (id: number, payload: any) =>
  api.put(`/users/${id}`, payload)

export const deleteUser = (id: number) =>
  api.delete(`/users/${id}`)
