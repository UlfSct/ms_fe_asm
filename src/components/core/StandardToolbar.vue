<script setup lang="js">
import { useRouter } from "vue-router";

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const router = useRouter()
</script>

<template>
  <v-toolbar flat color="#333" style="border-bottom: 1px solid rgba(256, 256, 256, 0.7)!important;" density="compact">
    <template v-slot:prepend>
      <v-btn size="25" class="px-3 ml-3" @click="router.push('/')">
        <v-icon size="25" color="white">mdi-arrow-left</v-icon>
      </v-btn>
    </template>
    <template v-slot:title>
      {{ props.title }}
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">

</style>
