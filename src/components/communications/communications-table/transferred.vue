<template>
  <div class="d-flex flex-column"
       data-testid="transferred-from-row">
    <div v-if="!isAgent && row[prop]?.length">
      <router-link :key="index"
                   :to="{ path: getUserActivityURL(userId) }"
                   v-for="(userId, index) in row[prop]">
        {{ getUserName(getUser(userId)) }}
      </router-link>
    </div>

    <div v-else-if="row[prop]?.length">
      <span class="text-blue cursor-pointer"
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

export default {
  name: 'Transferred',

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
