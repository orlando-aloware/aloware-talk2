<template>
  <div data-testid="target-users-tree-wrapper">
    <template v-if="!isForm">
      <p class="_600 mb-0" v-if="showLabel">
        Target Users
        <span v-if="communication.target_users && communication.target_users.length">({{ attemptLabel }})</span>
      </p>
      <template v-if="isTargetUsersWithAttempts">
        <q-tree
          :nodes="generateTargetUsersTree"
          node-key="label"
          selected-color="primary"
          :expanded.sync="attemptPath"
          data-testid="target-users-tree">
        </q-tree>
      </template>
      <template v-else-if="isTargetUsersWithNoAttempts">
        <q-tree
          :nodes="generateTargetUsersTree"
          node-key="label"
          selected-color="primary"
          data-testid="target-users-tree">
        </q-tree>
      </template>
      <span v-else>-</span>
    </template>
    <template v-else-if="isForm">
      <label class="form-control-label" v-if="showLabel">
        Target Users
        <span v-if="communication.target_users && communication.target_users.length">({{attemptLabel}})</span>
      </label>
      <div class="d-flex align-items-center">
        <template v-if="isTargetUsersWithAttempts">
          <q-tree
            :nodes="generateTargetUsersTree"
            node-key="label"
            selected-color="primary"
            :expanded.sync="attemptPath"
            data-testid="target-users-tree">
          </q-tree>
        </template>
        <template v-else-if="isTargetUsersWithNoAttempts">
          <q-tree
            :nodes="generateTargetUsersTree"
            node-key="label"
            selected-color="primary"
            data-testid="target-users-tree">
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
    },
    showLabel: {
      required: false,
      type: Boolean,
      default: true
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

      const data = []
      const layerNumber = { data: 0 }
      const userIds = { id: null }
      for (userIds.id of this.communication.target_users) {
        layerNumber.data++
        const entry = {
          id: layerNumber.data,
          label: `Layer ${layerNumber.data}`,
          children: []
        }
        entry.children = this.generateAttemptingUsersTree(userIds.id)
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

  data () {
    return {
      attemptPath: []
    }
  },

  mounted () {
    if (this.communication.attempt !== null) {
      this.attemptPath = [`Layer ${this.communication.attempt}`]
    }
  },

  methods: {
    generateAttemptingUsersTree (attemptingUsers) {
      if (!attemptingUsers) {
        return
      }

      const data = []
      const order = { data: 0 }
      const userId = { id: null }
      const user = { data: null }
      for (userId.id of attemptingUsers) {
        order.data++
        user.data = this.getUser(userId.id)
        if (!user.data) {
          continue
        }

        data.push({
          label: (attemptingUsers.length > 1 ? `(${order.data}) ` : '') + `${this.getUserName(user.data)}`
        })
      }

      // return the tree
      return data
    }
  }
}
</script>
