import { reactive, toRefs } from 'vue'

function isDict(v) {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    !(v instanceof Date)
  )
}


export function useFormErrors() {
  const state = reactive({
    errors: {
      fields: {},
      non: []
    }
  })

  const clearErrors = () => {
    state.errors = {
      fields: {},
      non: []
    }
  }

  const mapErrors = (data) => {
    state.errors.fields = data
  }

  const hasError = (field) => {
    return getError(field) !== null
  }

  const getError = (
      field,
    errors = state.errors.fields
) => {
    for (const key in errors) {
      if (isDict(errors[key])) {
        if (field.includes('.')) {
          return getError(field.split('.').slice(1).join('.'), errors[key])
        }
      }
      if (errors[key]?.length > 0) {
        if (key === field) {
          return errors[key]
        }
      }
    }
    return null
  }

  const deleteError = (field, id) => {
    if (id !== undefined) {
      if (state.errors.fields[id]) {
        delete state.errors.fields[id][field]
        if (Object.keys(state.errors.fields[id]).length === 0) {
          delete state.errors.fields[id]
        }
      }
    } else {
      delete state.errors.fields[field]
    }
  }

  return {
    ...toRefs(state),
    mapErrors,
    hasError,
    getError,
    deleteError,
    clearErrors,
  }
}
