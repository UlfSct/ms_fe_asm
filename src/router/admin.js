import AdminMainView from "@/views/admin/AdminMainView.vue";
import AdminUsersView from "@/views/admin/AdminUsersView.vue";
import AdminMaterialsView from "@/views/admin/AdminMaterialsView.vue";
import AdminModelsView from "@/views/admin/AdminModelsView.vue";
import AdminEquipmentsView from "@/views/admin/AdminEquipmentsView.vue";
import AdminTypesView from "@/views/admin/AdminTypesView.vue";

export const adminRoutes = [
  {
    path: '/admin',
    name: 'admin',
    component: AdminMainView,
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
  },
  {
    path: '/admin/materials',
    name: 'admin-materials',
    component: AdminMaterialsView
  },
  {
    path: '/admin/models',
    name: 'admin-models',
    component: AdminModelsView
  },
  {
    path: '/admin/equipments',
    name: 'admin-equipments',
    component: AdminEquipmentsView
  },
  {
    path: '/admin/types',
    name: 'admin-types',
    component: AdminTypesView
  }
]
