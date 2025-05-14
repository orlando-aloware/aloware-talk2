<template>
  <div v-if="hasPermissionTo('list user')">
    <q-select class="inline-select"
              clearable
              use-input
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="field"
              data-testid="contact-user-selector"
              :loading="isBusy"
              :options="options"
              :disable="disabled"
              @filter="filterFn">
      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.name"></q-item-label>
            <q-item-label v-if="!scope.opt.is_destination"
                          caption>
              {{ scope.opt.email }} - {{ getLabel(scope.opt) }}
            </q-item-label>
            <q-item-label v-else
                          caption>
              {{ getLabel(scope.opt) }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="text-size-xs">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey" data-testid="contact-user-selector-no-results">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import * as AnswerTypes from 'src/constants/answer-types'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-user-selector',

  mixins: [aclMixin],

  props: {
    value: {
      type: Number
    },

    hideExtensions: {
      required: false,
      default: false,
      type: Boolean
    },

    disabled: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapState(['users']),

    availableUsers () {
      return this.users
    },

    filteredUsers () {
      if (this.availableUsers) {
        return this.availableUsers.filter((user) =>
          !(user.role_names.length === 1 && user.read_only_access) &&
          user.answer_by !== AnswerTypes.BY_NONE
        )
      }

      return []
    },

    normalUsers () {
      return this.filteredUsers.filter((user) => !user.is_destination)
    },

    extensionUsers () {
      return this.filteredUsers.filter((user) => user.is_destination)
    },

    formattedOptions () {
      const nUsers = [...this.normalUsers]
      nUsers.unshift({
        group: 'Users',
        disable: true
      })

      const usersArray = { data: nUsers }

      if (!this.hideExtensions && this.extensionUsers && this.extensionUsers.length > 0) {
        const eUsers = [...this.extensionUsers]
        eUsers.unshift({
          group: 'Extensions',
          disable: true
        })
        usersArray.data = [...nUsers, ...eUsers]
      }

      return usersArray.data
    },

    field: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },

  data () {
    return {
      isBusy: false,
      options: this.formattedOptions
    }
  },

  mounted () {
    this.options = this.formattedOptions
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.formattedOptions
        })
        return
      }

      update(() => {
        this.options = this.formattedOptions.filter((user) =>
          (user.name && user.name.toLowerCase().includes(val.toLowerCase())) ||
          (user.phone_number && user.phone_number.includes(val)) ||
          (user.email && user.email.toLowerCase().includes(val.toLowerCase()))
        )
      })
    },

    getLabel (user) {
      if (!user) {
        return
      }

      switch (user.answer_by) {
        case AnswerTypes.BY_PHONE_NUMBER:
          return 'Phone Number (' + user.phone_number + ')'
        case AnswerTypes.BY_BROWSER:
          return 'Apps'
        case AnswerTypes.BY_IP_PHONE:
          return 'SIP (IP Phone)'
        case AnswerTypes.BY_NONE:
          return 'Will Not Answer'
      }
    }
  },

  watch: {
    field (val) {
      this.$emit('updateField', val)
    }
  }
}
</script>
