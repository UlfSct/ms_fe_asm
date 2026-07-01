<script setup lang="js">
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter()
const route = useRoute()

const queryRow = computed(() => {
  if (route.query.assembly) return '?assembly=' + route.query.assembly
  if (route.query.part) return '?part=' + route.query.part
  return ''
})
</script>

<template>
  <v-toolbar flat color="#333" style="border-bottom: 1px solid #333!important;" density="compact">
    <template v-slot:prepend>
      <v-btn size="25" class="px-3 ml-3" @click="router.push('/models/constructor/projects' + queryRow)">
        <v-icon size="25" color="white">mdi-arrow-left</v-icon>
      </v-btn>
    </template>
    <template v-slot:title>
      Конструктор моделей
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">

</style>
