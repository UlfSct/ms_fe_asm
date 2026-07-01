import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useEquipmentHolesStore = defineStore("equipmentHoles", {
  state: () => ({
    list: [],
    loading: {
      list: false,
      create: false,
      update: false,
      delete: false,
    }
  }),
  getters: {
    getList: state => state.list,
    isLoadingList: state => state.loading.list,
    isLoadingDelete: state => state.loading.delete,
    isLoadingUpdate: state => state.loading.update,
    isLoadingCreate: state => state.loading.create
  },
  actions: {
    async loadList(filters={}) {
      this.loading.list = true
      this.list = await sendRequest(
        urls.EQUIPMENTS.HOLES.LIST,
        {},
        {},
        filters
      )
      this.loading.list = false
    },
    async deleteItem(id) {
      this.loading.delete = true
      try {
        await sendRequest(
          urls.EQUIPMENTS.HOLES.DELETE,
          {},
          { id: id }
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.delete = false
      }
    },
    async createItem(data) {
      this.loading.create = true
      try {
        await sendRequest(
          urls.EQUIPMENTS.HOLES.CREATE,
          data
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.create = false
      }
    },
    async updateItem(id, data) {
      this.loading.update = true
      try {
        await sendRequest(
          urls.EQUIPMENTS.HOLES.UPDATE,
          data,
          { id: id }
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.update = false
      }
    }
  }
})
