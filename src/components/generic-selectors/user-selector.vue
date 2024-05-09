<template>
  <q-select ref="userSelect"
            class="q-user-selector q-basic-selector"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all; min-width: 154px;"
            use-input
            emit-value
            map-options
            dense
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="userOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :loading="usersIsLoading"
            :disable="disable || usersIsLoading"
            :class="userSelectorClass"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            v-model="selectedId"
            data-testid="user-selector-select"
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
        <q-item-section class="no-results text-grey" data-testid="user-selector-select-no-results">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              v-if="!scope.opt.group"
              data-testid="user-selector-select-item">
        <q-item-section>
          <q-item-label>
            <div class="break-all">{{ scope.opt.name }}</div>
          </q-item-label>
          <q-item-label caption
                        v-if="!scope.opt.is_destination">
            <div class="break-all">{{ scope.opt.email }} - {{ getLabel(scope.opt) }}</div>
          </q-item-label>
          <q-item-label caption
                        v-else>
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

    <template v-slot:selected-item="scope"
              v-if="useChips">
      <q-chip color="white"
              class="tag-selected-chip"
              text-color="secondary"
              dense
              :tabindex="scope.tabindex"
              data-testid="user-selector-select-chip">
        <i class="fa fa-circle position-absolute"
           :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"/>
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
             data-testid="user-selector-select-remove-btn"
             @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon" data-testid="user-selector-select-remove-tag-icon"/>
        </div>
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import * as AnswerTypes from 'src/constants/answer-types'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'user-selector',

  mixins: [
    selectorMixin
  ],

  components: { RemoveTagIcon },

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
      selectedId: this.value,
      userOptions: [],
      reference: 'userSelect',
      fullOptionsProperty: 'formattedOptions'
    }
  },

  computed: {
    ...mapState(['users', 'usersIsLoading']),

    options () {
      return this.users
    },

    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      if (this.multiple && this.selectedId && this.selectedId.length < 1) {
        return this.customPlaceholder || 'Select Users'
      }

      if (!this.multiple && !this.selectedId) {
        return this.customPlaceholder || 'Select User'
      }

      return ''
    },

    availableUsers () {
      return this.options
    },

    filteredUsers () {
      if (!_.isEmpty(this.availableUsers)) {
        return this.availableUsers.filter((user) =>
          !((typeof user.role_names === 'undefined' || user.role_names.length === 1) && user.read_only_access) &&
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
      const normalUsers = [...this.normalUsers]

      if (normalUsers.length > 0) {
        normalUsers.unshift({
          group: 'Users',
          disable: true
        })
      }

      const usersArray = { data: normalUsers }

      if (!this.hideExtensions && this.extensionUsers && this.extensionUsers.length > 0) {
        const extensionUsers = [...this.extensionUsers]
        extensionUsers.unshift({
          group: 'Extensions',
          disable: true
        })
        usersArray.data = [...normalUsers, ...extensionUsers]
      }

      return usersArray.data
    },

    userObject () {
      if (!this.selectedId) {
        return null
      }

      return this.formattedOptions.find(item => item.id === this.selectedId)
    },

    userSelectorClass () {
      const prependClass = this.prepend ? 'with-prepend' : ''
      const genericClass = this.genericStyling ? 'generic-selector' : ''
      const highlightedClass = this.highlighted ? this.highlightedClass : ''

      return [
        prependClass,
        genericClass,
        highlightedClass,
        this.customClass
      ]
    }
  },

  mounted () {
    this.userOptions = this.formattedOptions
  },

  methods: {
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
    },

    usersIsLoading (val) {
      if (val) {
        return
      }

      this.userOptions = this.formattedOptions

      if (typeof this.$refs.userSelect !== 'undefined') {
        this.$refs.userSelect.refresh()
      }
    }
  }
}
</script>
