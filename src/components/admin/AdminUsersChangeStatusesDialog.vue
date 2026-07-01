<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useAdminUsersStore} from "@/stores/admin/users.js";

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
  item: Object
})

const formData = ref({
  is_active: false,
  is_admin: false
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useAdminUsersStore()
const dialogTitle = computed(() => {
  return 'Редактирование статусов пользователя'
})
const submitText = computed(() => {
  return 'Сохранить'
})

const initializeForm = () => {
  formData.value = {
    is_active: props.item.is_active,
    is_admin: props.item.is_admin
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const sendForm = async () => {
  clearErrors()
  let requestData = {
    is_active: formData.value.is_active,
    is_admin: formData.value.is_admin
  }
  try {
    await store.updateItem(props.item.id, requestData)
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
    <v-checkbox
      v-model="formData.is_admin"
      label="Администратор"
      variant="outlined"
      hide-details
      :error="hasError('is_admin')"
      :error-messages="getError('is_admin')"
    />
    <v-checkbox
      v-model="formData.is_active"
      label="Активен"
      variant="outlined"
      hide-details
      class="mb-1"
      :error="hasError('is_active')"
      :error-messages="getError('is_active')"
    />
    <v-alert v-if="hasError('detail')" type="error" class="mb-3">{{ String(getError('detail')) }}</v-alert>
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
