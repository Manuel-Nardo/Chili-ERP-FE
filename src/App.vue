<script setup lang="ts">
import { useAlertStore } from '@/stores/alertStore'
import { useConfirmStore } from '@/stores/confirmStore'
import { useNotificationStore } from '@/stores/notifications'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { useTheme } from 'vuetify'

const notification = useNotificationStore()
const confirm = useConfirmStore()
const alert = useAlertStore()

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <ScrollToTop />
      
      <v-snackbar
        v-model="alert.show"
        :color="alert.color"
        location="top right"
        multi-line
        :timeout="3500"
        elevation="8"
        class="rounded-xl"
      >
        {{ alert.message }}
        <template #actions>
          <v-btn icon @click="alert.close" color="white">
            <v-icon>tabler-x</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </VApp>
    <v-dialog v-model="confirm.show" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h6">{{ confirm.message }}</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="confirm.cancel">Cancelar</v-btn>
          <v-btn color="error" variant="text" @click="confirm.accept">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="notification.show" :color="notification.color" timeout="2500">
      {{ notification.message }}
    </v-snackbar>
  </VLocaleProvider>
</template>
