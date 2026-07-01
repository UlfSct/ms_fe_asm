<script setup lang="js">
import {useAuthStore} from "@/stores/core/auth.js";
import {useRouter} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import {formatDate, getFaceFullName} from "@/utils/date.js";
import ProfileEditDialog from "@/components/profile/ProfileEditDialog.vue";
import {useTeamStore} from "@/stores/user/team.js";
import ApplyDialog from "@/components/core/ApplyDialog.vue";
import TeamCreateUpdateDialog from "@/components/profile/TeamCreateUpdateDialog.vue";
import TeamInviteDialog from "@/components/profile/TeamInviteDialog.vue";

const authStore = useAuthStore()
const teamStore = useTeamStore()
const router = useRouter()

const usersHeaders = [
  {
    title: 'Пользователь',
    key: 'fio',
    align: 'start',
    sortable: false,
    width: '25%'
  },
  {
    title: 'Почта',
    key: 'email',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Роль',
    key: 'role',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Присоединился',
    key: 'date_joined',
    align: 'center',
    sortable: false,
    width: '15%'
  }
]

const invitesHeaders = [
  {
    title: 'Название команды',
    key: 'team_name',
    align: 'start',
    sortable: false,
    width: '50%'
  },
  {
    title: 'Создана',
    key: 'created',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '30%'
  }
]

const teamInvitesHeaders = [
  {
    title: 'Пользователь',
    key: 'fio',
    align: 'start',
    sortable: false,
    width: '35%'
  },
  {
    title: 'Почта',
    key: 'email',
    align: 'center',
    sortable: false,
    width: '20%'
  },
  {
    title: 'Создано',
    key: 'date_joined',
    align: 'center',
    sortable: false,
    width: '15%'
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '30%'
  }
]

const profileEditDialogOpened = ref(false)
const createTeamDialogOpened = ref(false)
const updateTeamDialogOpened = ref(false)
const deleteTeamDialogOpened = ref(false)
const leaveTeamDialogOpened = ref(false)
const createInviteDialogOpened = ref(false)
const acceptInviteDialogOpened = ref(false)
const rejectInviteDialogOpened = ref(false)
const cancelInviteDialogOpened = ref(false)
const makeAdminDialogOpened = ref(false)
const removeAdminDialogOpened = ref(false)
const transferCreatorDialogOpened = ref(false)
const removeUserDialogOpened = ref(false)
const teamUserId = ref(undefined)

const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const profile = computed(() => authStore.getProfile)
const loadingProfile = computed(() => authStore.loadingProfile)
const team = computed(() => teamStore.getTeam)
const loadingTeam = computed(() => teamStore.isLoadingTeam)
const loadingCreate = computed(() => teamStore.isLoadingCreate)
const loadingUpdate = computed(() => teamStore.isLoadingUpdate)
const loadingLeave = computed(() => teamStore.isLoadingLeave)
const loadingDelete = computed(() => teamStore.isLoadingDelete)
const loadingCreateInvite = computed(() => teamStore.isLoadingCreateInvite)
const loadingAcceptInvite = computed(() => teamStore.isLoadingAcceptInvite)
const loadingRejectInvite = computed(() => teamStore.isLoadingRejectInvite)
const loadingCancelInvite = computed(() => teamStore.isLoadingCancelInvite)
const loadingMakeAdmin = computed(() => teamStore.isLoadingMakeAdmin)
const loadingRemoveAdmin = computed(() => teamStore.isLoadingRemoveAdmin)
const loadingTransferCreator = computed(() => teamStore.isLoadingTransferCreator)
const loadingRemoveUser = computed(() => teamStore.isLoadingRemoveUser)

