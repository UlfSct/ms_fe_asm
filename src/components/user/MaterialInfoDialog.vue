<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {formatDate, getFaceFullName} from "@/utils/date.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

const emit = defineEmits(['close', 'apply'])

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  id: Number
})


const store = useMaterialsStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const dialogTitle = computed(() => {
  return 'Информация о материале'
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
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Основной цвет:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          <div :style="`background: ${detail.base_color}; border: 1px solid black; color: ${Number(detail.base_color[1]) < 8 ? 'white' : 'black'}`" class="px-3 py-1">
            {{ detail.base_color }}
          </div>
        </v-col>
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
          <b>Отражаемость:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.reflectivity }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Прозрачность:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.transparency }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>ОтГлянцевость:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ detail.shininess }}
        </v-col>
      </v-row>
      <v-divider/>
      <v-row no-gutters>
        <v-col cols="6" class="py-1 px-2">
          <b>Глобальный:</b>
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
