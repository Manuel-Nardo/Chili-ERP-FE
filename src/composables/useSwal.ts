// src/composables/useSwal.ts
import Swal from 'sweetalert2';

const base = Swal.mixin({
  reverseButtons: true,
  confirmButtonColor: '#2563eb', // azul
  cancelButtonColor: '#dc2626',  // rojo
  customClass: {
    confirmButton: 'swal-confirm-btn',
    cancelButton: 'swal-cancel-btn',
  },
})

export const useSwal = () => {
  const confirm = async (opts?: {
    title?: string
    text?: string
    confirmText?: string
    cancelText?: string
    icon?: 'warning' | 'question' | 'info' | 'success' | 'error'
  }) => {
    const res = await base.fire({
      icon: opts?.icon ?? 'question',
      title: opts?.title ?? '¿Estás seguro?',
      text: opts?.text ?? '',
      showCancelButton: true,
      confirmButtonText: opts?.confirmText ?? 'Sí',
      cancelButtonText: opts?.cancelText ?? 'Cancelar',
    })

    return res.isConfirmed
  }

  const confirmDelete = async (opts?: { title?: string; text?: string }) => {
    return confirm({
      icon: 'warning',
      title: opts?.title ?? '¿Eliminar?',
      text: opts?.text ?? 'Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    })
  }

  const success = (title = 'Listo', text?: string) =>
    base.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'OK',
    })

  const error = (title = 'Error', text?: string) =>
    base.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626',
    })

  return { confirm, confirmDelete, success, error, raw: base }
}
