<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :loading="userStore.loading"
    class="elevation-1"
  >
  <template #top>
  <div class="d-flex">
    <v-btn color="primary" class="mb-4" @click="userStore.openAddModal">
      <v-icon left>tabler-plus</v-icon>
      Agregar Cliente
    </v-btn>
  </div>
</template>
    <template #item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>
    <template #item.updated_at="{ item }">
      {{ formatDate(item.updated_at) }}
    </template>
    <template #item.roles="{ item }">
      <v-chip
        v-for="role in item.roles"
        :key="role.id"
        color="primary"
        size="small"
        label
        class="ma-1"
      >
        {{ role.name }}
      </v-chip>
    </template>
    <template #item.actions="{ item }">
      <v-btn icon @click="userStore.openEditModal(item)">
        <v-icon>tabler-pencil</v-icon>
      </v-btn>
      <v-btn icon @click="confirmDelete(item)">
        <v-icon>tabler-trash</v-icon>
      </v-btn>
    </template>
  </v-data-table>

  <UserFormModal />
</template>

<script setup lang="ts">
import { useUserStore } from '@/modules/users/store/userStore'
import { useAlertStore } from '@/stores/alertStore'
import { useConfirmStore } from '@/stores/confirmStore'
import { formatDate } from '@/utils/date'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import UserFormModal from '../components/UserFormModal.vue'


const confirm = useConfirmStore()
const userStore = useUserStore()
const { users } = storeToRefs(userStore)
const alert = useAlertStore()

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Correo', key: 'email' },
  { title: 'Creado', key: 'created_at' },
  { title: 'Actualizado', key: 'updated_at' },
  { title: 'Roles', key: 'roles' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

onMounted(() => {
  userStore.getUsers()
})

async function confirmDelete(user: any) {
  const res = await confirm.confirm('¿Estás seguro de eliminar este usuario?')
  if (res) {
    await userStore.removeUser(user.id)
    // Puedes poner alerta: alert.notify('Eliminado', 'success')
  }
}
</script>


