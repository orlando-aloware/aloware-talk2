<template>
  <q-select ref="select"
            class="q-basic-selector"
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
            v-model="selectedId"
            :hide-dropdown-icon="hideDropdownIcon"
            :clearable="clearable"
            :outlined="outlined"
            :borderless="borderless"
            :options="options"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '', customClass]"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :loading="forceLoading"
            @filter="filterFn"
            @virtual-scroll="onVirtualScroll">
    <template v-slot:prepend
              v-if="prepend">
      {{prepend}}
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          {{ noResultsLabel }}
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
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope"
              v-if="useChips">
      <q-chip dense
              :tabindex="scope.tabindex"
              color="white"
              class="tag-selected-chip"
              text-color="secondary">
        <i class="fa fa-circle position-absolute"
            :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
              @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon">
          </remove-tag-icon>
        </div>
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import _ from 'lodash'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { selectorMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-selector',

  mixins: [
    selectorMixin
  ],

  components: {
    RemoveTagIcon
  },

  props: {
    value: {
      type: Number,
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
    },
    showNumber: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 3
    },
    searchOnScroll: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      isFocused: false,
      selectedId: this.value,
      search: '',
      reference: 'select',
      fullOptionsProperty: 'options',
      options: [],
      params: {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][search][value]': '',
        'filter_groups[0][is_conjunction]': true,
        'sort': 'last_engagement_at',
        'order': 'desc'
      },
      forceLoading: false,
      searchedAllContacts: false
    }
  },

  computed: {
    placeholder () {
      if (!this.showPlaceholder) {
        return ''
      }

      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return this.customPlaceholder || 'Select Contacts'
        case !this.multiple && !this.selectedId:
          return this.customPlaceholder || 'Select Contact'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    noResultsLabel () {
      return this.search.length < this.threshold
        ? `Type at least ${this.threshold} characters to search in contacts`
        : 'No Results'
    }
  },

  async mounted () {
    // if component is disabled and the value is set, search for that specific contact only to fill as the option
    if (this.value) {
      this.loadContacts(this.value)
    }
  },

  methods: {
    filterFn: _.debounce(function (val, update) {
      this.search = val
      this.options = []

      if (val.length >= this.threshold) {
        this.$emit('loading')

        this.params['filter_groups[0][filters][search][value]'] = val
        this.loadContacts()
          .then(() => {
            update()
          })
      } else {
        update(() => {
          this.params.page = 1
          this.$emit('input', null)
        })
      }
    }, 500),

    onVirtualScroll (details) {
      if (this.searchOnScroll && (details.index + 1) === this.options.length) {
        this.params.page++

        this.loadContacts()
      }
    },

    formatContact (contact) {
      return {
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name} ${this.showNumber ? ' (' + contact.phone_number + ')' : ''}`
      }
    },

    async loadContacts (id = null) {
      if (this.searchedAllContacts) {
        return
      }

      this.forceLoading = true
      this.$emit('loading')

      const url = '/api/v2/contacts' + (id ? '/' + id : '')
      const response = await this.$axios.get(url, { params: this.params })

      if (id) {
        this.options.push(this.formatContact(response.data))
      } else {
        const contacts = response.data.data

        contacts.forEach(contact => {
          this.options.push(this.formatContact(contact))
        })

        if (contacts.length < this.params.per_page) {
          this.searchedAllContacts = true
        }
      }

      this.forceLoading = false
      this.$emit('loaded')
    }
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('input', val)
      }

      this.showInputPlaceholder()
    }
  }
}
</script>
