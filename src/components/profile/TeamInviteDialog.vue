<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useMaterialsStore} from "@/stores/user/materials.js";
import {useTeamStore} from "@/stores/user/team.js";

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
  }
})

const formData = ref({
  identifier: ''
})
const needRefresh = ref(false)
const showSuccessPopup = ref(false)

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useTeamStore()
const dialogTitle = computed(() => {
  return 'Приглашение в команду'
})
const submitText = computed(() => {
  return 'Отправить'
})

const initializeForm = () => {
  formData.value = {
    identifier: ''
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
    showSuccessPopup.value = false
  }
})

const sendForm = async () => {
  clearErrors()
  showSuccessPopup.value = false
  let requestData = {
    identifier: formData.value.identifier
  }
  try {
    await store.createInvite(requestData)
    needRefresh.value = true
    showSuccessPopup.value = true
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
  @cancel="needRefresh ? emit('apply') : emit('close')"
  @submit="sendForm"
>
  <v-text-field
    v-model="formData.identifier"
    label="Логин/почта"
    variant="outlined"
    required
    class="mb-3"
    :error="hasError('identifier')"
    :error-messages="getError('identifier')"
  />
  <v-alert type="success" v-if="showSuccessPopup">Пользователь успешно приглашён</v-alert>
</create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
