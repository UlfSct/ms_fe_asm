export const modelsUrls = {
  MODELS: {
    LIST: {
      path: '/models/models/',
      method: 'GET',
    },
    CREATE: {
      path: '/models/models/',
      method: 'POST',
      formData: true
    },
    SELECTOR: {
      path: '/models/models/selector/',
      method: 'GET',
    },
    DETAIL: {
      path: '/models/models/{id}/',
      method: 'GET',
    },
    UPDATE: {
      path: '/models/models/{id}/',
      method: 'PATCH',
      formData: true
    },
    DELETE: {
      path: '/models/models/{id}/',
      method: 'DELETE',
    }
  },
  ADMIN: {
    MODELS: {
      LIST: {
        path: '/models/admin/models/',
        method: 'GET',
      },
      CREATE: {
        path: '/models/admin/models/',
        method: 'POST',
        formData: true
      },
      DETAIL: {
        path: '/models/admin/models/{id}/',
        method: 'GET',
      },
      UPDATE: {
        path: '/models/admin/models/{id}/',
        method: 'PATCH',
        formData: true
      },
      DELETE: {
        path: '/models/admin/models/{id}/',
        method: 'DELETE',
      }
    }
  }
}
