<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useMaterialsStore} from "@/stores/user/materials.js";
import {useSchemesStore} from "@/stores/user/schemes.js";

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
  description: ''
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useSchemesStore()
const detail = computed(() => store.getDetail)
const loadingDetail = computed(() => store.isLoadingDetail)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование схемы' : 'Создание схемы'
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
    description: ''
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
    description: formData.value.description || ''
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
    </template>
    <v-skeleton-loader v-else type="list-item, list-item, list-item, list-item, list-item" />
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
