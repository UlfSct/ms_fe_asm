<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/core/auth.js";
import {useRouter} from "vue-router";
import {formatDate} from "@/utils/date.js";
import AdminCreateUpdateModelDialog from "@/components/admin/AdminCreateUpdateModelDialog.vue";
import ApplyDialog from "@/components/core/ApplyDialog.vue";
import AdminModelInfoDialog from "@/components/admin/AdminModelInfoDialog.vue";
import {useAdminModelsStore} from "@/stores/admin/models.js";
import {useAdminEquipmentsStore} from "@/stores/admin/equipments.js";
import AdminCreateUpdateEquipmentDialog
  from "@/components/admin/AdminCreateUpdateEquipmentDialog.vue";
import AdminEquipmentInfoDialog from "@/components/admin/AdminEquipmentInfoDialog.vue";
import {useEquipmentHolesStore} from "@/stores/user/equipmentHoles.js";
import HoleCreateEditDialog from "@/components/user/HoleCreateEditDialog.vue";
import {API_URL} from "@/utils/requests.js";

const holesHeaders = [
  {
    title: 'Название',
    key: 'name',
    align: 'center',
    sortable: false,
    width: '40%'
  },
  {
    title: 'Смещение',
    key: 'offset',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Нормаль',
    key: 'normal',
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

const headers = [
  {
    title: 'Название',
    key: 'name',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Модель',
    key: 'model',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Тип',
    key: 'type',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Дата создания',
    key: 'created',
    align: 'center',
    sortable: false,
    width: '10%'
  },
  {
    title: 'Дата обновления',
    key: 'updated',
    align: 'center',
    sortable: false,
    width: '10%'
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: '',
    key: 'data-table-expand',
    align: 'center',
    sortable: false,
    width: '1%'
  }
]

const createDialogOpened = ref(false)
const updateDialogOpened = ref(false)
const deleteDialogOpened = ref(false)
const infoDialogOpened = ref(false)
const selectedItemId = ref(null)
const size = ref(10)
const page = ref(1)
const search = ref(null)
const textFieldSearch = ref(null)
const searchTimeoutId = ref(null)
const expanded = ref([])
const createHoleDialogOpened = ref(false)
const editHoleDialogOpened = ref(false)
const deleteHoleDialogOpened = ref(false)
const infoHoleDialogOpened = ref(false)
const holeItem = ref(null)
const holeId = ref(null)
const modelUrl = ref(null)

const store = useAdminEquipmentsStore()
const holesStore = useEquipmentHolesStore()
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
const loadingHolesList = computed(() => holesStore.isLoadingList)
const loadingHolesCreate = computed(() => holesStore.isLoadingCreate)
const loadingHolesUpdate = computed(() => holesStore.isLoadingUpdate)
const loadingHolesDelete = computed(() => holesStore.isLoadingDelete)
const holes = computed(() => holesStore.getList)
const getExpandedEquipment = computed(() => {
  for (let equipment of items.value) {
    if (expanded.value[0] && expanded.value[0] === equipment.id) return equipment
  }
  return {}
})

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

const openInfoDialog = (item) => {
  selectedItemId.value = item.id
  infoDialogOpened.value = true
}

const closeInfoDialog = () => {
  infoDialogOpened.value = false
  selectedItemId.value = null
}

const onExpandedHandler = (nVal) => {
  if (nVal.length > 1) {
    expanded.value = [nVal[nVal.length - 1]];
  }
  if (!expanded.value[0]) return
  loadEquipmentHoles(expanded.value[0])
}

const loadEquipmentHoles = (id) => {
  holesStore.loadList({equipment: id})
}

const openCreateHoleDialog = () => {
  holeItem.value = null
  holeId.value = null
  modelUrl.value = getExpandedEquipment.value.model.file
  createHoleDialogOpened.value = true
}

const openDeleteHoleDialog = (item) => {
  holeId.value = item.id
  deleteHoleDialogOpened.value = true
}

const openUpdateHoleDialog = (item) => {
  holeItem.value = item
  holeId.value = item.id
  modelUrl.value = getExpandedEquipment.value.model.file
  editHoleDialogOpened.value = true
}

const openInfoHoleDialog = (item) => {
  holeItem.value = item
  holeId.value = item.id
  modelUrl.value = getExpandedEquipment.value.model.file
  infoHoleDialogOpened.value = true
}

const closeDeleteHoleDialog = async (applied) => {
  if (!applied) {
    deleteHoleDialogOpened.value = false
    holeId.value = null
    return
  }

  await holesStore.deleteItem(holeId.value)
  deleteHoleDialogOpened.value = false
  holeId.value = null
  loadEquipmentHoles(expanded.value[0])
}

const closeCreateEditHoleDialog = async (applied) => {
  createHoleDialogOpened.value = false
  editHoleDialogOpened.value = false
  infoHoleDialogOpened.value = false
  if (!applied) return

  loadEquipmentHoles(expanded.value[0])
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
      <v-toolbar-title>Список глобального оборудования</v-toolbar-title>
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
      <v-tooltip text="Создать оборудование" location="bottom">
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
      v-model:expanded="expanded"
      @update:expanded="onExpandedHandler"
    >
      <template v-slot:loading>Идёт загрузка данных...</template>
      <template v-slot:no-data>По результатам поиска ничего не найдено</template>
      <template v-slot:item.model="{ item }">
        {{ item.model.name }}
        <a :href="`${API_URL}${item.model.file}`" download target="_blank">
          <v-tooltip text="Скачать модель" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                size="30"
                class="px-3 mr-1"
                flat
                rounded
                color="white"
              >
                <v-icon size="25" color="blue">mdi-download</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </a>
      </template>
      <template v-slot:item.type="{ item }">
        {{ item.type.name }}
      </template>
      <template v-slot:item.updated="{ item }">
        {{ formatDate(item.updated) }}
      </template>
      <template v-slot:item.created="{ item }">
        {{ formatDate(item.created) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip text="Редактировать оборудование" location="bottom">
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
        <v-tooltip v-if="item.can_delete" text="Удалить оборудование" location="bottom">
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
        <v-tooltip text="Подробная информация" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="30"
              class="px-3 mr-1"
              flat
              rounded
              color="white"
              @click="openInfoDialog(item)"
            >
              <v-icon size="25" color="blue">mdi-information-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:expanded-row="rowProps">
        <td colspan="7">
          <v-card class="ma-3">
            <v-toolbar flat density="comfortable">
              <v-toolbar-title>Список штуцеров оборудования</v-toolbar-title>
              <v-spacer />
              <v-tooltip text="Создать штуцер" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="30"
                    class="px-3 mr-3"
                    flat
                    rounded
                    color="white"
                    @click="openCreateHoleDialog()"
                  >
                    <v-icon size="25" color="blue">mdi-plus</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </v-toolbar>
            <v-data-table-server
              :items="holes"
              :loading="loadingHolesList"
              :items-length="holes.length"
              :headers="holesHeaders"
              density="compact"
              class="w-100"
              hide-default-footer
            >
              <template v-slot:loading>Идёт загрузка данных...</template>
              <template v-slot:no-data>У оборудования не задано ни одного штуцера</template>
              <template v-slot:item.offset="{ item }">
                {{ `(${item.offset_x}; ${item.offset_y}; ${item.offset_z})` }}
              </template>
              <template v-slot:item.normal="{ item }">
                {{ `(${item.normal_x}; ${item.normal_y}; ${item.normal_z})` }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-tooltip text="Редактировать штуцер" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="30"
                      class="px-3 mr-1"
                      flat
                      rounded
                      color="white"
                      @click="openUpdateHoleDialog(item)"
                    >
                      <v-icon size="25" color="blue">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip v-if="rowProps.item.can_delete" text="Удалить штуцер" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="30"
                      class="px-3 mr-1"
                      flat
                      rounded
                      color="white"
                      @click="openDeleteHoleDialog(item)"
                    >
                      <v-icon size="25" color="red">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Подробная информация" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="30"
                      class="px-3 mr-1"
                      flat
                      rounded
                      color="white"
                      @click="openInfoHoleDialog(item)"
                    >
                      <v-icon size="25" color="blue">mdi-information-outline</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </v-data-table-server>
          </v-card>
        </td>
      </template>
    </v-data-table-server>
  </v-card>
  <admin-create-update-equipment-dialog
    v-if="createDialogOpened || updateDialogOpened"
    :opened="createDialogOpened || updateDialogOpened"
    :id="selectedItemId"
    :edit="updateDialogOpened"
    :loading="loadingUpdate || loadingCreate"
    @close="closeCreateUpdateDialog(false)"
    @apply="closeCreateUpdateDialog(true)"
  />
  <apply-dialog
    v-if="deleteDialogOpened"
    :opened="deleteDialogOpened"
    text="Вы уверены что хотите удалить данное оборудование?"
    :loading="loadingDelete"
    @cancel="closeDeleteDialog(false)"
    @submit="closeDeleteDialog(true)"
  />
  <admin-equipment-info-dialog
    v-if="infoDialogOpened"
    :opened="infoDialogOpened"
    :id="selectedItemId"
    @cancel="closeInfoDialog"
  />
  <hole-create-edit-dialog
    v-if="createHoleDialogOpened || editHoleDialogOpened || infoHoleDialogOpened"
    :opened="createHoleDialogOpened || editHoleDialogOpened || infoHoleDialogOpened"
    :model-url="modelUrl"
    :edit="editHoleDialogOpened || infoHoleDialogOpened"
    :id="holeId"
    :item="holeItem"
    :equipment-id="expanded[0]"
    :info="infoHoleDialogOpened"
    :loading="loadingHolesCreate || loadingHolesUpdate"
    @close="closeCreateEditHoleDialog(false)"
    @apply="closeCreateEditHoleDialog(true)"
  />
  <apply-dialog
    v-if="deleteHoleDialogOpened"
    :opened="deleteHoleDialogOpened"
    text="Вы уверены что хотите удалить данный штуцер?"
    :loading="loadingHolesDelete"
    @cancel="closeDeleteHoleDialog(false)"
    @submit="closeDeleteHoleDialog(true)"
  />
</template>

<style scoped lang="scss">

</style>
