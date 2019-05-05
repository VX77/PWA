const cookieparser = process.server ? require('cookieparser') : undefined
const state = () => ({
  auth:null,
  id:null
})
const mutations = {
  setAuth(state, auth) {
    state.auth = auth
  },
  setId(state, id) {
    state.id = id
  }
}
export default {
  namespaced: true,
  state,
  mutations
}
