<script setup>
import { RouterView } from 'vue-router'
import {useAuthStore} from "@/stores/core/auth.js";
import {onBeforeMount, ref} from "vue";
import AppHeader from "@/components/core/AppHeader.vue";

const check = ref(false)

onBeforeMount(async () => {
  const authStore = useAuthStore()
  authStore.checkCookieToken()
  check.value = true
})

</script>

<template>
  <v-app style="background: linear-gradient(180deg, #888888, #999999)!important; color: white!important; overflow: hidden!important;">
    <app-header />
    <v-main style="height: calc(100vh - 48px); overflow-y: auto!important; overflow-x: hidden!important; ">
      <router-view v-if="check"/>
    </v-main>
  </v-app>
</template>

<style>
:root {
  scrollbar-color: #555 #f5f5f5;
  scrollbar-width: thin;
}

*::-webkit-scrollbar {
  width: 10px;
}

*::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0);
}

*::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}

*::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Для Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #555 #f1f1f1;
}

html {
  overflow-y: hidden!important;
}
</style>
