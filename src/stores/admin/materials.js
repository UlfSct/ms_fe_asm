import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useAdminMaterialsStore = defineStore("adminMaterials", {
  state: () => ({
    list: [],
    detail: null,
    count: 0,
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      delete: false,
    }
  }),
  getters: {
    getList: state => state.list,
    getCount: state => state.count,
    getDetail: state => state.detail,
    isLoadingList: state => state.loading.list,
    isLoadingDetail: state => state.loading.detail,
    isLoadingDelete: state => state.loading.delete,
    isLoadingUpdate: state => state.loading.update,
    isLoadingCreate: state => state.loading.create
  },
  actions: {
    async loadList(filters={}) {
      this.loading.list = true
      this.count = 0
      let response = await sendRequest(
        urls.MATERIALS.ADMIN.MATERIALS.LIST,
        {},
        {},
        filters
      )
      this.list = response.results
      this.count = response.count
      this.loading.list = false
    },
    async loadDetail(id) {
      this.loading.detail = true
      this.detail = await sendRequest(
        urls.MATERIALS.ADMIN.MATERIALS.DETAIL,
        {},
        { id }
      )
      this.loading.detail = false
    },
    async deleteItem(id) {
      this.loading.delete = true
      try {
        await sendRequest(
          urls.MATERIALS.ADMIN.MATERIALS.DELETE,
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
          urls.MATERIALS.ADMIN.MATERIALS.CREATE,
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
          urls.MATERIALS.ADMIN.MATERIALS.UPDATE,
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
