import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useAdminUsersStore = defineStore("adminUsers", {
  state: () => ({
    list: [],
    count: 0,
    detail: null,
    loading: {
      list: false,
      update: false
    }
  }),
  getters: {
    getList: state => state.list,
    getCount: state => state.count,
    isLoadingList: state => state.loading.list,
    isLoadingUpdate: state => state.loading.update
  },
  actions: {
    async loadList(filters={}) {
      this.loading.list = true
      this.list = []
      this.count = 0
      let response = await sendRequest(
        urls.USERS.ADMIN.USERS.LIST,
        {},
        {},
        filters
      )
      this.list = response.results
      this.count = response.count
      this.loading.list = false
    },
    async updateItem(id, data) {
      this.loading.update = true
      try {
        await sendRequest(
          urls.USERS.ADMIN.USERS.UPDATE,
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
