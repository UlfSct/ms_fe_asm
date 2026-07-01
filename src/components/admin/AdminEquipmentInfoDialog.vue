<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {formatDate, getFaceFullName} from "@/utils/date.js";
import {useAdminEquipmentsStore} from "@/stores/admin/equipments.js";
import {API_URL} from "@/utils/requests.js";

const emit = defineEmits(['close', 'apply'])

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  id: Number
})


const store = useAdminEquipmentsStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const dialogTitle = computed(() => {
  return 'Информация об оборудовании'
})


watch(() => props.opened, (newVal) => {
  if (newVal) {
    store.loadDetail(props.id)
  }
})


onMounted(() => {
  if (props.opened) {
    store.loadDetail(props.id)
  }
})
</script>

<template>
  <create-edit-dialog
    :opened="opened"
    :loading="false"
    :title="dialogTitle"
    :show-submit="false"
    cancel-text="Выйти"
    @cancel="emit('close')"
  >
    <v-row v-if="!loadingDetail && detail" no-gutters class="py-1 mb-6">
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Название:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.name }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Описание:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.description ? detail.description : "-" }}
        </v-col>
      </v-row>
      <v-divider />
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Название модели:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.model.name }}
        </v-col>
      </v-row>
      <v-divider />
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Файл модели:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          <a :href="`${API_URL}${detail.model.file}`" download target="_blank">
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
        </v-col>
      </v-row>
      <v-divider />
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Тип оборудования:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.type.name }}
        </v-col>
      </v-row>
      <v-divider />
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Иконка типа:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          <a :href="`${API_URL}${detail.type.file}`" download target="_blank">
            <v-tooltip text="Скачать иконку" location="bottom">
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
        </v-col>
      </v-row>
      <v-divider />
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Создатель:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2" v-html="`${getFaceFullName(detail.user)}<br/> <b>${detail.user.username}<br/> ${detail.user.email}</b>`" />
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Дата создания:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ formatDate(detail.created) }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Дата обновления:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ formatDate(detail.updated) }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Глобальное:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          <v-icon v-if="detail.is_global" icon="mdi-check-circle-outline" color="green"/>
          <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Разрешён доступ команды:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          <v-icon v-if="detail.share" icon="mdi-check-circle-outline" color="green"/>
          <v-icon v-else icon="mdi-close-circle-outline" color="red"/>
        </v-col>
      </v-row>
    </v-row>
    <v-skeleton-loader v-else type="list-item, list-item, list-item, list-item, list-item" />
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