const getUsers = computed(() => {
  if (!team.value) return []
  return team.value.users.filter((item) => item.is_approved)
})
const getInvites = computed(() => {
  if (!team.value) return []
  return team.value.users.filter((item) => item.is_approved === null)
})
const getIsCreator = computed(() => {
  if (!team.value) return false
  return team.value.is_creator
})
const getIsAdmin = computed(() => {
  if (!team.value) return false
  return team.value.is_admin
})
const getUsersHeaders = computed(() => {
  if (getIsCreator.value || getIsAdmin.value) {
    return [
      ...usersHeaders,
      {
        title: 'Действия',
        key: 'actions',
        align: 'center',
        sortable: false,
        width: '30%'
      }
    ]
  }
  return usersHeaders
})
const getTeamExists = computed(() => {
  return team.value && !loadingProfile.value && !loadingTeam.value && team.value.created
})

watch(profile, () => {
  loadTeam()
})

const openProfileEditDialog = () => {
  profileEditDialogOpened.value = true
}

const closeProfileEditDialog = () => {
  profileEditDialogOpened.value = false
}

const openCreateTeamDialog = () => {
  createTeamDialogOpened.value = true
}

const openUpdateTeamDialog = () => {
  updateTeamDialogOpened.value = true
}

const openDeleteTeamDialog = () => {
  deleteTeamDialogOpened.value = true
}

const openLeaveTeamDialog = () => {
  leaveTeamDialogOpened.value = true
}

const openCreateInviteDialog = () => {
  createInviteDialogOpened.value = true
}

const openAcceptInviteDialog = (id) => {
  teamUserId.value = id
  acceptInviteDialogOpened.value = true
}

const openRejectInviteDialog = (id) => {
  teamUserId.value = id
  rejectInviteDialogOpened.value = true
}

const openCancelInviteDialog = (id) => {
  teamUserId.value = id
  cancelInviteDialogOpened.value = true
}

const openMakeAdminDialog = (id) => {
  teamUserId.value = id
  makeAdminDialogOpened.value = true
}

const openRemoveAdminDialog = (id) => {
  teamUserId.value = id
  removeAdminDialogOpened.value = true
}

const openTransferCreatorDialog = (id) => {
  teamUserId.value = id
  transferCreatorDialogOpened.value = true
}

const openRemoveUserDialog = (id) => {
  teamUserId.value = id
  removeUserDialogOpened.value = true
}

const closeCreateEditTeamDialog = (applied) => {
  createTeamDialogOpened.value = false
  updateTeamDialogOpened.value = false
  if (applied) loadTeam()
}

const closeDeleteTeamDialog = async (applied) => {
  if (!applied) {
    leaveTeamDialogOpened.value = false
    return
  }
  await teamStore.deleteTeam()
  deleteTeamDialogOpened.value = false
  await loadTeam()
}

const closeLeaveTeamDialog = async (applied) => {
  if (!applied) {
    leaveTeamDialogOpened.value = false
    return
  }
  await teamStore.leaveTeam()
  leaveTeamDialogOpened.value = false
  await loadTeam()
}

const closeCreateInviteDialog = (needReload) => {
  createInviteDialogOpened.value = false
  if (needReload) loadTeam()
}

const closeAcceptInviteDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    acceptInviteDialogOpened.value = false
    return
  }
  await teamStore.acceptInvite(teamUserId.value)
  teamUserId.value = undefined
  acceptInviteDialogOpened.value = false
  await loadTeam()
}

const closeRejectInviteDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    rejectInviteDialogOpened.value = false
    return
  }
  await teamStore.rejectInvite(teamUserId.value)
  teamUserId.value = undefined
  rejectInviteDialogOpened.value = false
  await loadTeam()
}

const closeCancelInviteDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    cancelInviteDialogOpened.value = false
    return
  }
  await teamStore.cancelInvite(teamUserId.value)
  teamUserId.value = undefined
  cancelInviteDialogOpened.value = false
  await loadTeam()
}

const closeMakeAdminDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    makeAdminDialogOpened.value = false
    return
  }
  await teamStore.makeAdmin(teamUserId.value)
  teamUserId.value = undefined
  makeAdminDialogOpened.value = false
  await loadTeam()
}

const closeRemoveAdminDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    removeAdminDialogOpened.value = false
    return
  }
  await teamStore.removeAdmin(teamUserId.value)
  teamUserId.value = undefined
  removeAdminDialogOpened.value = false
  await loadTeam()
}

const closeTransferCreatorDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    transferCreatorDialogOpened.value = false
    return
  }
  await teamStore.transferCreator(teamUserId.value)
  teamUserId.value = undefined
  transferCreatorDialogOpened.value = false
  await loadTeam()
}

const closeRemoveUserDialog = async (applied) => {
  if (!applied) {
    teamUserId.value = undefined
    removeUserDialogOpened.value = false
    return
  }
  await teamStore.removeUser(teamUserId.value)
  teamUserId.value = undefined
  removeUserDialogOpened.value = false
  await loadTeam()
}

const loadTeam = async () => {
  await teamStore.loadTeam()
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/")
    return
  }
  authStore.loadProfile()
})
</script>

<template>
  <v-card class="ma-3">
    <v-toolbar flat density="compact">
      <v-toolbar-title>Профиль пользователя</v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items class="align-center">
        <v-btn v-if="profile && !loadingProfile" @click="openProfileEditDialog">Редактировать</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <template v-if="loadingProfile">
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
    </template>
    <v-row v-else-if="profile" no-gutters class="py-1">
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>Имя пользователя:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ profile.username }}
        </v-col>
      </v-row>
      <v-divider class="mx-2"/>
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>E-mail:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ profile.email }}
        </v-col>
      </v-row>
      <v-divider class="mx-2"/>
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>Фамилия:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ profile.surname }}
        </v-col>
      </v-row>
      <v-divider class="mx-2"/>
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>Имя:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ profile.name }}
        </v-col>
      </v-row>
      <v-divider class="mx-2"/>
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>Отчество:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ profile.lastname ? profile.lastname : '-' }}
        </v-col>
      </v-row>
      <v-divider class="mx-2"/>
      <v-row no-gutters class="mx-3">
        <v-col cols="6" class="py-1 px-2">
          <b>Создан:</b>
        </v-col>
        <v-col cols="6" class="py-1 px-2">
          {{ formatDate(profile.date_joined) }}
        </v-col>
      </v-row>
    </v-row>
  </v-card>
  <v-card class="ma-3">
    <v-toolbar flat density="compact">
      <v-toolbar-title>Команда пользователя</v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items class="align-center" v-if="team">
        <template v-if="getTeamExists">
          <v-btn v-if="getIsAdmin" @click="openCreateInviteDialog" color="green">Пригласить</v-btn>
          <v-btn v-if="getIsCreator" @click="openUpdateTeamDialog" color="blue">Редактировать</v-btn>
          <v-btn v-if="getIsCreator" @click="openDeleteTeamDialog" color="red">Удалить</v-btn>
          <v-btn v-else @click="openLeaveTeamDialog" color="red">Покинуть команду</v-btn>
        </template>
        <template v-else-if="!loadingTeam && !loadingProfile">
          <v-btn @click="openCreateTeamDialog" color="red">Создать команду</v-btn>
        </template>
      </v-toolbar-items>
    </v-toolbar>
    <v-row no-gutters class="py-1">
      <template v-if="getTeamExists">
        <v-row no-gutters class="mx-3 w-100">
          <v-col cols="6" class="py-1 px-2">
            <b>Название:</b>
          </v-col>
          <v-col cols="6" class="py-1 px-2">
            {{ team.name }}
          </v-col>
        </v-row>
        <v-divider class="mx-2"/>
        <v-row no-gutters class="mx-3 w-100">
          <v-col cols="6" class="py-1 px-2">
            <b>Создана:</b>
          </v-col>
          <v-col cols="6" class="py-1 px-2">
            {{ formatDate(team.created) }}
          </v-col>
        </v-row>
      </template>
      <template v-else-if="loadingTeam || loadingProfile">
        <v-skeleton-loader type="list-item" class="w-100"/>
        <v-skeleton-loader type="list-item" class="w-100"/>
      </template>
      <v-row no-gutters class="mx-3 justify-center w-100 my-2" v-else> Вы пока не состоите ни в одной команде</v-row>
    </v-row>
    <template v-if="getTeamExists">
      <v-toolbar flat density="compact">
        <v-toolbar-title>Участники команды</v-toolbar-title>
        <v-spacer/>
      </v-toolbar>
      <v-data-table-virtual :items="getUsers" :headers="getUsersHeaders" density="compact">
        <template v-slot:item.fio="{ item }">
          <span v-html="`${getFaceFullName(item)} <b>(${item.username})</b>`" />
        </template>
        <template v-slot:item.role="{ item }">
          <span v-if="item.is_creator">Создатель</span>
          <span v-else-if="item.is_admin">Администратор</span>
          <span v-else>-</span>
        </template>
        <template v-slot:item.date_joined="{ item }">
          {{ formatDate(item.date_joined) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <template v-if="getIsAdmin">
            <template v-if="getIsCreator">
              <v-tooltip v-if="!item.is_myself" text="Передать правда создателя" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="30"
                    class="px-3 mr-1"
                    flat
                    rounded
                    color="white"
                    @click="openTransferCreatorDialog(item.id)"
                  >
                    <v-icon size="25" color="blue">mdi-transfer</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip v-if="!item.is_admin" text="Назначить администратором" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="30"
                    class="px-3 mr-1"
                    flat
                    rounded
                    color="white"
                    @click="openMakeAdminDialog(item.id)"
                  >
                    <v-icon size="25" color="blue">mdi-account-arrow-up-outline</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip v-if="item.is_admin && !item.is_myself" text="Отозвать права администратора" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="30"
                    class="px-3 mr-1"
                    flat
                    rounded
                    color="white"
                    @click="openRemoveAdminDialog(item.id)"
                  >
                    <v-icon size="25" color="red">mdi-account-arrow-down-outline</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
            <v-tooltip v-if="!item.is_myself && !item.is_admin" text="Выгнать из команды" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="30"
                  class="px-3 mr-1"
                  flat
                  rounded
                  color="white"
                  @click="openRemoveUserDialog(item.id)"
                >
                  <v-icon size="25" color="red">mdi-account-off</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </template>
      </v-data-table-virtual>
      <template v-if="getIsAdmin">
        <v-toolbar flat density="compact">
          <v-toolbar-title>Активные приглашения</v-toolbar-title>
          <v-spacer/>
        </v-toolbar>
        <v-row v-if="!getInvites.length" no-gutters class="px-3 justify-center w-100 my-3">В вашу команду нет активных приглашений</v-row>
        <v-data-table-virtual v-else :items="getInvites" :headers="teamInvitesHeaders" density="compact">
          <template v-slot:item.fio="{ item }">
            <span v-html="`${getFaceFullName(item)} <b>(${item.username})</b>`" />
          </template>
          <template v-slot:item.role="{ item }">
            <span v-if="item.is_creator">Создатель</span>
            <span v-else-if="item.is_admin">Администратор</span>
            <span v-else>-</span>
          </template>
          <template v-slot:item.date_joined="{ item }">
            {{ formatDate(item.date_joined) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <template v-if="getIsAdmin">
              <v-tooltip v-if="!item.is_myself && !item.is_admin" text="Отозвать приглашение" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="30"
                    class="px-3 mr-1"
                    flat
                    rounded
                    color="white"
                    @click="openCancelInviteDialog(item.id)"
                  >
                    <v-icon size="25" color="red">mdi-account-off</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </template>
        </v-data-table-virtual>
      </template>
    </template>
    <template v-else-if="!loadingProfile && !loadingTeam">
      <v-toolbar flat density="compact">
        <v-toolbar-title>Активные приглашения</v-toolbar-title>
        <v-spacer/>
      </v-toolbar>
      <v-row v-if="!getInvites.length" no-gutters class="px-3 justify-center w-100 my-3">У вас нет активных приглашений в команду</v-row>
      <v-data-table-virtual v-else :items="getInvites" :headers="invitesHeaders" density="compact">
        <template v-slot:item.created="{ item }">
          {{ formatDate(item.created) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Отклонить приглашение" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                size="30"
                class="px-3 mr-1"
                flat
                rounded
                color="white"
                @click="openRejectInviteDialog(item.id)"
              >
                <v-icon size="25" color="red">mdi-account-cancel</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Принять приглашение" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                size="30"
                class="px-3 mr-1"
                flat
                rounded
                color="white"
                @click="openAcceptInviteDialog(item.id)"
              >
                <v-icon size="25" color="blue">mdi-table-account</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-virtual>
    </template>
  </v-card>
  <profile-edit-dialog :opened="profileEditDialogOpened" @close="closeProfileEditDialog" />
  <team-create-update-dialog
    :opened="createTeamDialogOpened || updateTeamDialogOpened"
    :loading="loadingCreate || loadingUpdate"
    :edit="updateTeamDialogOpened"
    @close="closeCreateEditTeamDialog(false)"
    @apply="closeCreateEditTeamDialog(true)"
  />
  <team-invite-dialog
    :opened="createInviteDialogOpened"
    :loading="loadingCreateInvite"
    @close="closeCreateInviteDialog(false)"
    @apply="closeCreateInviteDialog(true)"
  />
  <apply-dialog
    :opened="deleteTeamDialogOpened"
    text="Вы уверены, что хотите удалить данную команду?"
    :loading="loadingDelete"
    @submit="closeDeleteTeamDialog(true)"
    @cancel="closeDeleteTeamDialog(false)"
  />
  <apply-dialog
    :opened="acceptInviteDialogOpened"
    text="Вы уверены, что хотите принять приглашение в данную команду?"
    :loading="loadingAcceptInvite"
    @submit="closeAcceptInviteDialog(true)"
    @cancel="closeAcceptInviteDialog(false)"
  />
  <apply-dialog
    :opened="rejectInviteDialogOpened"
    text="Вы уверены, что хотите отклонить приглашение в данную команду?"
    :loading="loadingRejectInvite"
    @submit="closeRejectInviteDialog(true)"
    @cancel="closeRejectInviteDialog(false)"
  />
  <apply-dialog
    :opened="cancelInviteDialogOpened"
    text="Вы уверены, что хотите отозвать данное приглашение?"
    :loading="loadingCancelInvite"
    @submit="closeCancelInviteDialog(true)"
    @cancel="closeCancelInviteDialog(false)"
  />
  <apply-dialog
    :opened="makeAdminDialogOpened"
    text="Вы уверены, что хотите выдать права администратора данному пользователю?"
    :loading="loadingMakeAdmin"
    @submit="closeMakeAdminDialog(true)"
    @cancel="closeMakeAdminDialog(false)"
  />
  <apply-dialog
    :opened="removeAdminDialogOpened"
    text="Вы уверены, что хотите отозвать права администратора у данного пользователя?"
    :loading="loadingRemoveAdmin"
    @submit="closeRemoveAdminDialog(true)"
    @cancel="closeRemoveAdminDialog(false)"
  />
  <apply-dialog
    :opened="leaveTeamDialogOpened"
    text="Вы уверены, что хотите выйти из текущей команды?"
    :loading="loadingLeave"
    @submit="closeLeaveTeamDialog(true)"
    @cancel="closeLeaveTeamDialog(false)"
  />
  <apply-dialog
    :opened="transferCreatorDialogOpened"
    text="Вы уверены, что хотите передать права создателя данному пользователю?"
    :loading="loadingTransferCreator"
    @submit="closeTransferCreatorDialog(true)"
    @cancel="closeTransferCreatorDialog(false)"
  />
  <apply-dialog
    :opened="removeUserDialogOpened"
    text="Вы уверены, что хотите удалить данного пользователя из команды?"
    :loading="loadingRemoveUser"
    @submit="closeRemoveUserDialog(true)"
    @cancel="closeRemoveUserDialog(false)"
  />
</template>

<style scoped lang="scss">

</style>
