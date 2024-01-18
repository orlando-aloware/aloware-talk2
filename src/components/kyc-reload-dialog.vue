<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            v-model="show"
            position="top">
    <q-card class="bg-white text-center"
            style="width: 635px; border-radius: 10px">
      <q-card-section>
        <div class="text-body2">
          Your trial account access has changed based on your business information submitted, to access the new permissions,
          <span size="small"
                type="text"
                class="cursor-pointer el-button learn-more-text mr-2"
                @click="reload"
                style="color: #054CDB">
            <strong>Reload Now</strong>
          </span>
        </div>
      </q-card-section>
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
