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
  const confirmDelete = async (opts?: { title?: string; text?: string }) => {
    const res = await base.fire({
      icon: 'warning',
      title: opts?.title ?? '¿Eliminar?',
      text: opts?.text ?? 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    return res.isConfirmed
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

  return { confirmDelete, success, error, raw: base }
}
