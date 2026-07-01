<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import ConstructorToolbar from "@/components/models/constructor/ConstructorToolbar.vue";
import {useModelConstructorStore} from "@/stores/old/modelConstructor.js";
import InstrumentPanel from "@/components/models/constructor/InstrumentPanel.vue";
import ProjectTree from "@/components/models/constructor/ProjectTree.vue";
import ConstructorSpace from "@/components/models/constructor/ConstructorSpace.vue";

const router = useRouter()
const route = useRoute()
const store = useModelConstructorStore()

const loading = computed(() => store.isLoadingObject)
const selected = ref(null)
const sketch = ref(false)

const updateSelected = (selectedObject) => {
  selected.value = selectedObject
}

const instrumentPanelActionHandler = (action) => {
  const actionsHandlers = {
    'sketch': () => sketch.value = true,
    'unsketch': () => sketch.value = false
  }

  if (actionsHandlers[action]) actionsHandlers[action]()
}

onMounted(async () => {
  if (!route.query.assembly && !route.query.part) {
    await router.push('/models/constructor/projects')
  }

  if (route.query.assembly) {
    await store.loadObject(route.query.assembly, 'assembly')
    return
  }

  await store.loadObject(route.query.part, 'part')
})
</script>

<template>
  <constructor-toolbar />
  <v-row v-if="loading" no-gutters justify="center" class="align-content-center text-h6 pb-16" style="height: calc(100vh - 49px);">
    Идёт загрузка проекта...
  </v-row>
  <v-row v-else no-gutters style="height: calc(100vh - 49px); background: white!important">
    <instrument-panel :selected="selected" :sketch="sketch" @action="instrumentPanelActionHandler"/>
    <v-row no-gutters>
      <project-tree />
      <constructor-space :sketch="sketch" @selected="updateSelected" />
    </v-row>
  </v-row>
</template>

<style scoped lang="scss">

</style>
