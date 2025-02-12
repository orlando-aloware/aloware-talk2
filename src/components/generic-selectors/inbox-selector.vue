<template>
  <div class="w-100"
       data-testid="inbox-selector-wrapper">
    <generic-multi-select buttonText="Inboxes"
                          data-testid="inbox-selector-generic-multi-select"
                          :disable="disable"
                          :label="label"
                          :options="inboxesAlphabeticalOrder"
                          :values="selectedId"
                          :canEdit="hasPermissionTo(['list inbox', 'view inbox'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="updateInboxes" />
    <q-select class="q-basic-selector"
              color="primary"
              data-testid="inbox-selector-select"
              dense
              emit-value
              input-debounce="0"
              map-options
              option-disable="enabled"
              option-label="name"
              option-value="id"
              options-selected-class="text-primary"
              outlined
              style="word-break: break-all;"
              use-input
              ref="inboxSelect"
              :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '', isGenericSelectorStyle ? 'generic-selector': '']"
              :clearable="clearable"
              :disable="disable"
              :multiple="multiple"
              :options="options"
              :placeholder="placeholder"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :use-chips="multiple"
              v-else
              v-model="selectedId"
              @blur="onBlur"
              @filter="filterFn"
              @focus="onFocus"
              @input="onInput"
              @popup-show="onShowMenu">
      <template v-if="prepend"
                v-slot:prepend>
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey"
                          data-testid="inbox-selector-no-results-select">
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
        <q-chip class="tag-selected-chip"
                color="white"
                data-testid="inbox-selector-chip"
                dense
                text-color="secondary"
                :tabindex="scope.tabindex"
        >
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div class="custom__remove d-flex align-items-center position-absolute r-0"
               data-testid="inbox-selector-remove-btn"
               role="button"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon"
                             data-testid="inbox-selector-remove-tag-icon" />
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
      default: 'Inboxes'
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
      reference: 'inboxSelect',
      fullOptionsProperty: 'inboxesAlphabeticalOrder'
    }
  },

  computed: {
    ...mapState({
      allInboxes: 'inboxes'
    }),

    placeholder () {
      switch (true) {
        case this.multiple && this.selectedId.length < 1:
          return 'Select Inboxes'
        case !this.multiple && !this.selectedId:
          return 'Select Inbox'
        case this.multiple && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    inboxesAlphabeticalOrder () {
      if (this.allInboxes) {
        return _.clone(this.allInboxes).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }
      return []
    },

    inboxes () {
      return this.inboxesAlphabeticalOrder
    }
  },

  created () {
    this.options = this.inboxes
  },

  methods: {
    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.inboxes.filter(inbox => inbox.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.inboxes
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.inboxes.filter(inbox => inbox.name.toLowerCase().indexOf(needle) > -1)
      })
    },

    updateInboxes (val) {
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
