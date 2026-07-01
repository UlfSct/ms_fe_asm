import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useSelectorsStore = defineStore("selectors", {
  state: () => ({
    models: [],
    types: [],
    equipments: [],
    materials: [],
    loading: {
      models: false,
      types: false,
      equipments: false,
      materials: false,
    }
  }),
  getters: {
    getModels: state => state.models,
    getTypes: state => state.types,
    getEquipments: state => state.equipments,
    getMaterials: state => state.materials,
    isLoadingModels: state => state.loading.models,
    isLoadingTypes: state => state.loading.types,
    isLoadingEquipments: state => state.loading.equipments,
    isLoadingMaterials: state => state.loading.materials
  },
  actions: {
    async loadModels() {
      this.loading.models = true
      this.models = await sendRequest(urls.MODELS.MODELS.SELECTOR)
      this.loading.models = false
    },
    async loadTypes() {
      this.loading.types = true
      this.types = await sendRequest(urls.EQUIPMENTS.TYPES.SELECTOR)
      this.loading.types = false
    },
    async loadEquipments() {
      this.loading.equipments = true
      this.equipments = await sendRequest(urls.EQUIPMENTS.EQUIPMENTS.SELECTOR)
      this.loading.equipments = false
    },
    async loadMaterials() {
      this.loading.materials = true
      this.materials = await sendRequest(urls.MATERIALS.MATERIALS.SELECTOR)
      this.loading.materials = false
    },
  }
})
