import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import Header from '@/views/Header.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/header', name: 'Header', component: Header }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
