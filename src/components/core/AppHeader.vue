<script setup lang="js">
import {useAuthStore} from "@/stores/core/auth.js";
import {computed, onMounted, watch} from "vue";
import {useRoute, useRouter} from "vue-router";

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const isAdmin = computed(() => authStore.getIsAdmin)
const loadingLogout = computed(() => authStore.loadingLogout)
const isOnLoginOrRegistration = computed(() => {
  return route.name === "login" || route.name === "register"
})
const isOnProfile = computed(() => {
  return route.name === "profile"
})

watch(() => isAuthenticated.value, (nVal) => {
  if (!nVal) return
  authStore.checkAdminPermissions()
})

watch(() => loadingLogout.value, (nVal) => {
  if (nVal) return
  router.push('/')
})


onMounted(() => {
  if (!isAuthenticated.value) return
  authStore.checkAdminPermissions()
})
</script>

<template>
 <v-app-bar color="#777" elevation="0" density="compact">
  <v-app-bar-title @click="router.push('/')" style="cursor: pointer;">ASM3D</v-app-bar-title>
   <v-spacer />
   <v-btn v-if="isAuthenticated && isAdmin" @click="router.push('/admin')">Администрирование</v-btn>
   <v-btn v-if="isAuthenticated && !isOnProfile" @click="router.push('/profile')">Профиль</v-btn>
   <v-btn v-if="isAuthenticated" @click="authStore.logout()" :loading="loadingLogout">Выйти</v-btn>
   <v-btn v-if="!isAuthenticated && !isOnLoginOrRegistration" @click="router.push('/register')">Регистрация</v-btn>
   <v-btn v-if="!isAuthenticated && !isOnLoginOrRegistration" @click="router.push('/login')">Войти</v-btn>
 </v-app-bar>
</template>

<style scoped lang="scss">

</style>
