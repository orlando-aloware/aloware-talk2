<template>
  <q-select ref="availableUserSelector"
            use-input
            emit-value
            map-options
            outlined
            dense
            clearable
            options-selected-class="text-primary"
            class="generic-selector q-basic-selector"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            :options="userOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :loading="loadingUsers"
            :disable="disable || loadingUsers"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :class="[ prepend ? 'with-prepend' : '' ]"
            v-model="selectedId"
            @filter="filterFn"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @popup-show="onShowMenu">
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
      <q-item v-if="!scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label>
            <q-badge :color="color(scope.opt)"
                     :style="{ top: '9px', left: '9px' }"
                     class="rounded-badge small position-absolute">
            </q-badge>
            <div class="pl-3 break-all">{{ scope.opt.name }}</div>
          </q-item-label>
          <q-item-label v-if="!scope.opt.is_destination"
                        caption>
            <div class="pl-3 break-all">{{ scope.opt.email }} - {{ getLabel(scope.opt) }}</div>
          </q-item-label>
          <q-item-label v-else
                        caption>
            <div class="pl-3">{{ getLabel(scope.opt) }}</div>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-label header class="text-size-xs">{{ scope.opt.group }}</q-item-label>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import * as AnswerTypes from 'src/constants/answer-types'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'available-user-selector',

  mixins: [
    selectorMixin
  ],

  props: {
    communication: {
      required: true
    },

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
      loadingUsers: false,
      selectedId: this.value,
      availableUsers: [],
      unavailableUsers: [],
      userOptions: [],
      reference: 'availableUserSelector',
      selectWidth: 0
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    placeholder () {
      if (this.selectedId) {
        return ''
      }

      if (this.multiple) {
        return 'Select users'
      }

      return 'Select a user'
    },

    options () {
      if (!this.availableUsers && !this.unavailableUsers) {
        return []
      }

      return this.availableUsers.concat(this.unavailableUsers)
    },

    filteredUsers () {
      if (this.options) {
        return this.options.filter((user) =>
          !(user.role_names.length === 1 && user.read_only_access) &&
          user.answer_by !== AnswerTypes.BY_NONE
        )
      }

      return []
    },

    formattedOptions () {
      const availableUsers = [...this.availableUsers]
      availableUsers.unshift({
        group: 'Available Users',
        disable: true
      })

      const unavailableUsers = [...this.unavailableUsers]
      unavailableUsers.unshift({
        group: 'Unavailable Users',
        disable: true
      })

      return [...availableUsers, ...unavailableUsers]
    }
  },

  created () {
    this.getUsers().then(() => {
      this.userOptions = this.formattedOptions
    })
  },

  methods: {
    getUsers () {
      this.loadingUsers = true
      return this.$axios.get('/api/v1/dialer/available-users', {
        params: {
          communication_id: this.communication.id
        }
      }).then((res) => {
        this.availableUsers = res.data.eligible_users.filter((user) => user.id !== this.profile.id).map((user) => {
          user.available = true
          return user
        })
        this.unavailableUsers = res.data.ineligible_users.filter((user) => user.id !== this.profile.id).map((user) => {
          user.available = false
          return user
        })
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.loadingUsers = false
      })
    },

    color (user) {
      if (user.available) {
        return 'green-6'
      }

      return 'red-6'
    },

    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.userOptions = this.formattedOptions.filter(user => user.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.userOptions = this.formattedOptions
        })
        return
      }

      update(() => {
        this.userOptions = this.formattedOptions.filter((user) =>
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
    },

    onShowMenu () {
      this.selectWidth = this.$refs.availableUserSelector.$el.offsetWidth
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', val)
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
