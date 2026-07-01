export const schemesUrls = {
  SCHEMES: {
    LIST: {
      path: '/schemes/schemes/',
      method: 'GET',
    },
    CREATE: {
      path: '/schemes/schemes/',
      method: 'POST',
    },
    DETAIL: {
      path: '/schemes/schemes/{id}/',
      method: 'GET',
    },
    UPDATE: {
      path: '/schemes/schemes/{id}/',
      method: 'PATCH',
    },
    DELETE: {
      path: '/schemes/schemes/{id}/',
      method: 'DELETE',
    },
    FULL: {
      path: '/schemes/schemes/{id}/full/',
      method: 'GET',
    },
    FULL_UPDATE: {
      path: '/schemes/schemes/{id}/full/',
      method: 'PUT',
    },
    CREATE_RESULT: {
      path: '/schemes/schemes/{id}/convert-to-result/',
      method: 'POST',
    }
  },
}
