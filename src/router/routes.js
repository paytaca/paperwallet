const routes = [
  {
    path: '/',
    component: () => import('src/App.vue'),
    children: [
      { path: '', component: () => import('layouts/LandingPage.vue') }
    ]
  },
  {
    path: '/walletgenerator',
    component: () => import('src/App.vue'),
    children: [
      { path: '', component: () => import('layouts/WalletGenerator.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
