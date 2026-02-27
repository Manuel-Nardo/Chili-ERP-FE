import { ability } from '@/plugins/casl/ability'
import { loadFonts } from '@/plugins/webfontloader'
import { abilitiesPlugin } from '@casl/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { createApp } from 'vue'

loadFonts()

import App from './App.vue'

import '@core/scss/template/index.scss'
import '@styles/styles.scss'

import i18n from '@/plugins/i18n'
import iconify from '@/plugins/iconify'
import layouts from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'

import { createPinia } from 'pinia'

import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(iconify)
app.use(i18n)
app.use(layouts)
app.use(abilitiesPlugin, ability)

app.mount('#app')
