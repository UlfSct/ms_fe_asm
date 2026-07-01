<script setup lang="js">
import {computed, onMounted, ref, watch} from "vue";
import {useAdminUsersStore} from "@/stores/admin/users.js";
import {useAuthStore} from "@/stores/core/auth.js";
import {useRouter} from "vue-router";
import AdminUsersChangeStatusesDialog from "@/components/admin/AdminUsersChangeStatusesDialog.vue";

const headers = [
  {
    title: 'Фамилия',
    key: 'surname',
    align: 'center',
    sortable: false,
    width: '10%'
  },
  {
    title: 'Имя',
    key: 'name',
    align: 'center',
    sortable: false,
    width: '10%'
  },
  {
    title: 'Отчество',
    key: 'lastname',
    align: 'center',
    sortable: false,
    width: '10%'
  },
  {
    title: 'E-mail',
    key: 'email',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Активность',
    key: 'is_active',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Администратор',
    key: 'is_admin',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '15%'
  }
]

const changeStatusesDialogOpened = ref(false)
const selectedUser = ref(null)
const size = ref(10)
const page = ref(1)
const search = ref(null)
const textFieldSearch = ref(null)
const searchTimeoutId = ref(null)

const store = useAdminUsersStore()
const authStore = useAuthStore()
const router = useRouter()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const isAdmin = computed(() => authStore.getIsAdmin)
const loadingAdmin = computed(() => authStore.loadingAdmin)
const items = computed(() => store.getList)
const count = computed(() => store.getCount)
const loadingList = computed(() => store.isLoadingList)
const loadingUpdate = computed(() => store.isLoadingUpdate)

const onPageUpdate = (newPage) => {
  if (loadingList.value) return
  page.value = newPage
  loadItemsList({page: newPage, size: size.value, search: search.value ? search.value : ''})
}

const onItemsPerPageUpdate = (newSize) => {
  if (loadingList.value) return
  size.value = newSize
  page.value = 1
  loadItemsList({page: 1, size: newSize, search: search.value ? search.value : ''})
}

const onSearch = (val, force = false) => {
  if (loadingList.value) return

  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }

  if (force) {
    search.value = val
    page.value = 1
    loadItemsList({page: 1, size: size.value, search: search.value ? search.value : ''})
    return
  }

  searchTimeoutId.value = setTimeout(() => {
    search.value = val
    page.value = 1
    loadItemsList({page: 1, size: size.value, search: search.value ? search.value : ''})
  }, 1000)
}

const loadItemsList = async (filters={}) => {
  await store.loadList(filters)
}

const openChangeStatusesDialog = (user) => {
  selectedUser.value = user
  changeStatusesDialogOpened.value = true
}

const closeChangeStatusesDialog = (needReload) => {
  if (!needReload) {
    changeStatusesDialogOpened.value = false
    selectedUser.value = null
    return
  }

  changeStatusesDialogOpened.value = false
  selectedUser.value = null
  loadItemsList({page: page.value, size: size.value, search: search.value ? search.value : ''})
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/')
    return
  }
  await authStore.checkAdminPermissions()
  if (!isAdmin.value) {
    await router.push('/profile')
    return
  }
  await loadItemsList({page: page.value, size: size.value})
})
</script>

<template>
  <v-card v-if="loadingAdmin" class="ma-3">
    <v-row no-gutters class="justify-center pa-3">
      Идёт проверка прав доступа, ожидайте.
    </v-row>
  </v-card>
  <v-card v-else class="ma-3">
    <v-toolbar flat density="comfortable">
      <v-toolbar-title>Список пользователей</v-toolbar-title>
      <v-text-field
        v-model="textFieldSearch"
        @update:model-value="onSearch"
        prepend-icon="search"
        density="compact"
        variant="outlined"
        class="mr-3"
        clearable
        placeholder="Поиск..."
        hide-details
        clear-icon="mdi-close"
        @keydown.enter="onSearch(textFieldSearch, true)"
        @click:clear="onSearch(textFieldSearch, true)"
      />
    </v-toolbar>
    <v-data-table-server
      :items="items"
      :loading="loadingList"
      @update:page="onPageUpdate"
      @update:items-per-page="onItemsPerPageUpdate"
      :page="page"
      :items-per-page="size"
      :items-length="count"
      :items-per-page-options="[10, 25, 50]"
      :headers="headers"
      density="compact"
    >
      <template v-slot:loading>Идёт загрузка данных...</template>
      <template v-slot:no-data>По результатам поиска ничего не найдено</template>
      <template v-slot:item.is_active="{ item }">
        <v-icon v-if="item.is_active" icon="mdi-check-circle-outline" color="green"/>
        <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
      </template>
      <template v-slot:item.is_admin="{ item }">
        <v-icon v-if="item.is_admin" icon="mdi-check-circle-outline" color="green"/>
        <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip text="Редактировать статусы" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="openChangeStatusesDialog(item)"
            >
              <v-icon size="25" color="blue">mdi-tag-edit-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table-server>
  </v-card>
  <admin-users-change-statuses-dialog
    v-if="changeStatusesDialogOpened"
    :opened="changeStatusesDialogOpened"
    :item="selectedUser"
    :loading="loadingUpdate"
    @close="closeChangeStatusesDialog(false)"
    @apply="closeChangeStatusesDialog(true)"
  />
</template>

<style scoped lang="scss">

</style>
