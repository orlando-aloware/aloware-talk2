<template>
  <q-select ref="userSelect"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            :outlined="outlined"
            dense
            v-model="userId"
            :options="userOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @popup-show="onShowMenu"
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
      <q-item v-if="!scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label>
            <div class="break-all">{{ scope.opt.name }}</div>
          </q-item-label>
          <q-item-label v-if="!scope.opt.is_destination"
                        caption>
            <div class="break-all">{{ scope.opt.email }} - {{ getLabel(scope.opt) }}</div>
          </q-item-label>
          <q-item-label v-else
                        caption>
            <div>{{ getLabel(scope.opt) }}</div>
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

    useChips: {
      type: Boolean,
      default: false,
      required: false
    },

    hideExtensions: {
      required: false,
      default: false,
      type: Boolean
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    genericStyling: {
      type: Boolean,
      default: true
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },
    customClass: {
      type: String,
      default: ''
    },
    outlined: {
      type: Boolean,
      default: true
    },
    showPlaceholder: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      userId: this.value,
      userOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['currentCompany', 'users']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.userId.length < 1:
          return 'Select Users'
        case !this.multiple && !this.userId:
          return 'Select User'
        case this.multiple && this.userId.length > 0:
        case !this.multiple && this.userId:
        default:
          return ''
      }
    },

    availableUsers () {
      return this.users
    },

    filteredUsers () {
      if (this.availableUsers) {
        let filteredUsers = this.availableUsers.filter((user) =>
          !(user.role_names.length === 1 && user.read_only_access) &&
          user.answer_by !== AnswerTypes.BY_NONE
        )

        return filteredUsers
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
      let normalUsers = [...this.normalUsers]

      normalUsers.unshift({
        group: 'Users',
        disable: true
      })

      let usersArray = normalUsers

      if (!this.hideExtensions && this.extensionUsers && this.extensionUsers.length > 0) {
        let extensionUsers = [...this.extensionUsers]
        extensionUsers.unshift({
          group: 'Extensions',
          disable: true
        })
        usersArray = [...normalUsers, ...extensionUsers]
      }

      return usersArray
    }
  },

  created () {
    this.userOptions = this.formattedOptions
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.userSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (this.userId && val === this.userId) {
        update(() => {
          this.userOptions = this.formattedOptions.filter(user => user.id === this.userId)
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
