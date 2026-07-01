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
  id: Number
})

const formData = ref({
  name: ''
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useSchemesStore()
const loadingResult = computed(() => store.isLoadingCreateResult)
const dialogTitle = computed(() => {
  return 'Получение 3Д модели'
})
const submitText = computed(() => {
  return 'Создать'
})

const initializeForm = async () => {
  formData.value = {
    name: ''
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
    name: formData.value.name
  }
  try {
    await store.createResult(props.id, requestData)
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
    :loading="loadingResult"
    :title="dialogTitle"
    :submit-text="submitText"
    @cancel="emit('close')"
    @submit="sendForm"
  >
    <v-text-field
      v-model="formData.name"
      label="Название"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('name')"
      :error-messages="getError('name')"
    />
    <v-text-field
      label="Зерно генерации"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('name')"
      :error-messages="getError('name')"
    />
    <v-text-field
      label="Размер популяции"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('name')"
      :error-messages="getError('name')"
    />
    <v-text-field
      label="Максимальное количество итераций"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('name')"
      :error-messages="getError('name')"
    />
    <v-text-field
      label="Весовые коэффициенты через запятую"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('name')"
      :error-messages="getError('name')"
    />
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
