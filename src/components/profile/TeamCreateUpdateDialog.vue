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
  },
  edit: {
    type: Boolean,
    required: false,
    default: false
  },
})

const formData = ref({
  name: ''
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const store = useTeamStore()
const detail = computed(() => store.getTeam)
const dialogTitle = computed(() => {
  return props.edit ? 'Редактирование команды' : 'Создание команды'
})
const submitText = computed(() => {
  return props.edit ? 'Обновить' : 'Создать'
})

const initializeForm = () => {
  if (props.edit) {
    formData.value = {
      name: detail.value.name
    }
    return
  }

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
    if (!props.edit) await store.createTeam(requestData)
    else await store.updateTeam(requestData)
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
  <v-text-field
    v-model="formData.name"
    label="Название"
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
