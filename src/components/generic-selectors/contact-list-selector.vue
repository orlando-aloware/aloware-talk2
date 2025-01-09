<template>
  <div class="w-100"
       data-testid="contact-list-selector-wrapper">
    <generic-multi-select :label="label"
                          button-text="ContactLists"
                          :values="selectedId"
                          :options="contactListsAlphabeticalOrder"
                          :disable="disable"
                          data-testid="contact-list-selector-generic-multi-select"
                          v-if="genericMultiselect"
                          @valuesUpdated="updateContactLists" />
    <q-select options-selected-class="text-primary"
              class="q-basic-selector"
              color="primary"
              option-value="id"
              option-label="name"
              option-disable="enabled"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              outlined
              dense
              :clearable="clearable"
              :use-chips="multiple"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '', isGenericSelectorStyle ? 'generic-selector': '']"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              data-testid="contact-list-selector-select"
              v-else
              ref="contactListSelect"
              v-model="selectedId"
              @popup-show="onShowMenu"
              @filter="filterFn"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput">
      <template v-if="prepend"
                v-slot:prepend>
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey"
                          data-testid="contact-list-selector-no-results-select">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item :clickable="scope.opt.enabled === false ? false : true"
                :disabled="scope.opt.enabled === false ? true : false"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.name" />
          </q-item-section>
        </q-item>
      </template>

      <template v-if="multiple"
                v-slot:selected-item="scope">
        <q-chip
          dense
          :tabindex="scope.tabindex"
          color="white"
          class="tag-selected-chip"
          text-color="secondary"
          data-testid="contact-list-selector-chip"
        >
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button"
               class="custom__remove d-flex align-items-center position-absolute r-0"
               data-testid="contact-list-selector-remove-btn"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon"
                             data-testid="contact-list-selector-remove-tag-icon" />
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { aclMixin, selectorMixin } from 'src/plugins/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'ContactListSelector',

  mixins: [
    aclMixin,
    selectorMixin
  ],

  components: {
    RemoveTagIcon,
    GenericMultiSelect
  },

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
    },

    label: {
      type: String,
      default: 'Contact ContactLists'
    },

    genericMultiselect: {
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

    isGenericSelectorStyle: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      selectedId: this.value,
      options: [],
      reference: 'contactListSelect',
      fullOptionsProperty: 'contactListsAlphabeticalOrder'
    }
  },

  computed: {
    ...mapState({
      allContactLists: 'contactLists'
    }),

    placeholder () {
      switch (true) {
        case this.multiple && this.selectedId.length < 1:
          return 'Select Contact Lists'
        case !this.multiple && !this.selectedId:
          return 'Select Contact List'
        case this.multiple && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    contactListsAlphabeticalOrder () {
      if (this.allContactLists) {
        return _.clone(this.allContactLists).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    contactLists () {
      return this.contactListsAlphabeticalOrder
    }
  },

  created () {
    this.options = this.contactLists
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.contactLists.filter(contactList => contactList.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.contactLists
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.contactLists.filter(contactList => contactList.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    updateContactLists (val) {
      this.$emit('change', val)
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

      if (!this.genericMultiselect) {
        this.showInputPlaceholder()
      }
    }
  }
}
</script>
