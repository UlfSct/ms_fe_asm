<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useAdminMaterialsStore} from "@/stores/admin/materials.js";
import {useAdminEquipmentsStore} from "@/stores/admin/equipments.js";
import {useSelectorsStore} from "@/stores/core/selectors.js";

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
  type: null,
  model: null
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useAdminEquipmentsStore()
const selectorsStore = useSelectorsStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const modelsSelector = computed(() => selectorsStore.getModels)
const typesSelector = computed(() => selectorsStore.getTypes)
const loadingModelsSelector = computed(() => selectorsStore.isLoadingModels)
const loadingTypesSelector = computed(() => selectorsStore.isLoadingTypes)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование оборудования' : 'Создание оборудования'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = async () => {
  if (props.edit) {
    await store.loadDetail(props.id)
    formData.value = {
      name: detail.value.name,
      description: detail.value.description
    }
    return
  }

  formData.value = {
    name: '',
    description: '',
    type: null,
    model: null
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
    ...(
      !props.edit
        ? {
          type: formData.value.type,
          model: formData.value.model,
        }
        : {}
    )
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
    selectorsStore.loadModels()
    selectorsStore.loadTypes()
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
    <template v-if="!loadingDetail && !loadingModelsSelector && !loadingTypesSelector">
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
      <v-select
        v-if="!props.edit"
        v-model="formData.model"
        :items="modelsSelector"
        label="Модель"
        item-title="name"
        item-value="id"
        variant="outlined"
        required
        class="mb-3"
        :error="hasError('model')"
        :error-messages="getError('model')"
      />
      <v-select
        v-if="!props.edit"
        v-model="formData.type"
        :items="typesSelector"
        label="Тип"
        item-title="name"
        item-value="id"
        variant="outlined"
        required
        class="mb-3"
        :error="hasError('type')"
        :error-messages="getError('type')"
      />
    </template>
    <v-skeleton-loader v-else type="list-item, list-item, list-item, list-item, list-item" />
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
