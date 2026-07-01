export const resultsUrls = {
  RESULTS: {
    LIST: {
      path: '/results/results/',
      method: 'GET',
    },
    DELETE: {
      path: '/results/results/{id}/',
      method: 'DELETE',
    },
    FULL: {
      path: '/results/results/{id}/full/',
      method: 'GET',
    },
    OPTIMIZE: {
      path: '/results/results/{id}/optimize/',
      method: 'POST',
    },
  },
}
