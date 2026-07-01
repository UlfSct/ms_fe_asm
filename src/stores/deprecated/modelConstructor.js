import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

export const useModelConstructorStore = defineStore("modelConstructor", {
  state: () => ({
    object: null,
    loading: {
      object: true,
    },
    type: null
  }),
  getters: {
    getObject: state => state.object,
    getType: (state) => state.type,
    isLoadingObject: state => state.loading.object,
  },
  actions: {
    async loadObject(id, type) {
      this.loading.object = true
      this.type = type
      this.object = await sendRequest(
        type === 'part' ? urls.CONSTRUCTOR.PARTS.FULL : urls.CONSTRUCTOR.ASSEMBLIES.FULL,
        {},
        { id }
      )
      this.loading.object = false
    },
    }
})
