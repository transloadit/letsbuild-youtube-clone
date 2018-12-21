
window.base_url = 'https://us-central1-fir-firestore-trans-sam.cloudfunctions.net/api1';
// window.base_url = 'http://localhost:5000/fir-firestore-trans-sam/us-central1/api1';
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/video/:id', component: () => import('pages/single.vue') },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
