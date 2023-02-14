import store from 'src/store'

export default {
  beforeRouteEnter (to, from, next) {
    store().dispatch('auth/check', { preventLogout: false, preventRedirect: true })
      .then((response) => {
        if (response.data.user.is_reseller) {
          next({ path: '/' })
        } else {
          next()
        }
      }).catch(() => {
        next()
      })
  }
}
