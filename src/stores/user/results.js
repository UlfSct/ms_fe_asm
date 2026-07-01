import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useResultsStore = defineStore("results", {
  state: () => ({
    list: [],
    full: null,
    count: 0,
    loading: {
      list: false,
      delete: false,
      full: false,
      optimize: false
    }
  }),
  getters: {
    getList: state => state.list,
    getCount: state => state.count,
    getFull: state => state.full,
    isLoadingList: state => state.loading.list,
    isLoadingDelete: state => state.loading.delete,
    isLoadingOptimize: state => state.loading.optimize,
    isLoadingFull: state => state.loading.full
  },
  actions: {
    async loadList(filters = {}) {
      this.loading.list = true
      this.count = 0
      let response = await sendRequest(
        urls.RESULTS.RESULTS.LIST,
        {},
        {},
        filters
      )
      this.list = response.results
      this.count = response.count
      this.loading.list = false
    },
    async deleteItem(id) {
      this.loading.delete = true
      try {
        await sendRequest(
          urls.RESULTS.RESULTS.DELETE,
          {},
          {id: id}
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.delete = false
      }
    },
    async loadFull(id) {
      this.loading.full = true
      this.full = await sendRequest(
        urls.RESULTS.RESULTS.FULL,
        {},
        {id}
      )
      this.loading.full = false
    },
    async optimizeResult(id) {
      this.loading.optimize = true
      await sendRequest(
        urls.RESULTS.RESULTS.OPTIMIZE,
        {},
        {id}
      )
      this.loading.optimize = false
    }
  }
})
