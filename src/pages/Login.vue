<template>
  <section class="row w-100 h-100 mx-0">
    <login-large-screens-info class="col-5 px-0" />
    <login-form class="col-12 col-lg-7 px-0" />
  </section>
</template>

<script>
import LoginLargeScreensInfo from 'components/guest/login-large-screens-info'
import LoginForm from 'components/guest/login-form'
import { guestMixin } from '../boot/mixins'
export default {
  name: 'login',
  mixins: [guestMixin],
  components: { LoginForm, LoginLargeScreensInfo }
}
</script>

<style lang="scss" scoped>
@import '../css/breakpoints.scss';
.login-form-bg {
  background: url('../../public/bg/login_form_bg.png') no-repeat top left;
  background-size: cover;
}

.login-container {
  width: 100%;
  max-width: 380px;
}

.login-carousel {
  .login-slide-heading {
    height: 62px;
    color: #FFFFFF;
    font-family: "Product Sans";
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 0.29px;
    line-height: 31px;
    text-align: center;
  }
  .q-carousel__navigation-icon--active {
    color: #00BF4A !important;
  }
  .q-carousel__navigation-icon--inactive {
    color: #D2D2D2 !important;
  }
}

.login-form {
  .login-submit {
    height: 50px;
    width: 148px;
    border-radius: 8px;
    border-color: transparent;
    background-color: #00BF4A;
    color: #fff;
  }
}
@include screen('xs') {
  .login-form-logo {
    width: 65%;
  }
}
</style>
