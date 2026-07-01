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
  title: {
    type: String,
    required: true,
    default: 'Форма'
  },
  submitText: {
    type: String,
    required: false,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    required: false,
    default: 'Отмена'
  },
  maxWidth: {
    type: [String, Number],
    required: false,
    default: 600
  },
  showCancel: {
    type: Boolean,
    required: false,
    default: true
  },
  showSubmit: {
    type: Boolean,
    required: false,
    default: true
  }
})
</script>

<template>
  <v-dialog v-if="props.opened" v-model="props.opened" persistent :width="maxWidth" opacity="0.7" max-height="90vh">
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>
      <v-divider/>

      <v-card-text class="pt-6 pb-0" style="max-height: calc(90vh - 49px - 69px); overflow-y: auto">
        <slot/>
      </v-card-text>

      <v-divider v-if="showCancel || showSubmit"/>

      <v-card-actions v-if="showCancel || showSubmit" class="px-6 py-4">
        <v-spacer></v-spacer>

        <v-btn
          v-if="showCancel"
          variant="outlined"
          @click="emit('cancel')"
          class="mr-2"
          :disabled="props.loading"
        >
          {{ cancelText }}
        </v-btn>

        <v-btn
          v-if="showSubmit"
          color="primary"
          variant="flat"
          @click="emit('submit')"
          :loading="props.loading"
          :disabled="props.loading"
        >
          {{ submitText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>
