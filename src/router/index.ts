import { createRouter, createWebHistory, useRouter } from 'vue-router';

export type RouteNames = keyof {
  [T in typeof routes[number] as T['name']]: never;
};

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('../components/TheHome.vue'),
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('../components/LoginForm.vue'),
  },
  {
    name: 'register',
    path: '/reg',
    component: () => import('../components/RegisterForm.vue'),
  },
  {
    name: 'profile',
    path: '/profile',
    component: () => import('../components/UserProfile.vue'),
  },
  {
    name: 'edit-doc',
    path: '/edit-doc/:id',
    component: () => import('../components/EditDocument.vue'),
  },
  {
    name: 'search-doc',
    path: '/search-doc',
    component: () => import('../components/search/document/SearchDocument.vue'),
  },
  {
    name: 'directories',
    path: '/directories',
    component: () => import('../components/DirectoriesPage.vue'),
  },
  {
    name: 'new-doc-type',
    path: '/new-doc-type/:id',
    component: () => import('../components/search/doc-type/EditDocType.vue'),
  },
  {
    name: 'new-org',
    path: '/new-org/:id',
    component: () => import('../components/search/org/EditOrg.vue'),
  },
  {
    name: 'tasks',
    path: '/tasks',
    component: () => import('../components/tasks/TaskPage.vue'),
  },
  {
    name: 'edit-task',
    path: '/edit-task/:id',
    component: () => import('../components/tasks/EditTaskPage.vue'),
  },
  {
    name: 'history',
    path: '/history',
    component: () => import('../components/history-page/HistoryPage.vue'),
  },
] as const;

export default createRouter({
  history: createWebHistory(),
  routes: [...routes],
});
