<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            v-model="show">
    <q-card class="bg-white text-black text-center q-pt-lg"
            style="width: 635px; border-radius: 30px">
      <q-card-section>
        <div class="text-h6">
          Welcome, {{ userFullName }}! 🎉
        </div>

        <div class="text-body2 q-pt-lg">
          Do you know that you can make your trial <strong>so much better</strong> and with <strong>more features to test</strong>? 🚀
        </div>

        <div class="text-body2 q-pt-lg">
          It's easy, you just need to submit some important information about your business and then you're ready to <strong>explore even more</strong>! 🤩
        </div>
      </q-card-section>

      <q-card-actions class="bg-white q-pb-lg"
                      align="center">
        <q-btn class="text-regular"
               label="Remind me later"
               text-color="grey"
               v-close-popup
               flat
               @click="changeShowedKycDialog">
        </q-btn>
        <q-btn class="text-regular"
               label="Submit info"
               color="primary"
               text-color="white"
               rounded
               @click="openKycBusinessRegistration"
               v-close-popup>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { kycMixin } from 'src/plugins/mixins'

export default {
  name: 'KycFillDialog',

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  mixins: [kycMixin],

  data () {
    return {
      updateDialogText: ''
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('auth', ['profile']),

    userFullName () {
      return `${this.profile?.first_name} ${this.profile?.last_name}` || ''
    }
  },

  methods: {
    ...mapActions(['setShowedKycDialog']),

    openKycBusinessRegistration () {
      this.changeShowedKycDialog()
      let link = `${process.env.API_URL}/account?tab=compliance&open_register_business_information=true`
      return window.open(link, '_self')
    },

    changeShowedKycDialog () {
      this.setShowedKycDialog(true)
    }
  }
}
</script>
