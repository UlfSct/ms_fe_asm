export const usersUrls = {
  LOGIN: {
    path: '/users/login/',
    method: 'POST',
  },
  LOGOUT: {
    path: '/users/logout/',
    method: 'POST',
  },
  REGISTER: {
    path: '/users/register/',
    method: 'POST',
  },
  PROFILE: {
    GET: {
      path: '/users/profile/',
      method: 'GET',
    },
    UPDATE: {
      path: '/users/profile/',
      method: 'PATCH',
    },
    CHECK_ADMIN: {
      path: '/users/profile/admin/',
      method: 'GET',
    }
  },
  TEAM: {
    GET: {
      path: '/users/team/',
      method: 'GET',
    },
    CREATE: {
      path: '/users/team/',
      method: 'POST',
    },
    UPDATE: {
      path: '/users/team/update/',
      method: 'PATCH',
    },
    LEAVE: {
      path: '/users/team/leave/',
      method: 'POST',
    },
    DELETE: {
      path: '/users/team/delete/',
      method: 'DELETE',
    },
    USERS: {
      INVITE: {
        path: '/users/teamusers/invite/',
        method: 'POST',
      },
      MAKE_ADMIN: {
        path: '/users/teamusers/{id}/make-admin/',
        method: 'POST',
      },
      REMOVE_ADMIN: {
        path: '/users/teamusers/{id}/remove-admin/',
        method: 'POST',
      },
      ACCEPT_INVITE: {
        path: '/users/teamusers/{id}/accept/',
        method: 'POST',
      },
      REJECT_INVITE: {
        path: '/users/teamusers/{id}/reject/',
        method: 'POST',
      },
      TRANSFER_CREATOR: {
        path: '/users/teamusers/{id}/transfer-creator/',
        method: 'POST',
      },
      REMOVE_USER: {
        path: '/users/teamusers/{id}/remove-user/',
        method: 'DELETE',
      }
    }
  },
  ADMIN: {
    USERS: {
      LIST: {
        path: '/users/admin/users/',
        method: 'GET',
      },
      UPDATE: {
        path: '/users/admin/users/{id}/',
        method: 'PATCH',
      }
    }
  }
}
