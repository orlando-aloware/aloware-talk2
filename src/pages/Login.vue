<template>
  <section class="row w-100 h-100 mx-0">
    <login-large-screens-info class="col-5 px-0" />
    <login-form class="col-12 col-lg-7 px-0" />
  </section>
</template>

<script>
import LoginLargeScreensInfo from 'components/login/login-large-screens-info'
import LoginForm from 'components/login/login-form'
import { guestMixin } from '../boot/mixins'
export default {
  name: 'login',
  mixins: [guestMixin],
  components: { LoginForm, LoginLargeScreensInfo }
}
</script>
