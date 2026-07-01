<script setup lang="js">
import { useRouter } from 'vue-router'
import {useAuthStore} from "@/stores/core/auth.js";
import {computed, onMounted} from "vue";
import logo from "@/assets/logo.png";

const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const isAdmin = computed(() => authStore.getIsAdmin)
const loadingAdmin = computed(() => authStore.loadingAdmin)

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/')
  }
  await authStore.checkAdminPermissions()
  if (!isAdmin.value) await router.push('/profile')
})
</script>

<template>
  <v-card v-if="loadingAdmin" class="ma-3">
    <v-row no-gutters class="justify-center pa-3">
      Идёт проверка прав доступа, ожидайте.
    </v-row>
  </v-card>
  <v-row v-else no-gutters class="pa-4 align-center align-content-center fill-height">
    <v-row no-gutters class="justify-center pa-3" style="width: 100%">
      <v-img :src="String(logo)" height="120" class="mb-6" />
    </v-row>
    <v-row no-gutters class="justify-center pa-2" style="width: 100%">
      <v-col cols="6">
        <v-btn base-color="#555" width="100%" @click="router.push('/admin/users')">
          Список пользователей
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters class="justify-center pa-2" style="width: 100%">
      <v-col cols="6">
        <v-btn base-color="#555" width="100%" @click="router.push('/admin/materials')">
          Список глобальных материалов
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters class="justify-center pa-2" style="width: 100%">
      <v-col cols="6">
        <v-btn base-color="#555" width="100%" @click="router.push('/admin/models')">
          Список глобальных моделей
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters class="justify-center pa-2" style="width: 100%">
      <v-col cols="6">
        <v-btn base-color="#555" width="100%" @click="router.push('/admin/equipments')">
          Список глобального оборудования
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters class="justify-center pa-2" style="width: 100%">
      <v-col cols="6">
        <v-btn base-color="#555" width="100%" @click="router.push('/admin/types')">
          Список типов оборудования
        </v-btn>
      </v-col>
    </v-row>
  </v-row>
</template>

<style scoped lang="scss">

</style>
