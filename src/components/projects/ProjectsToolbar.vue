<script setup lang="js">
const emit = defineEmits(['delete', 'edit'])

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <v-toolbar flat color="#333" style="border-bottom: 1px solid rgba(256, 256, 256, 0.7)!important;">
    <template v-slot:append>
      <v-tooltip text="Редактировать проект" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" size="25" class="px-3 mr-2" @click="emit('edit')">
            <v-icon size="25" color="white">mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip v-if="item.can_delete" text="Удалить проект" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" size="25" class="px-3 mr-2" @click="emit('delete')">
            <v-icon size="25" color="red-darken-1">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:title>
      {{ props.item.name }}
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">

</style>
