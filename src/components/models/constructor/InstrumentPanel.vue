<script setup lang="js">
import sketch from "@/assets/sketch.png"
import unsketch from "@/assets/unsketch.png"
import {computed} from "vue";

const emit = defineEmits(['action'])

const props = defineProps({
  selected: {
    type: [Object, null],
    required: true
  },
  sketch: {
    type: Boolean,
    required: true
  }
})

const sketchEnabled = computed(() => {
  return props.selected && props.selected.userData && props.selected.userData.type === 'plane'
})
</script>

<template>
  <v-row no-gutters style="height: calc(90px); border-bottom: 1px solid #333!important; width: 100%; color: #333333!important;">
    <v-card
      v-if="!props.sketch"
      no-gutters
      :disabled="!sketchEnabled"
      style="width: 90px!important; border-right: 1px solid #333!important;"
      class="rounded-0 justify-center text-center elevation-0"
      @click="emit('action', 'sketch')"
    >
      <v-img :src="String(sketch)" height="60" width="90"/>
      <v-card-text class="ma-0 pa-0">Эскиз</v-card-text>
    </v-card>
    <v-card
      v-else
      no-gutters
      style="width: 90px!important; border-right: 1px solid #333!important;"
      class="rounded-0 justify-center text-center elevation-0"
      @click="emit('action', 'unsketch')"
    >
      <v-img :src="String(unsketch)" height="35" width="90" class="mt-2"/>
      <v-card-text class="ma-0 pa-0">Выйти из эскиза</v-card-text>
    </v-card>
  </v-row>
</template>

<style scoped lang="scss">

</style>
