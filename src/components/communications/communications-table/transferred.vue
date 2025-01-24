<template>
  <div class="d-flex flex-column"
       data-testid="transferred-from-row">
    <div v-if="!isAgent && row[prop]?.length">
      <router-link class="ellipse"
                   :key="index"
                   :to="{ path: getUserActivityURL(userId) }"
                   v-for="(userId, index) in row[prop]">
        <external-link-icon color="#1976D2"/>
        {{ getUserName(getUser(userId)) }}

        <q-tooltip>
          Click to go to user's page
        </q-tooltip>
      </router-link>
    </div>

    <div v-else-if="row[prop]?.length">
      <span class="text-blue cursor-pointer ellipse"
            :key="index"
            v-for="(userId, index) in row[prop]">
          {{ getUserName(getUser(userId)) }}
        </span>
    </div>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin, classicMixin, aclMixin } from 'src/plugins/mixins'
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'

export default {
  name: 'Transferred',
  components: { ExternalLinkIcon },

  mixins: [
    userMixin,
    classicMixin,
    aclMixin
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
  }
}
</script>
