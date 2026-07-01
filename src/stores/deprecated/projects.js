import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";
import {useMaterialsStore} from "@/stores/user/materials.js";

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    list: [],
    detail: null,
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
    getDetail: state => state.detail,
    isLoadingList: state => state.loading.list,
    isLoadingDetail: state => state.loading.detail,
    isLoadingDelete: state => state.loading.delete,
    isLoadingUpdate: state => state.loading.update,
    isLoadingCreate: state => state.loading.create,
  },
  actions: {
    async loadList() {
      this.loading.list = true
      this.list = await sendRequest(
        urls.CONSTRUCTOR.PROJECTS.LIST
      )
      this.loading.list = false
    },
    async loadDetail(id, type) {
      this.loading.detail = true
      this.detail = await sendRequest(
        type === 'part' ? urls.CONSTRUCTOR.PARTS.DETAIL : urls.CONSTRUCTOR.ASSEMBLIES.DETAIL,
        {},
        { id }
      )
      this.loading.detail = false
    },
    async deleteItem() {
      this.loading.delete = true
      try {
        await sendRequest(
          this.detail.type === 'part' ? urls.CONSTRUCTOR.PARTS.DELETE : urls.CONSTRUCTOR.ASSEMBLIES.DELETE,
          {},
          { id: this.detail.id }
        )
        for (let i in this.list) {
          if (this.list[i].id === this.detail.id && this.list[i].type === this.detail.type) {
            this.list.splice(Number(i), 1)
            this.detail = null
            break
          }
        }
      } catch (e) {
        throw e
      } finally {
        this.loading.delete = false
      }
    },
    async createItem(data, type) {
      this.loading.create = true
      try {
        let response = await sendRequest(
          type === 'part' ? urls.CONSTRUCTOR.PARTS.CREATE : urls.CONSTRUCTOR.ASSEMBLIES.CREATE,
          data
        )
        this.detail = response
        this.detail.type = type
        this.detail.can_delete = true
        if (type === 'part') {
          const materialsStore = useMaterialsStore()
          this.detail.material = materialsStore.getSelectorList.find((item) => item.id === data.material)
        }
        this.list.unshift({
          id: response.id,
          name: response.name,
          created: response.created,
          updated: response.updated,
          type: type
        })
      } catch (e) {
        throw e
      } finally {
        this.loading.create = false
      }
    },
    async updateItem(data) {
      this.loading.update = true
      try {
        let response = await sendRequest(
          this.detail.type === 'part' ? urls.CONSTRUCTOR.PARTS.UPDATE : urls.CONSTRUCTOR.ASSEMBLIES.UPDATE,
          data,
          { id: this.detail.id }
        )
        for (let key in response) {
          this.detail[key] = response[key]
        }
        for (let i in this.list) {
          if (this.list[i].id === this.detail.id && this.list[i].type === this.detail.type) {
            this.list[i].name = this.detail.name
            this.list[i].updated = this.detail.updated
            break
          }
        }
      } catch (e) {
        throw e
      } finally {
        this.loading.update = false
      }
    }
  }
})
