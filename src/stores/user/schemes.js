import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useSchemesStore = defineStore("schemes", {
  state: () => ({
    list: [],
    detail: null,
    scheme: null,
    count: 0,
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      delete: false,
      scheme: false,
      scheme_update: false,
      create_result: false
    }
  }),
  getters: {
    getList: state => state.list,
    getCount: state => state.count,
    getDetail: state => state.detail,
    getScheme: state => state.scheme,
    isLoadingList: state => state.loading.list,
    isLoadingDetail: state => state.loading.detail,
    isLoadingDelete: state => state.loading.delete,
    isLoadingUpdate: state => state.loading.update,
    isLoadingCreate: state => state.loading.create,
    isLoadingScheme: state => state.loading.scheme,
    isLoadingSchemeUpdate: state => state.loading.scheme_update,
    isLoadingCreateResult: state => state.loading.create_result
  },
  actions: {
    async loadList(filters = {}) {
      this.loading.list = true
      this.count = 0
      let response = await sendRequest(
        urls.SCHEMES.SCHEMES.LIST,
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
        urls.SCHEMES.SCHEMES.DETAIL,
        {},
        {id}
      )
      this.loading.detail = false
    },
    async deleteItem(id) {
      this.loading.delete = true
      try {
        await sendRequest(
          urls.SCHEMES.SCHEMES.DELETE,
          {},
          {id: id}
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
          urls.SCHEMES.SCHEMES.CREATE,
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
          urls.SCHEMES.SCHEMES.UPDATE,
          data,
          {id: id}
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.update = false
      }
    },
    async loadScheme(id) {
      this.loading.scheme = true
      this.scheme = await sendRequest(
        urls.SCHEMES.SCHEMES.FULL,
        {},
        {id}
      )
      this.loading.scheme = false
    },
    async updateScheme(id, data) {
      this.loading.scheme_update = true
      try {
        await sendRequest(
          urls.SCHEMES.SCHEMES.FULL_UPDATE,
          data,
          {id: id}
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.scheme_update = false
      }
    },
    async createResult(id, data) {
      this.loading.create_result = true
      try {
        await sendRequest(
          urls.SCHEMES.SCHEMES.CREATE_RESULT,
          data,
          {id: id}
        )
      } catch (e) {
        throw e
      } finally {
        this.loading.create_result = false
      }
    },
  }
})
