<script setup lang="js">
import StandardToolbar from "@/components/core/StandardToolbar.vue";
import {computed, onMounted, ref} from "vue";
import ApplyDialog from "@/components/core/ApplyDialog.vue";
import {useProjectsStore} from "@/stores/old/projects.js";
import ProjectsToolbar from "@/components/projects/ProjectsToolbar.vue";
import ProjectDetail from "@/components/projects/ProjectDetail.vue";
import ProjectsListItem from "@/components/projects/ProjectsListItem.vue";
import ProjectsCreateEditDialog from "@/components/projects/ProjectsCreateEditDialog.vue";
import {useRoute} from "vue-router";

const search = ref('')
const deleteDialog = ref(false)
const editDialog = ref(false)
const createDialog = ref(false)
const deleteError = ref('')

const route = useRoute()
const store = useProjectsStore()
const list = computed(() => store.getList)
const detail = computed(() => store.getDetail)
const isLoadingList = computed(() => store.isLoadingList)
const isLoadingDetail = computed(() => store.isLoadingDetail)
const isLoadingDelete = computed(() => store.isLoadingDelete)
const isLoadingCreate = computed(() => store.isLoadingCreate)
const isLoadingUpdate = computed(() => store.isLoadingUpdate)
const filteredList = computed(() => {
  if (!search.value) return list.value
  return list.value.filter((item) => {
    return item.name.toLowerCase().includes(search.value.toLowerCase())
  })
})

const selectProject = async (item) => {
  if (detail.value && detail.value.id === item.id) return
  await store.loadDetail(item.id, item.type)
}

const openDeleteDialog = () => {
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deleteError.value = ''
}

const openEditDialog = () => {
  editDialog.value = true
}

const openCreateDialog = () => {
  createDialog.value = true
}

const closeCreateEditDialog = () => {
  createDialog.value = false
  editDialog.value = false
}

const deleteProject = async () => {
  try {
    await store.deleteItem()
    closeDeleteDialog()
  } catch (errors) {
    deleteError.value = errors.detail
  }
}

onMounted(async () => {
  await store.loadList()
  if (route.query.part || route.query.assembly) {
    await selectProject({
      id: route.query.part || route.query.assembly,
      type: route.query.part ? 'part' : 'assembly'
    })
  }
})
</script>

<template>
  <standard-toolbar title="Список проектов" />
  <v-row v-if="isLoadingList" no-gutters justify="center" class="align-content-center text-h6 pb-16" style="height: calc(100vh - 49px);">
    Идёт загрузка материалов...
  </v-row>
  <v-row v-else no-gutters style="height: calc(100vh - 65px);">
    <v-col cols="5" md="4" xl="3" style="border-right: 1px solid rgba(256, 256, 256, 0.7); height: calc(100vh - 49px);">
      <v-text-field v-model="search" class="pa-3" variant="outlined" hide-details label="Поиск по названию" clearable density="compact" clear-icon="mdi-close">
        <template v-slot:append>
          <v-tooltip text="Добавить проект" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                size="25"
                class="px-3 mr-1"
                flat
                color="#333"
                @click="openCreateDialog()"
              >
                <v-icon size="25" color="white">mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-text-field>
      <div style="border-bottom: 1px solid rgba(256, 256, 256, 0.7);"></div>
      <template v-if="list.length">
        <v-list bg-color="#333333" base-color="white" class="pa-0" v-if="filteredList.length" style="height: calc(100vh - 49px - 65px);">
          <projects-list-item v-for="project in filteredList" :item="project" @click="selectProject(project)" />
        </v-list>
        <v-row v-else no-gutters justify="center" class="align-content-center text-h6 pa-3 text-center">
          Материалы не найдены
        </v-row>
      </template>
      <v-row v-else no-gutters justify="center" class="align-content-center text-h6 pa-3 text-center">
        В системе нет ни одного проекта
      </v-row>
    </v-col>
    <v-col cols="7" md="8" xl="9" style="overflow-y: auto; height: calc(100vh - 49px);">
      <v-row v-if="isLoadingDetail" no-gutters justify="center" class="align-content-center text-h6 pb-16 text-center" style="height: calc(100vh - 49px);">
        Идёт загрузка проекта...
      </v-row>
      <v-row v-else-if="!detail" no-gutters justify="center" class="align-content-center text-h6 pb-16 text-center" style="height: calc(100vh - 49px);">
        Выберите проект для работы
      </v-row>
      <template v-else>
        <projects-toolbar :item="detail" @delete="openDeleteDialog" @edit="openEditDialog" />
        <project-detail :item="detail" />
      </template>
    </v-col>
  </v-row>
  <apply-dialog
    :opened="deleteDialog"
    text="Вы уверены, что хотите удалить данный проект?"
    :loading="isLoadingDelete"
    :error="deleteError"
    @submit="deleteProject"
    @cancel="closeDeleteDialog"
  />
  <projects-create-edit-dialog
    :opened="createDialog || editDialog"
    :loading="isLoadingCreate || isLoadingUpdate"
    :edit="editDialog"
    @close="closeCreateEditDialog"
  />
</template>

<style scoped lang="scss">

</style>
