import { defineStore } from "pinia"
import {sendRequest} from "@/utils/requests.js";
import {urls} from "@/urls/index.js";

export const useTeamStore = defineStore("team", {
  state: () => ({
    team: null,
    loading: {
      team: false,
      create: false,
      leave: false,
      delete: false,
      update: false,
      createInvite: false,
      acceptInvite: false,
      rejectInvite: false,
      cancelInvite: false,
      makeAdmin: false,
      removeAdmin: false,
      transferCreator: false,
      removeUser: false
    }
  }),
  getters: {
    getTeam: state => state.team,
    isLoadingTeam: state => state.loading.team,
    isLoadingCreate: state => state.loading.create,
    isLoadingLeave: state => state.loading.leave,
    isLoadingDelete: state => state.loading.delete,
    isLoadingUpdate: state => state.loading.update,
    isLoadingCreateInvite: state => state.loading.createInvite,
    isLoadingAcceptInvite: state => state.loading.acceptInvite,
    isLoadingRejectInvite: state => state.loading.rejectInvite,
    isLoadingCancelInvite: state => state.loading.cancelInvite,
    isLoadingMakeAdmin: state => state.loading.makeAdmin,
    isLoadingRemoveAdmin: state => state.loading.removeAdmin,
    isLoadingTransferCreator: state => state.loading.transferCreator,
    isLoadingRemoveUser: state => state.loading.removeUser
  },
  actions: {
    async loadTeam() {
      this.loading.team = true
      this.team = await sendRequest(urls.USERS.TEAM.GET)
      this.loading.team = false
    },
    async createTeam(data) {
      this.loading.create = true
      try {
        await sendRequest(urls.USERS.TEAM.CREATE, data)
      } catch (error) {
        throw error
      } finally {
        this.loading.create = false
      }
    },
    async deleteTeam() {
      this.loading.delete = true
      await sendRequest(urls.USERS.TEAM.DELETE)
      this.loading.delete = false
    },
    async leaveTeam() {
      this.loading.leave = true
      await sendRequest(urls.USERS.TEAM.LEAVE)
      this.loading.leave = false
    },
    async updateTeam(data) {
      this.loading.update = true
      try {
        await sendRequest(urls.USERS.TEAM.UPDATE, data)
      } catch (error) {
        throw error
      } finally {
        this.loading.update = false
      }
    },
    async createInvite(data) {
      this.loading.createInvite = true
      try {
        await sendRequest(urls.USERS.TEAM.USERS.INVITE, data)
      } catch (error) {
        throw error
      } finally {
        this.loading.createInvite = false
      }
    },
    async acceptInvite(id) {
      this.loading.acceptInvite = true
      await sendRequest(urls.USERS.TEAM.USERS.ACCEPT_INVITE, {}, { id })
      this.loading.acceptInvite = false
    },
    async rejectInvite(id) {
      this.loading.rejectInvite = true
      await sendRequest(urls.USERS.TEAM.USERS.REJECT_INVITE, {}, { id })
      this.loading.acceptInvite = false
    },
    async cancelInvite(id) {
      this.loading.cancelInvite = true
      await sendRequest(urls.USERS.TEAM.USERS.REJECT_INVITE, {}, { id })
      this.loading.cancelInvite = false
    },
    async makeAdmin(id) {
      this.loading.makeAdmin = true
      await sendRequest(urls.USERS.TEAM.USERS.MAKE_ADMIN, {}, { id })
      this.loading.makeAdmin = false
    },
    async removeAdmin(id) {
      this.loading.removeAdmin = true
      await sendRequest(urls.USERS.TEAM.USERS.REMOVE_ADMIN, {}, { id })
      this.loading.removeAdmin = false
    },
    async transferCreator(id) {
      this.loading.transferCreator = true
      await sendRequest(urls.USERS.TEAM.USERS.TRANSFER_CREATOR, {}, { id })
      this.loading.transferCreator = false
    },
    async removeUser(id) {
      this.loading.removeUser = true
      await sendRequest(urls.USERS.TEAM.USERS.REMOVE_USER, {}, { id })
      this.loading.removeUser = false
    }
  }
})
