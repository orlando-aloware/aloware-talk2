<template>
  <div>
    <template v-if="!isForm">
      <p class="_600 mb-0">
        Target Users
        <span v-if="communication.target_users && communication.target_users.length">({{ attemptLabel }})</span>
      </p>
      <template v-if="isTargetUsersWithAttempts">
        <q-tree
          :nodes="generateTargetUsersTree"
          node-key="label"
          selected-color="primary"
          :expanded="[communication.attempt]">
        </q-tree>
      </template>
      <template v-else-if="isTargetUsersWithNoAttempts">
        <q-tree
          :nodes="generateTargetUsersTree"
          node-key="label"
          selected-color="primary">
        </q-tree>
      </template>
      <span v-else>-</span>
      <br>
    </template>
    <template v-else-if="isForm">
      <label class="form-control-label">
        Target Users
        <span v-if="communication.target_users && communication.target_users.length">({{attemptLabel}})</span>
      </label>
      <div class="d-flex align-items-center">
        <template v-if="isTargetUsersWithAttempts">
          <q-tree
            :nodes="generateTargetUsersTree"
            node-key="label"
            selected-color="primary"
            :expanded="[communication.attempt]">
          </q-tree>
        </template>
        <template v-else-if="isTargetUsersWithNoAttempts">
          <q-tree
            :nodes="generateTargetUsersTree"
            node-key="label"
            selected-color="primary">
          </q-tree>
        </template>
        <span v-else>-</span>
      </div>
    </template>
  </div>
</template>

<script>
import { userMixin } from 'src/plugins/mixins'

export default {
  name: 'target-users-tree',

  mixins: [userMixin],

  props: {
    communication: {
      required: true,
      type: Object,
      default: () => {
        return {}
      }
    },
    isForm: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    attemptLabel () {
      return this.communication.attempt ? `attempt ${this.communication.attempt}` : 'no attempts'
    },

    generateTargetUsersTree () {
      if (!this.communication.target_users) {
        return []
      }

      let data = []
      let layerNumber = 0
      for (let userIds of this.communication.target_users) {
        layerNumber++
        let entry = {
          id: layerNumber,
          label: 'Layer ' + layerNumber,
          children: []
        }
        entry.children = this.generateAttemptingUsersTree(userIds)
        data.push(entry)
      }

      // return the tree
      return data
    },

    isTargetUsersWithAttempts () {
      // attempt(s) should also be less than or equal to
      // the number of target user layers
      return this.communication.target_users &&
        this.communication.target_users.length &&
        this.communication.attempt &&
        this.communication.attempt <= this.communication.target_users.length
    },

    isTargetUsersWithNoAttempts () {
      // if attempt is null or more than the target user layers,
      // treat it as no attempt(s)
      return this.communication.target_users &&
        this.communication.target_users.length &&
        (this.communication.attempt == null ||
          this.communication.attempt > this.communication.target_users.length)
    }
  },

  methods: {
    generateAttemptingUsersTree (attemptingUsers) {
      if (!attemptingUsers) {
        return
      }

      let data = []
      let order = 0
      for (let userId of attemptingUsers) {
        order++
        let user = this.getUser(userId)
        if (user) {
          if (attemptingUsers.length === 1) {
            order = ''
          }
          data.push({
            label: order + '- ' + this.getUserName(user)
          })
        }
      }

      // return the tree
      return data
    }
  }
}
</script>
