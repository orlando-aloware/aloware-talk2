<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            v-model="show">
    <q-card class="bg-white text-black text-center q-pt-lg"
            style="width: 635px; border-radius: 30px">
      <q-card-section>
        <div class="text-h6">
          Hi, {{ userFullName }}! 🎉
        </div>

        <div class="text-body2 q-pt-lg">
          Your trial account access <strong>has changed</strong> based on your business information submitted.
        </div>

        <div class="text-body2 q-pt-lg">
          It's easy, you just need to reload and then you're ready to continue.
        </div>
      </q-card-section>

      <q-card-actions class="bg-white q-pb-lg"
                      align="center">
        <q-btn class="text-regular"
               label="Reload"
               color="primary"
               text-color="white"
               rounded
               @click="reload"
               v-close-popup>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'KycReloadDialog',

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
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
    ...mapActions(['setShowedKycReloadDialog']),

    reload () {
      this.setShowedKycReloadDialog(false)
      window.location.reload()
    }
  }
}
</script>
