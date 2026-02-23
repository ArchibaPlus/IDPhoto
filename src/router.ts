import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/crop',
      name: 'crop',
      component: () => import('@/views/CropPage.vue')
    },
    {
      path: '/background',
      name: 'background',
      component: () => import('@/views/BackgroundPage.vue')
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('@/views/LayoutPage.vue')
    }
  ]
})

export default router
