<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

const emit = defineEmits(['close', 'apply', 'delete'])

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  equipments: Array,
  materials: Array,
  item: [Object, null],
})

const formData = ref({
  equipment: null,
  material: null
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const initializeForm = async () => {
  formData.value = {
    equipment: props.item.equipment,
    material: props.item.material
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const sendForm = async () => {
  let errors = {}
  if (!formData.value.equipment) {
    errors.equipment = 'Необходимо выбрать оборудование.'
  }
  if (!formData.value.material) {
    errors.material = 'Необходимо выбрать материал оборудования.'
  }
  if (Object.keys(errors).length > 0) {
    mapErrors(errors)
    return
  }
  let requestData = {
    equipment: formData.value.equipment,
    material: formData.value.material
  }
  emit('apply', requestData)
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
    title="Редактирование оборудования на схеме"
    submit-text="Сохранить"
    @cancel="emit('close')"
    @submit="sendForm"
  >
    <v-select
      v-model="formData.equipment"
      :items="props.equipments"
      label="Оборудование"
      item-title="name"
      item-value="id"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('equipment')"
      :error-messages="getError('equipment')"
    />
    <v-select
      v-model="formData.material"
      :items="props.materials"
      label="Материал"
      item-title="name"
      item-value="id"
      variant="outlined"
      required
      class="mb-3"
      :error="hasError('material')"
      :error-messages="getError('material')"
    />
    <v-row no-gutters class="justify-center px-2 py-1 mb-3">
      <v-btn
        variant="outlined"
        @click="emit('delete')"
        class="mr-2"
        color="red"
      >
        Удалить оборудование
      </v-btn>
    </v-row>
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
