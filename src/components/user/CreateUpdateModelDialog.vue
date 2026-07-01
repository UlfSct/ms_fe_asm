<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useMaterialsStore} from "@/stores/user/materials.js";
import {useModelsStore} from "@/stores/user/models.js";
import {getModelDimensions} from "@/utils/three.js";

const emit = defineEmits(['close', 'apply'])

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  edit: {
    type: Boolean,
    required: false,
    default: false
  },
  id: Number
})

const formData = ref({
  name: '',
  file: null,
  share: false,
  width: 1.0,
  height: 1.0,
  depth: 1.0,
})
const preloadedFile = ref(false)


const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useModelsStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование модели' : 'Создание модели'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = async () => {
  if (props.edit) {
    await store.loadDetail(props.id)
    preloadedFile.value = detail.value.file
    formData.value = {
      name: detail.value.name,
      file: null,
      share: detail.value.share,
      width: detail.value.width,
      height: detail.value.height,
      depth: detail.value.depth,
    }
    return
  }

  preloadedFile.value = false
  formData.value = {
    name: '',
    file: null,
    share: false,
    width: 1.0,
    height: 1.0,
    depth: 1.0,
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const onFileChange = async (file) => {
  if (!file) return;
  try {
    const dims = await getModelDimensions(file);
    formData.value.width = dims.width;
    formData.value.height = dims.height;
    formData.value.depth = dims.depth;
  } catch (error) {
    console.error('Не удалось вычислить размеры модели:', error);
    // Оставьте значения по умолчанию или покажите предупреждение
  }
};

const sendForm = async () => {
  let requestData = new FormData()
  requestData.append('name', formData.value.name)
  requestData.append('share', formData.value.share)
  if (formData.value.file) {
    requestData.append('file', formData.value.file)
    requestData.append('width', formData.value.width);
    requestData.append('height', formData.value.height);
    requestData.append('depth', formData.value.depth);
  }
  try {
    if (!props.edit) await store.createItem(requestData)
    else await store.updateItem(props.id, requestData)
    emit('apply')
  } catch (errors) {
    mapErrors(errors)
  }
}

onMounted(() => {
  if (props.opened) {
    initializeForm()
  }
})
</script>

<template>
  <create-edit-dialog
    :opened="opened"
    :loading="loading"
    :title="dialogTitle"
    :submit-text="submitText"
    @cancel="emit('close')"
    @submit="sendForm"
  >
    <template v-if="!loadingDetail">
      <v-text-field
        v-model="formData.name"
        label="Название"
        variant="outlined"
        required
        class="mb-3"
        :error="hasError('name')"
        :error-messages="getError('name')"
      />
      <v-file-input
        v-model="formData.file"
        :label="preloadedFile ? 'Заменить файл (.fbx)' : 'Файл (.fbx)'"
        accept=".fbx"
        variant="outlined"
        required
        class="mb-3"
        :error="hasError('file')"
        :error-messages="getError('file')"
        @update:model-value="onFileChange"
      >
        <template v-if="preloadedFile" v-slot:append>
          <v-btn
            :href="preloadedFile"
            download
            icon="mdi-download"
            variant="text"
            color="primary"
            size="medium"
          />
        </template>
      </v-file-input>
      <v-checkbox
        v-model="formData.share"
        label="Поделиться с командой"
        required
        class="mb-3"
        :error="hasError('share')"
        :error-messages="getError('share')"
      />
    </template>
    <v-skeleton-loader v-else type="list-item, list-item, list-item, list-item, list-item" />
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
