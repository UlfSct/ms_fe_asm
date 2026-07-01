export const equipmentsUrls = {
  EQUIPMENTS: {
    LIST: {
      path: '/equipments/equipments/',
      method: 'GET',
    },
    CREATE: {
      path: '/equipments/equipments/',
      method: 'POST',
    },
    SELECTOR: {
      path: '/equipments/equipments/selector/',
      method: 'GET',
    },
    DETAIL: {
      path: '/equipments/equipments/{id}/',
      method: 'GET',
    },
    UPDATE: {
      path: '/equipments/equipments/{id}/',
      method: 'PATCH',
    },
    DELETE: {
      path: '/equipments/equipments/{id}/',
      method: 'DELETE',
    }
  },
  HOLES: {
    LIST: {
      path: '/equipments/holes/',
      method: 'GET',
    },
    CREATE: {
      path: '/equipments/holes/',
      method: 'POST',
    },
    UPDATE: {
      path: '/equipments/holes/{id}/',
      method: 'PATCH',
    },
    DELETE: {
      path: '/equipments/holes/{id}/',
      method: 'DELETE',
    }
  },
  TYPES: {
    SELECTOR: {
      path: '/equipments/types/selector/',
      method: 'GET',
    },
  },
  ADMIN: {
    EQUIPMENTS: {
      LIST: {
        path: '/equipments/admin/equipments/',
        method: 'GET',
      },
      CREATE: {
        path: '/equipments/admin/equipments/',
        method: 'POST',
      },
      DETAIL: {
        path: '/equipments/admin/equipments/{id}/',
        method: 'GET',
      },
      UPDATE: {
        path: '/equipments/admin/equipments/{id}/',
        method: 'PATCH',
      },
      DELETE: {
        path: '/equipments/admin/equipments/{id}/',
        method: 'DELETE',
      }
    },
    TYPES: {
      LIST: {
        path: '/equipments/admin/types/',
        method: 'GET',
      },
      CREATE: {
        path: '/equipments/admin/types/',
        method: 'POST',
        formData: true
      },
      DETAIL: {
        path: '/equipments/admin/types/{id}/',
        method: 'GET'
      },
      UPDATE: {
        path: '/equipments/admin/types/{id}/',
        method: 'PATCH',
        formData: true
      },
      DELETE: {
        path: '/equipments/admin/types/{id}/',
        method: 'DELETE',
      }
    }
  }
}
