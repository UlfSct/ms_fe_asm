<script setup lang="ts">
const emit = defineEmits(['cancel', 'submit']);

const props = defineProps({
  opened: {
    type: Boolean,
    required: true,
    default: false
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  text: {
    type: String,
    required: false,
    default: ''
  },
  error: {
    type: String,
    required: false,
    default: ''
  },
})
</script>

<template>
  <v-dialog v-if="props.opened" v-model="props.opened" persistent width="500" opacity="0.7">
    <v-card>
      <v-card-title class="text-h6">
        Подтвердите действие
      </v-card-title>
      <v-divider/>

      <v-card-text class="pt-4">
        <div class="text-body-1 text-center">
          {{ text }}
        </div>
        <v-alert type="error" class="mt-3" v-if="props.error">
          {{ props.error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer></v-spacer>

        <v-btn
          variant="outlined"
          @click="emit('cancel')"
          class="mr-2"
          :disabled="props.loading"
        >
          Отмена
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="emit('submit')"
          :loading="props.loading"
          :disabled="props.loading"
        >
          Подтвердить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>
