<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            v-model="show">
    <q-card class="bg-white text-black text-center q-pt-lg"
            style="width: 635px; border-radius: 30px">
      <q-card-section>
        <div class="text-h6">
          Welcome aboard! 🎉 We're thrilled to have you join us! 🌟
        </div>

        <div class="text-body2 q-pt-lg">
          To unlock your full trial and explore all the features, please submit your business information. Until then, you're set to call only your own numbers. 📞🔒
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

      if (this.isCompanyKYC) {
        this.$router.push({
          name: 'Business Information',
          params: { company_id: this.currentCompany.id }
        })
        return true
      }

      let link = `${process.env.API_URL}/account?tab=compliance`

      return window.open(link, '_blank')
    },

    changeShowedKycDialog () {
      this.setShowedKycDialog(true)
    }
  }
}
</script>
