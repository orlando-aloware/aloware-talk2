<template>
  <div class="d-flex flex-column"
       data-testid="transferred-from-row">
    <div v-if="!isAgent && row[prop]?.length">
      <router-link class="ellipse"
                   :id="`comm-attempt-${_uid}`"
                   :key="index"
                   target="_blank"
                   @click.native="handleUserClick($event, userId)"
                   :to="{ path: getUserActivityURL(userId) }"
                   v-for="(userId, index) in row[prop]">
        <external-link-icon color="#1976D2"/>
        <user-display :user-id="userId" />
        <b-tooltip custom-class="talk-table__tooltip"
                   :target="`comm-attempt-${_uid}`">
          Click to go to user's page
        </b-tooltip>
      </router-link>
    </div>

    <div v-else-if="row[prop]?.length">
      <span class="text-blue cursor-pointer ellipse"
            :key="index"
            v-for="(userId, index) in row[prop]">
        <user-display :user-id="userId" />
      </span>
    </div>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin, classicMixin, aclMixin } from 'src/plugins/mixins'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import UserDisplay from 'src/components/user-display.vue'

export default {
  name: 'Transferred',

  components: {
    ExternalLinkIcon,
    UserDisplay
  },

  mixins: [
    userMixin,
    classicMixin,
    aclMixin,
    communicationsMixin
  ],

  props: {
    row: {
      type: Object,
      required: true
    },

    prop: {
      type: String,
      required: true,
      validator (value) {
        return ['transfer_prior_user_ids', 'transfer_target_user_ids'].includes(value)
      }
    }
  },

  methods: {
    handleUserClick (e, userId) {
      const url = this.getUserActivityURL(userId)
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
