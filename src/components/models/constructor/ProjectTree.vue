<script setup lang="js">
import {useModelConstructorStore} from "@/stores/old/modelConstructor.js";
import {computed, onMounted, ref } from "vue";
import cs from "@/assets/cs.png"
import plane from "@/assets/plane.png"

const treeViewItems = ref([])
const store = useModelConstructorStore()
const object = computed(() => store.getObject)

const files = {
  cs: cs,
  plane: plane,
}

function getIcon (item) {
  return files[item.type] ?? undefined
}

const initializeTreeView = () => {
  for (let i in object.value.coordinate_systems) {
    treeViewItems.value.push(
      {
        id: object.value.coordinate_systems[i].id,
        title: object.value.coordinate_systems[i].name,
        type: 'cs',
        data: object.value.coordinate_systems[i],
        children: []
      }
    )

    for (let j in object.value.coordinate_systems[i].planes) {
      treeViewItems.value[0].children.push(
        {
          id: object.value.coordinate_systems[i].planes[j].id,
          title: object.value.coordinate_systems[i].planes[j].name,
          type: 'plane',
          data: object.value.coordinate_systems[i].planes[j],
        }
      )
    }
  }
}

onMounted(() => {
  initializeTreeView()
})
</script>

<template>
  <v-col cols="2" class="ma-0 pa-0 text-subtitle-1" style="border-right: 1px solid #333333!important; height: calc(100vh - 49px - 91px); overflow-y: auto!important; background: white; color: #333333">
    <v-row no-gutters class="pa-2 pl-4" style="border-bottom: 1px solid #333333!important;">
      Дерево проекта:
    </v-row>
    <v-treeview
      :items="treeViewItems"
      density="compact"
      class="pa-0 ma-0"
      :separate-roots="true"
      indent-lines="default"
    >
      <template v-slot:prepend="{ item }">
        <v-img v-if="getIcon(item)" :src="getIcon(item)" width="28" />
        <v-icon v-else :size="28" color="#333333">mdi-file-outline</v-icon>
      </template>
    </v-treeview>
  </v-col>
</template>

<style scoped lang="scss">
:deep(.v-treeview-indent-line) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line::before),
:deep(.v-treeview-indent-line::after) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--leaf) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--leaf::before),
:deep(.v-treeview-indent-line--leaf::after) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--last-leaf) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--last-leaf::before),
:deep(.v-treeview-indent-line--last-leaf::after) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--leaf-link) {
  border-color: #333333 !important;
}

:deep(.v-treeview-indent-line--leaf-link::before),
:deep(.v-treeview-indent-line--leaf-link::after) {
  border-color: #333333 !important;
}

</style>
