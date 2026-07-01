export const materialsUrls = {
  MATERIALS: {
    LIST: {
      path: '/materials/materials/',
      method: 'GET',
    },
    CREATE: {
      path: '/materials/materials/',
      method: 'POST',
    },
    SELECTOR: {
      path: '/materials/materials/selector/',
      method: 'GET',
    },
    DETAIL: {
      path: '/materials/materials/{id}/',
      method: 'GET',
    },
    UPDATE: {
      path: '/materials/materials/{id}/',
      method: 'PATCH',
    },
    DELETE: {
      path: '/materials/materials/{id}/',
      method: 'DELETE',
    }
  },
  ADMIN: {
    MATERIALS: {
      LIST: {
        path: '/materials/admin/materials/',
        method: 'GET',
      },
      CREATE: {
        path: '/materials/admin/materials/',
        method: 'POST',
      },
      DETAIL: {
        path: '/materials/admin/materials/{id}/',
        method: 'GET',
      },
      UPDATE: {
        path: '/materials/admin/materials/{id}/',
        method: 'PATCH',
      },
      DELETE: {
        path: '/materials/admin/materials/{id}/',
        method: 'DELETE',
      }
    }
  }
}
