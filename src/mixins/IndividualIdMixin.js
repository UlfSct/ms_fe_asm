import { reactive } from 'vue'


export function useIdMixin() {
  const state = reactive({
    index: 0
  })

  const getId = () => {
    let id = `Н_${state.index}`
    state.index++
    return id
  }

  return {
    getId,
  }
}
