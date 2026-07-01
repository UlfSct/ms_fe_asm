<script setup lang="js">
import {formatDate} from "@/utils/date.js";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <v-list-item style="border-bottom: 1px solid rgba(256, 256, 256, 0.12)">
    <v-list-item-title class="text-h6">
      <b :style="`color: ${props.item.type === 'assembly' ? 'coral' : 'yellow'}`">
        {{ props.item.type === 'assembly' ? '(Сборка)' : '(Деталь)' }}
      </b>
      {{ props.item.name }}
    </v-list-item-title>
    <v-list-item-subtitle class="d-flex flex-column">
        <span>
          Создан: {{ formatDate(props.item.created) }}
        </span>
      <span>
          Обновлен: {{ formatDate(props.item.updated) }}
        </span>
    </v-list-item-subtitle>
  </v-list-item>
</template>

<style scoped lang="scss">

</style>
