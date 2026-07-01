<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import { onMounted, ref, watch} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";

const emit = defineEmits(['close', 'apply'])

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  connections: Array,
  equipmentHoles: Array,
  outerAvailableHoles: Array,
  materials: Array
})

const formData = ref({
  connections: []
})

const { getError, hasError, mapErrors, clearErrors } = useFormErrors()

const initializeForm = async () => {
  formData.value = {
    connections: props.equipmentHoles.map((item) => {
      return {
        connectionId: null,
        id: item.id,
        hole: null,
        material: null,
        reverse: false,
        r: 20.0,
      }
    })
  }

  for (let connection of props.connections) {
    let tmpConnection = Object.assign({}, connection)
    if (tmpConnection.reverse) {
      let tmp = tmpConnection.scheme_equipment_hole_start
      tmpConnection.scheme_equipment_hole_start = tmpConnection.scheme_equipment_hole_end
      tmpConnection.scheme_equipment_hole_end = tmp
    }
    for (let formConnection of formData.value.connections) {
      if (tmpConnection.scheme_equipment_hole_start === formConnection.id) {
        formConnection.connectionId = tmpConnection.id
        formConnection.hole = tmpConnection.scheme_equipment_hole_end
        formConnection.material = tmpConnection.material
        formConnection.reverse = tmpConnection.reverse
        formConnection.r = tmpConnection.r
        break
      }
    }
  }
}

watch(() => props.opened, (newVal) => {
  if (newVal) {
    initializeForm()
    clearErrors()
  }
})

const getOuterAvailableHoles = (allowedId) => {
  let items = props.outerAvailableHoles
  let filteredIds = formData.value.connections.filter(item => item.hole).map(item => item.hole).filter(item => item !== allowedId)
  return items.filter(item => !filteredIds.includes(item.id))
}

const sendForm = async () => {
  let errors = {}
  for (let connection of formData.value.connections) {
    if (!connection.material && connection.hole) {
      errors[`material_${connection.id}`] = 'Необходимо указать материал.'
    }
  }

  if (Object.keys(errors).length > 0) {
    mapErrors(errors)
    return
  }

  emit('apply', formData.value.connections.map(
    item => {
      return {
        connection_id: item.connectionId,
        id: item.reverse ? item.hole : item.id,
        hole: item.reverse ? item.id : item.hole,
        material: item.material,
        reverse: item.reverse,
        r: Number(item.r) ? Number(item.r) : 20.0,
      }
    }
  ))
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
    title="Редактирование соединений оборудования"
    submit-text="Сохранить"
    :max-width="1200"
    @cancel="emit('close')"
    @submit="sendForm"
  >
    <v-card-title v-if="!equipmentHoles.length">У оборудования не задано ни одного штуцера</v-card-title>
    <template v-else>
      <template v-for="(connection, i) in formData.connections">
        <v-row no-gutters>
          <v-col cols="3">
            <v-select
              v-model="connection.hole"
              :items="getOuterAvailableHoles(connection.hole)"
              :label="equipmentHoles[i].name"
              item-title="selectorName"
              item-value="id"
              variant="outlined"
              required
              clearable
              class="mb-3 pr-2"
              @click:clear="() => formData.connections[i].material = null"
            >
              <template v-slot:no-data>
                <v-row no-gutters class="pa-3 justify-center">
                  На схеме не осталось доступных штуцеров оборудования
                </v-row>
              </template>
            </v-select>
          </v-col>
          <v-col cols="3">
            <v-select
              v-model="connection.material"
              :items="props.materials"
              :disabled="!connection.hole"
              label="Материал соединения"
              item-title="name"
              item-value="id"
              variant="outlined"
              required
              class="mb-3 pl-2"
              :error="hasError(`material_${connection.id}`)"
              :error-messages="getError(`material_${connection.id}`)"
            ></v-select>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="connection.r"
              :disabled="!connection.hole"
              label="Радиус (мм)"
              variant="outlined"
              required
              class="mb-3 pl-2"
              :error="hasError(`r_${connection.id}`)"
              :error-messages="getError(`r_${connection.id}`)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              :disabled="!connection.hole"
              label="Радиус отступа (мм)"
              variant="outlined"
              required
              class="mb-3 pl-2"
              :error="hasError(`r_${connection.id}`)"
              :error-messages="getError(`r_${connection.id}`)"
            ></v-text-field>
          </v-col>
        </v-row>
      </template>
    </template>
  </create-edit-dialog>
</template>

<style scoped lang="scss">

</style>
