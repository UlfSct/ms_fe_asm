import { createRouter, createWebHistory } from 'vue-router'
import MainView from "@/views/user/MainView.vue";
import MaterialsView from "@/views/user/MaterialsView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import ProfileView from "@/views/auth/ProfileView.vue";
import {adminRoutes} from "@/router/admin.js";
import ModelsView from "@/views/user/ModelsView.vue";
import EquipmentsView from "@/views/user/EquipmentsView.vue";
import SchemesView from "@/views/user/SchemesView.vue";
import Scheme2DEditorView from "@/views/2d/Scheme2DEditorView.vue";
import ResultsView from "@/views/user/ResultsView.vue";
import Scheme3DViewer from "@/views/3d/Scheme3DViewer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...adminRoutes,
    {
      path: '/',
      name: 'main',
      component: MainView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/materials',
      name: 'materials',
      component: MaterialsView,
    },
    {
      path: '/models',
      name: 'models',
      component: ModelsView,
    },
    {
      path: '/equipments',
      name: 'equipments',
      component: EquipmentsView
    },
    {
      path: '/schemes',
      name: 'schemes',
      component: SchemesView
    },
    {
      path: '/schemes/:id',
      name: 'schemes2DEditor',
      component: Scheme2DEditorView
    },
    {
      path: '/results',
      name: 'results',
      component: ResultsView
    },
    {
      path: '/results/:id',
      name: 'schemes3DViewer',
      component: Scheme3DViewer
    }
  ],
})

export default router
