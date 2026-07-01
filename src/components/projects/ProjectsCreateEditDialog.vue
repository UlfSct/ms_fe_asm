<script setup lang="js">
import {computed, onMounted, ref, watch} from "vue";
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useProjectsStore} from "@/stores/old/projects.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

const emit = defineEmits(['close'])

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
})

const projectTypesItems = [
  {
    title: 'Деталь',
    value: 'part'
  },
  {
    title: 'Сборка',
    value: 'assembly'
  }
]

const formData = ref({
  name: '',
  description: '',
  material: null
})
const type = ref('assembly')

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()
const store = useProjectsStore()
const materialsStore = useMaterialsStore()
const isLoadingMaterialsSelector = computed(() => materialsStore.isLoadingSelectorList)
const materialsSelectorItems = computed(() => materialsStore.getSelectorList)
const detail = computed(() => store.getDetail)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование проекта' : 'Создание проекта'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = () => {
  if (props.edit) {
    formData.value = {
      name: detail.value.name,
      description: detail.value.description || '',
      material: detail.value.material,
    }
    return
  }

  formData.value = {
    name: '',
    description: '',
    material: null,
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
    description: formData.value.description,
  }
  if (!props.edit && type.value === 'part' || props.edit && detail.value.type === 'part') {
    requestData.material = formData.value.material
  }
  try {
    if (!props.edit) await store.createItem(requestData, type.value)
    else await store.updateItem(requestData)
    emit('close')
  } catch (errors) {
    mapErrors(errors)
  }

}

onMounted(async () => {
  await materialsStore.loadSelectorItemsList()
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
    <v-select
      v-if="!props.edit"
      v-model="type"
      :items="projectTypesItems"
      label="Тип проекта"
      variant="outlined"
      required
      class="mb-3"
    />
    <v-select
      v-if="!props.edit && type === 'part' || props.edit && detail.type === 'part'"
      v-model="formData.material"
      :items="materialsSelectorItems"
      :loading="isLoadingMaterialsSelector"
      label="Материал"
      variant="outlined"
      required
      class="mb-3"
      item-value="id"
      item-title="name"
      :error="hasError('material')"
      :error-messages="getError('material')"
    />
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
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
