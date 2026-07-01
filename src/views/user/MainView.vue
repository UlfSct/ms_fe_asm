<script setup lang="js">
import logo from '@/assets/logo.png'
import { useRouter } from 'vue-router'
import {useAuthStore} from "@/stores/core/auth.js";
import {computed} from "vue";

const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
</script>

<template>
  <v-row no-gutters class="pa-4 align-center align-content-center fill-height">
    <v-row no-gutters class="justify-center pa-3" :class="!isAuthenticated ? 'mb-16' : ''" style="width: 100%">
      <v-img :src="String(logo)" height="120" class="mb-6" />
    </v-row>
    <template v-if="isAuthenticated">
      <v-row no-gutters class="justify-center pa-2" style="width: 100%">
        <v-col cols="6" @click="router.push('/results')">
          <v-btn base-color="#555" width="100%">Просмотр схем</v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters class="justify-center pa-2" style="width: 100%">
        <v-col cols="6" @click="router.push('/schemes')">
          <v-btn base-color="#555" width="100%">Библиотека схем</v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters class="justify-center pa-2" style="width: 100%">
        <v-col cols="6" @click="router.push('/equipments')">
          <v-btn base-color="#555" width="100%">Библиотека оборудования</v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters class="justify-center pa-2" style="width: 100%">
        <v-col cols="6" @click="router.push('/models')">
          <v-btn base-color="#555" width="100%">Библиотека моделей</v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters class="justify-center pa-2 mb-15" style="width: 100%">
        <v-col cols="6" @click="router.push('/materials')">
          <v-btn base-color="#555" width="100%">Библиотека материалов</v-btn>
        </v-col>
      </v-row>
    </template>
  </v-row>
</template>

<style scoped lang="scss">

</style>
