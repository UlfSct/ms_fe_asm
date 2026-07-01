<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useAdminModelsStore} from "@/stores/admin/models.js";
import {useAdminTypesStore} from "@/stores/admin/types.js";

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
  id: Number,
  item: [Object, null],
})

const formData = ref({
  name: '',
  file: null,
  is_active: true
})
const preloadedFile = ref(false)

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useAdminTypesStore()
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование типа оборудования' : 'Создание типа оборудования'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = async () => {
  if (props.edit) {
    preloadedFile.value = props.item.file
    formData.value = {
      name: props.item.name,
      file: null,
      is_active: props.item.is_active,
    }
    return
  }

  preloadedFile.value = false
  formData.value = {
    name: '',
    file: null,
    is_active: true
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

watch(() => !!formData.value.file, (nVal) => {
  if (nVal) preloadedFile.value = false
})

const sendForm = async () => {
  let requestData = new FormData()
  requestData.append('name', formData.value.name)
  requestData.append('is_active', formData.value.is_active)
  if (formData.value.file) {
    requestData.append('file', formData.value.file)
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
    <template v-slot:default>
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
        :label="preloadedFile ? 'Заменить иконку (.svg)' : 'Иконка (.svg)'"
        accept=".svg"
        variant="outlined"
        required
        class="mb-3"
        :error="hasError('file')"
        :error-messages="getError('file')"
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
        v-model="formData.is_active"
        label="Активность"
        variant="outlined"
        class="mb-3"
        :error="hasError('is_active')"
        :error-messages="getError('is_active')"
      />
    </template>
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
