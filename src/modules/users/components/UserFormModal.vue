<template>
    <v-dialog v-model="userStore.modalOpen" max-width="420" persistent>
      <v-card class="rounded-2xl">
        <v-card-title class="text-h6 font-weight-bold px-6 pt-6 pb-2">
          <v-icon size="28" color="primary" class="mr-2">tabler-user</v-icon>
          {{ userStore.form.id ? 'Editar Usuario' : 'Agregar Usuario' }}
        </v-card-title>
  
        <v-card-text class="px-6 pb-2 pt-0">
          <v-form @submit.prevent="userStore.saveUser">
            <v-text-field
              v-model="userStore.form.name"
              label="Nombre"
              prepend-inner-icon="tabler-user"
              :disabled="userStore.loading"
              variant="outlined"
              class="mb-4"
              density="comfortable"
              autocomplete="off"
              autofocus
              required
            />
            <v-text-field
              v-model="userStore.form.email"
              label="Correo electrónico"
              prepend-inner-icon="tabler-mail"
              :disabled="userStore.loading"
              variant="outlined"
              class="mb-2"
              density="comfortable"
              type="email"
              autocomplete="off"
              required
            />
            <v-text-field
                v-model="userStore.form.password"
                :type="userStore.showPassword ? 'text' : 'password'"
                label="Contraseña"
                prepend-inner-icon="tabler-password"
                :append-inner-icon="userStore.showPassword ? 'tabler-eye-off' : 'tabler-eye'"
                :rules="passwordRules"
                :required="!userStore.form.id"
                @click:append-inner="userStore.showPassword = !userStore.showPassword"
                autocomplete="new-password"
                clearable
            />
          </v-form>
        </v-card-text>
  
        <v-divider class="mb-0" />
  
        <v-card-actions class="px-6 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" color="grey" @click="userStore.modalOpen = false" :disabled="userStore.loading">
            Cancelar
          </v-btn>
          <v-btn color="primary" class="px-5" @click="userStore.saveUser" :loading="userStore.loading" elevation="2">
            <v-icon left size="18">tabler-check</v-icon>
            {{ userStore.form.id ? 'Actualizar' : 'Agregar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { useUserStore } from '@/modules/users/store/userStore';
  const userStore = useUserStore()

  const passwordRules = computed(() => {
  if (!userStore.form.id) {
    return [
      (v: any) => !!v || 'La contraseña es obligatoria',
      (v: any) => (v && v.length >= 6) || 'Mínimo 6 caracteres',
    ]
  }
  return []
})
  </script>
  
  <style scoped>
  .v-card-title {
    align-items: center;
    gap: 4px;
  }
  </style>
