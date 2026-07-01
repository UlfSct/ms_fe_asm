<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/core/auth.js";
import {useRouter} from "vue-router";
import {formatDate} from "@/utils/date.js";
import ApplyDialog from "@/components/core/ApplyDialog.vue";
import {useResultsStore} from "@/stores/user/results.js";

const headers = [
  {
    title: 'Название',
    key: 'name',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Дата создания',
    key: 'created',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Дата обновления',
    key: 'updated',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Идёт оптимизация',
    key: 'is_optimizing',
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

const deleteDialogOpened = ref(false)
const optimizeDialogOpened = ref(false)
const selectedItemId = ref(null)
const size = ref(10)
const page = ref(1)
const search = ref(null)
const textFieldSearch = ref(null)
const searchTimeoutId = ref(null)

const store = useResultsStore()
const authStore = useAuthStore()
const router = useRouter()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const items = computed(() => store.getList)
const count = computed(() => store.getCount)
const loadingList = computed(() => store.isLoadingList)
const loadingDelete = computed(() => store.isLoadingDelete)
const loadingOptimize = computed(() => store.isLoadingOptimize)

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

const openOptimizeDialog = (item) => {
  selectedItemId.value = item.id
  optimizeDialogOpened.value = true
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

const closeOptimizeDialog = async (applied) => {
  if (!applied) {
    optimizeDialogOpened.value = false
    selectedItemId.value = null
    return
  }

  await store.optimizeResult(selectedItemId.value)
  optimizeDialogOpened.value = false
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
  await loadItemsList({page: page.value, size: size.value})
})
</script>

<template>
  <v-card class="ma-3">
    <v-toolbar flat density="comfortable">
      <v-toolbar-title>Список результатов</v-toolbar-title>
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
      <template v-slot:item.updated="{ item }">
        {{ formatDate(item.updated) }}
      </template>
      <template v-slot:item.created="{ item }">
        {{ formatDate(item.created) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip text="Удалить результат" location="bottom">
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
        <v-tooltip text="Перейти в просмотр" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="router.push(`/results/${item.id}`)"
            >
              <v-icon size="25" color="green">mdi-account-hard-hat-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Оптимизировать результат" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="openOptimizeDialog(item)"
            >
              <v-icon size="25" color="blue">mdi-send-clock-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.is_optimizing="{ item }">
        <v-icon v-if="item.is_optimizing" icon="mdi-check-circle-outline" color="green"/>
        <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
      </template>
    </v-data-table-server>
  </v-card>
  <apply-dialog
    v-if="deleteDialogOpened"
    :opened="deleteDialogOpened"
    text="Вы уверены что хотите удалить данный результат?"
    :loading="loadingDelete"
    @cancel="closeDeleteDialog(false)"
    @submit="closeDeleteDialog(true)"
  />
  <apply-dialog
    v-if="optimizeDialogOpened"
    :opened="optimizeDialogOpened"
    text="Вы уверены что хотите оптимизировать данный результат?"
    :loading="loadingOptimize"
    @cancel="closeOptimizeDialog(false)"
    @submit="closeOptimizeDialog(true)"
  />
</template>

<style scoped lang="scss">

</style>
