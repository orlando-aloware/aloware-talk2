<template>
  <q-select ref="userSelect"
            class="q-user-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            dense
            v-model="userId"
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="userOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @popup-show="onShowMenu"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      {{prepend}}
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
    borderless: {
      type: Boolean,
      default: false
    },
    showPlaceholder: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: false
    },
    hideDropdownIcon: {
      type: Boolean,
      default: false
    },
    customPlaceholder: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      isFocused: false,
      userId: this.value,
      userOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['users']),

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.userId.length < 1:
          return this.customPlaceholder || 'Select Users'
        case !this.multiple && !this.userId:
          return this.customPlaceholder || 'Select User'
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

      if (normalUsers.length > 0) {
        normalUsers.unshift({
          group: 'Users',
          disable: true
        })
      }

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
    },

    userObject () {
      if (!this.userId) {
        return null
      }

      return this.formattedOptions.find(item => item.id === this.userId)
    }
  },

  created () {
    this.userOptions = this.formattedOptions
  },

  methods: {

    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.q-user-selector .q-field__input').placeholder = this.userObject ? this.userObject.name : this.placeholder
      this.$el.querySelector('.q-user-selector .q-field__input').style.display = 'block'
      if (this.userObject) {
        this.$el.querySelector('.q-user-selector .q-field__native span').style.display = 'none'
      }
    },

    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.q-user-selector .q-field__input').placeholder = ''
      this.showInputPlaceholder()
      if (this.userObject) {
        this.$el.querySelector('.q-user-selector .q-field__native span').style.display = ''
      }
    },

    showInputPlaceholder () {
      if (!this.userObject) {
        this.$el.querySelector('.q-user-selector .q-field__input').placeholder = this.placeholder
        this.$el.querySelector('.q-user-selector .q-field__input').style.display = 'block'
      } else {
        this.$el.querySelector('.q-user-selector .q-field__input').style.display = 'none'
      }
    },

    onInput () {
      this.$el.querySelector('.q-user-selector .q-field__input').blur()
    },

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

      this.showInputPlaceholder()
    }
  }
}
</script>
