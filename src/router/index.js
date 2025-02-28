import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import WalletGenerator from '@/components/WalletGenerator.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/walletgenerator', name: 'WalletGenerator', component: WalletGenerator },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
