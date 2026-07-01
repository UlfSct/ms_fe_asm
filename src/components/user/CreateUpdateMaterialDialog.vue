<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

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
  description: '',
  base_color: '',
  reflectivity: 0,
  transparency: 0,
  shininess: 0,
  share: false
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useMaterialsStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование материала' : 'Создание материала'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = async () => {
  if (props.edit) {
    await store.loadDetail(props.id)
    formData.value = {
      name: detail.value.name,
      description: detail.value.description,
      base_color: detail.value.base_color,
      reflectivity: detail.value.reflectivity,
      transparency: detail.value.transparency,
      shininess: detail.value.shininess,
      share: detail.value.share,
    }
    return
  }

  formData.value = {
    name: '',
    description: '',
    base_color: '#333333',
    reflectivity: 0,
    transparency: 0,
    shininess: 0,
    share: false
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const sendForm = async () => {
  let requestData = {
    name: formData.value.name,
    description: formData.value.description || '',
    base_color: formData.value.base_color,
    reflectivity: formData.value.reflectivity,
    transparency: formData.value.transparency,
    shininess: formData.value.shininess,
    share: formData.value.share
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
      <v-textarea
        v-model="formData.description"
        label="Описание"
        variant="outlined"
        rows="3"
        class="mb-3"
        :error="hasError('description')"
        :error-messages="getError('description')"
      />
      <v-text-field
        v-model="formData.base_color"
        label="Базовый цвет"
        variant="outlined"
        type="color"
        class="mb-3"
        :error="hasError('base_color')"
        :error-messages="getError('base_color')"
      />
      <v-slider
        v-model="formData.reflectivity"
        label="Отражаемость"
        min="0"
        max="1"
        step="0.000001"
        :error="hasError('reflectivity')"
        :error-messages="getError('reflectivity')"
      >
        <template v-slot:append>
          <v-text-field
            v-model.number="formData.reflectivity"
            type="number"
            min="0"
            max="1"
            step="0.000001"
            style="width: 96px;"
            hide-details
            variant="outlined"
            density="compact"
          />
        </template>
      </v-slider>
      <v-slider
        v-model="formData.transparency"
        label="Прозрачность"
        min="0"
        max="1"
        step="0.000001"
        class="mb-3"
        :error="hasError('transparency')"
        :error-messages="getError('transparency')"
      >
        <template v-slot:append>
          <v-text-field
            v-model.number="formData.transparency"
            type="number"
            min="0"
            max="1"
            step="0.000001"
            style="width: 96px;"
            hide-details
            variant="outlined"
            density="compact"
          />
        </template>
      </v-slider>
      <v-slider
        v-model="formData.shininess"
        label="Глянцевость"
        min="0"
        max="1"
        step="0.000001"
        class="mb-3"
        :error="hasError('shininess')"
        :error-messages="getError('shininess')"
      >
        <template v-slot:append>
          <v-text-field
            v-model.number="formData.shininess"
            type="number"
            min="0"
            max="1"
            step="0.000001"
            style="width: 96px;"
            hide-details
            variant="outlined"
            density="compact"
          />
        </template>
      </v-slider>
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
