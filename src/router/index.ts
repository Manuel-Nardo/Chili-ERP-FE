import HomeView from '@/modules/admin/views/HomeView.vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import LoginView from '@/modules/auth/views/LoginView.vue'
import PreGateInView from '@/modules/pregatein/views/PreGateInUnits.vue'
import PreGateOutView from '@/modules/pregateout/views/PreGateOutUnits.vue'

import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/default.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/forgot-password', name: 'forgot-password', component: LoginView },
  { path: '/register', name: 'register', component: LoginView },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'admin/pre-gate-in', name: 'pre-gate-in', component: PreGateInView },
      { path: 'admin/pre-gate-out', name: 'pre-gate-out', component: PreGateOutView },
    ]
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else if (to.path === '/login' && auth.token) {
    next('/')
  } else {
    next()
  }
})

export default router
