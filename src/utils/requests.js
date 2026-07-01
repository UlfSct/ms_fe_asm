import {computed} from "vue";
import {useAuthStore} from "@/stores/core/auth.js";

export const API_URL = 'http://192.168.0.148:8000'

const getDefaultHeaders = (formData=false) => {
  return formData ? {} : {
    'Content-Type': 'application/json'
  }
}

const getDefaultAuthHeaders = (formData=false) => {
  const store = useAuthStore()
  const token = computed(() => store.getToken)
  return {
    'Authorization': 'Token ' + token.value,
      ...(formData ? {} : {
        'Content-Type': 'application/json'
      })
  }
}

const constructUrl = (path, params = {}) => {
  let parts = path.split('/')
  for (let i = 0; i < parts.length; i++) {
    if (parts[i][0] !== '{') continue
    let paramValueFound = false
    let paramName = parts[i].slice(1, parts[i].length - 1)
    for (let param in params) {
      if (param !== paramName) continue
      paramValueFound = true
      parts[i] = params[paramName]
    }
    if (!paramValueFound) {
      console.error(`Параметр ${paramName} не задан при отправке запроса`)
      return null
    }
  }
  return `${API_URL}${parts.join('/')}`
}

export const sendRequest = async (
  urlObject,
  data = {},
  params = {},
  query={},
  auth = true,
) => {
  let url = new URL(constructUrl(urlObject.path, params))
  for (let key in query) {
    url.searchParams.append(key, query[key])
  }
  if (!url) return
  let headers = auth ? getDefaultAuthHeaders(urlObject.formData) : getDefaultHeaders(urlObject.formData)
  let response
  if (urlObject.method === 'GET') {
    response = await fetch(url, {
      method: urlObject.method,
      headers: headers
    })
  } else {
    response = await fetch(url, {
      method: urlObject.method,
      headers: headers,
      body: urlObject.formData ? data : JSON.stringify(data)
    })
  }

  let json = await response.json()
  if (!response.ok) {
    if (response.status === 401) {
      const store = useAuthStore()
      store.deleteToken()
      window.location = window.location.href.split('admin')[0]
    }

    if (json.detail && json.detail === "Пользователь неактивен или удален.") {
      const store = useAuthStore()
      store.deleteToken()
      window.location.reload();
      return {}
    }
    throw json
  }
  return json
}
