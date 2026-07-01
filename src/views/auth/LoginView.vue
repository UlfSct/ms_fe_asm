<script setup lang="js">
import {computed, ref} from "vue";
import {useFormErrors} from "@/mixins/FormErrorsMixin.js";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/core/auth.js";

const { getError, hasError, mapErrors } = useFormErrors()
const router = useRouter()
const store = useAuthStore()

const formData = ref({
  username: '',
  password: '',
})

const loading = computed(() => store.loadingLogin)

const sendForm = async () => {
  try {
    await store.login(formData.value)
    await router.push('/')
  } catch (error) {
    mapErrors(error)
  }
}

</script>

<template>
  <v-row no-gutters class="pa-4 align-center align-content-center" style="min-height: calc(100vh - 48px);">
    <v-row no-gutters class="justify-center px-3" style="width: 100%">
      <v-card width="400" class="pa-3">
        <v-card-title class="text-center width_full">Вход в систему</v-card-title>
        <v-text-field
          v-model="formData.username"
          variant="outlined"
          class="my-3"
          density="comfortable"
          :error="hasError('username')"
          :error-messages="getError('username')"
        >
          <template v-slot:label>
            Логин<span class="text-red">*</span>
          </template>
        </v-text-field>
        <v-text-field
          v-model="formData.password"
          variant="outlined"
          class="mb-3"
          type="password"
          density="comfortable"
          :error="hasError('password')"
          :error-messages="getError('password')"
        >
          <template v-slot:label>
            Пароль<span class="text-red">*</span>
          </template>
        </v-text-field>
        <v-btn base-color="#555" width="100%" class="mb-3" :loading="loading" @click="sendForm">Войти</v-btn>
        <v-row no-gutters class="justify-center px-3 mt-1" style="width: 100%">
          Нет аккаунта?&thinsp;<span style="text-decoration: underline; cursor: pointer" @click="router.push('/register')">Зарегистрироваться</span>
        </v-row>
      </v-card>
    </v-row>
  </v-row>
</template>

<style scoped lang="scss">

</style>
