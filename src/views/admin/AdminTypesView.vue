<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/core/auth.js";
import {useRouter} from "vue-router";
import ApplyDialog from "@/components/core/ApplyDialog.vue";
import {useAdminTypesStore} from "@/stores/admin/types.js";
import AdminCreateUpdateTypeDialog from "@/components/admin/AdminCreateUpdateTypeDialog.vue";

const headers = [
  {
    title: 'Название',
    key: 'name',
    align: 'center',
    sortable: false,
    width: '40%'
  },
  {
    title: 'Иконка',
    key: 'file',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Активность',
    key: 'is_active',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '20%'
  }
]

const createDialogOpened = ref(false)
const updateDialogOpened = ref(false)
const deleteDialogOpened = ref(false)
const selectedItemId = ref(null)
const selectedItem = ref(null)
const size = ref(10)
const page = ref(1)
const search = ref(null)
const textFieldSearch = ref(null)
const searchTimeoutId = ref(null)

const store = useAdminTypesStore()
const authStore = useAuthStore()
const router = useRouter()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const isAdmin = computed(() => authStore.getIsAdmin)
const loadingAdmin = computed(() => authStore.loadingAdmin)
const items = computed(() => store.getList)
const count = computed(() => store.getCount)
const loadingList = computed(() => store.isLoadingList)
const loadingUpdate = computed(() => store.isLoadingUpdate)
const loadingCreate = computed(() => store.isLoadingCreate)
const loadingDelete = computed(() => store.isLoadingDelete)

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

const openCreateDialog = () => {
  createDialogOpened.value = true
}

const openUpdateDialog = (item) => {
  selectedItemId.value = item.id
  selectedItem.value = item
  updateDialogOpened.value = true
}

const closeCreateUpdateDialog = (needReload) => {
  if (!needReload) {
    createDialogOpened.value = false
    updateDialogOpened.value = false
    selectedItemId.value = null
    return
  }

  createDialogOpened.value = false
  updateDialogOpened.value = false
  selectedItemId.value = null
  loadItemsList({page: page.value, size: size.value, search: search.value ? search.value : ''})
}

const openDeleteDialog = (item) => {
  selectedItemId.value = item.id
  deleteDialogOpened.value = true
}

const closeDeleteDialog = async (applied) => {
  if (!applied) {
    deleteDialogOpened.value = false
    selectedItemId.value = null
    return
  }

  await store.deleteItem(selectedItemId.value)
  deleteDialogOpened.value = false
  selectedItemId.value = null
  page.value = 1
  size.value = 10
  await loadItemsList({page: page.value, size: size.value})
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
      <v-toolbar-title>Список типов оборудования</v-toolbar-title>
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
      <v-tooltip text="Создать тип оборудования" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            size="30"
            class="px-3 mr-3"
            flat
            rounded
            color="white"
            @click="openCreateDialog()"
          >
            <v-icon size="25" color="blue">mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
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
      <template v-slot:item.file="{ item }">
        <v-img :src="item.file" alt="Изображение типа" max-height="50"/>
      </template>
      <template v-slot:item.is_active="{ item }">
        <v-icon v-if="item.is_active" icon="mdi-check-circle-outline" color="green"/>
        <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip text="Редактировать тип оборудования" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="openUpdateDialog(item)"
            >
              <v-icon size="25" color="blue">mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Удалить тип оборудования" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="openDeleteDialog(item)"
            >
              <v-icon size="25" color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table-server>
  </v-card>
  <admin-create-update-type-dialog
    v-if="createDialogOpened || updateDialogOpened"
    :opened="createDialogOpened || updateDialogOpened"
    :id="selectedItemId"
    :item="selectedItem"
    :edit="updateDialogOpened"
    :loading="loadingUpdate || loadingCreate"
    @close="closeCreateUpdateDialog(false)"
    @apply="closeCreateUpdateDialog(true)"
  />
  <apply-dialog
    v-if="deleteDialogOpened"
    :opened="deleteDialogOpened"
    text="Вы уверены что хотите удалить данный тип оборудования?"
    :loading="loadingDelete"
    @cancel="closeDeleteDialog(false)"
    @submit="closeDeleteDialog(true)"
  />
</template>

<style scoped lang="scss">

</style>
