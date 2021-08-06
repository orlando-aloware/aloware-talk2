<template>
  <q-select :options="userOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '' ]"
            class="generic-selector"
            v-model="userId"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            use-input
            emit-value
            map-options
            outlined
            dense
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      <span class="text-size-xs text-grey-80">{{ prepend }}</span>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'user-selector',

  props: {
    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    }
  },

  data () {
    return {
      userId: this.value,
      userOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'users']),

    placeholder () {
      if (this.userId) {
        return ''
      }

      if (this.multiple) {
        return 'Select users'
      }

      return 'Select a user'
    },

    usersAlphabeticalOrder () {
      if (this.users) {
        let users = _.clone(this.users)
        return users.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    activeCampaignsAlphabeticalOrder () {
      if (this.usersAlphabeticalOrder.length) {
        let users = _.clone(this.usersAlphabeticalOrder)
        return users
      }

      return []
    },

    pausedCampaignsAlphabeticalOrder () {
      if (this.usersAlphabeticalOrder.length) {
        let users = _.clone(this.usersAlphabeticalOrder)
        return users.filter(user => user.active === false)
      }

      return []
    }
  },

  created () {
    this.userOptions = this.usersAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.userId && val === this.userId) {
        update(() => {
          this.userOptions = this.usersAlphabeticalOrder.filter(user => user.id === this.userId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.userOptions = this.usersAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.userOptions = this.usersAlphabeticalOrder.filter(user => user.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.userId = this.value
    },

    userId (val) {
      if (this.userId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
