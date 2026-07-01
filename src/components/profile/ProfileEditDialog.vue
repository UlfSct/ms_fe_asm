<script setup lang="js">
import {computed, onMounted, ref, watch} from "vue";
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useAuthStore} from "@/stores/core/auth.js";

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

const formData = ref({
  name: '',
  surname: '',
  lastname: 0.0
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()
const store = useAuthStore()
const detail = computed(() => store.getProfile)
const loading = computed(() => store.loadingProfileUpdate)
const dialogTitle = computed(() => {
  return 'Редактирование профиля'
})
const submitText = computed(() => {
  return 'Сохранить'
})

const initializeForm = () => {
  formData.value = {
    name: detail.value.name,
    surname: detail.value.surname,
    lastname: detail.value.lastname || '',
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const sendForm = async () => {
  try {
    await store.updateProfile(formData.value)
    emit('close')
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
    <v-text-field
      v-model="formData.surname"
      variant="outlined"
      class="my-3"
      density="comfortable"
      :error="hasError('surname')"
      :error-messages="getError('surname')"
    >
      <template v-slot:label>
        Фамилия<span class="text-red">*</span>
      </template>
    </v-text-field>
    <v-text-field
      v-model="formData.name"
      variant="outlined"
      class="my-3"
      density="comfortable"
      :error="hasError('name')"
      :error-messages="getError('name')"
    >
      <template v-slot:label>
        Имя<span class="text-red">*</span>
      </template>
    </v-text-field>
    <v-text-field
      v-model="formData.lastname"
      variant="outlined"
      class="my-3"
      density="comfortable"
      :error="hasError('lastname')"
      :error-messages="getError('lastname')"
    >
      <template v-slot:label>
        Отчество
      </template>
    </v-text-field>
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
