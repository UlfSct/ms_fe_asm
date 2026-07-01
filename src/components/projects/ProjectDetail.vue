<script setup lang="js">
import logo from '@/assets/logo.png'
import {computed} from "vue";
import { useRouter} from "vue-router";
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const queryRow = computed(() => {
  if (!props.item) return ''
  if (props.item.type === 'assembly') return '?assembly=' + props.item.id
  if (props.item.type === 'part') return '?part=' + props.item.id
  return ''
})

const goToConstructor = () => {
  router.push('/models/constructor' + queryRow.value)
}
</script>

<template>
  <v-row no-gutters class="px-3 py-2">
    <v-col cols="12" class="pa-0 ma-0 text-h6">
      <v-img :src="String(logo)" height="120" class="my-6" />
    </v-col>
    <v-divider/>
    <v-col cols="12" class="pa-2 ma-0 text-h6">
      Свойства проекта:
    </v-col>
    <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
      <b>Описание:</b>
    </v-col>
    <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
      {{ props.item.description ? props.item.description : '-'}}
    </v-col>
    <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
      <b>Тип:</b>
    </v-col>
    <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
      {{ props.item.type === 'assembly' ? 'Сборка' : 'Деталь' }}
    </v-col>
    <template v-if="props.item.type === 'part'">
      <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
        <b>Материал:</b>
      </v-col>
      <v-col cols="6" class="pa-2 ma-0 text-subtitle-1" style="border: 1px solid rgba(256, 256, 256, 0.12)">
        {{ props.item.material.name }}
      </v-col>
    </template>
    <v-btn
      class="mt-4"
      color="primary"
      variant="flat"
      @click="goToConstructor"
    >
      В конструктор
    </v-btn>
  </v-row>
</template>

<style scoped lang="scss">

</style>
