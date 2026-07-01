import {usersUrls} from "@/urls/users.js";
import {materialsUrls} from "@/urls/materials.js";
import {modelsUrls} from "@/urls/models.js";
import {equipmentsUrls} from "@/urls/equipments.js";
import {schemesUrls} from "@/urls/schemes.js";
import {resultsUrls} from "@/urls/results.js";

export const urls = {
  USERS: {
    ...usersUrls
  },
  MATERIALS: {
    ...materialsUrls
  },
  MODELS: {
    ...modelsUrls,
  },
  EQUIPMENTS: {
    ...equipmentsUrls
  },
  SCHEMES: {
    ...schemesUrls
  },
  RESULTS: {
    ...resultsUrls
  },
  CONSTRUCTOR: {
    PROJECTS: {
      LIST: {
        path: '/constructor/projects/',
        method: 'GET'
      }
    },
    PARTS: {
      FULL: {
        path: '/constructor/parts/{id}/full/',
        method: 'GET'
      },
      DETAIL: {
        path: '/constructor/parts/{id}/',
        method: 'GET'
      },
      CREATE: {
        path: '/constructor/parts/',
        method: 'POST'
      },
      UPDATE: {
        path: '/constructor/parts/{id}/',
        method: 'PATCH'
      },
      DELETE: {
        path: '/constructor/parts/{id}/',
        method: 'DELETE'
      }
    },
    ASSEMBLIES: {
      FULL: {
        path: '/constructor/assemblies/{id}/full/',
        method: 'GET'
      },
      DETAIL: {
        path: '/constructor/assemblies/{id}/',
        method: 'GET'
      },
      CREATE: {
        path: '/constructor/assemblies/',
        method: 'POST'
      },
      UPDATE: {
        path: '/constructor/assemblies/{id}/',
        method: 'PATCH'
      },
      DELETE: {
        path: '/constructor/assemblies/{id}/',
        method: 'DELETE'
      }
    }
  }
}
