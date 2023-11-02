<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            v-model="show">
    <q-card class="bg-white text-black text-center q-pt-lg"
            style="width: 635px">
      <q-card-section>
        <div class="text-h5">
          Welcome!! 🎉
        </div>

        <div class="text-h6 q-pt-lg">
          Looks like you already have an account with us. 🎉
        </div>

        <div class="text-h6 q-pt-lg">
          Please login to your account to continue. 🚀
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-content-center bg-white q-pb-lg"
                      text-align="center">
        <q-btn label="Go to Login"
               color="primary"
               text-color="white"
               rounded
               @click="openLoginPage"
               v-close-popup>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

export default {
  name: 'UserAlreadyHaveAccountDialog',

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    openLoginPage () {
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>
