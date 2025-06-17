<template>
  <div>
    <generic-multi-select :label="`${label}`"
                          :buttonText="buttonText"
                          :values="selectedId"
                          :options="activeCampaignsAlphabeticalOrder"
                          :disable="disabled"
                          :canEdit="hasPermissionTo(['list campaign', 'view campaign']) && !isReadOnly"
                          v-if="genericMultiselect"
                          @valuesUpdated="onInput">
    </generic-multi-select>
    <q-select ref="lineSelect"
              options-selected-class="text-primary"
              class="q-basic-selector"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              emit-value
              map-options
              dense
              :outlined="outlined"
              :borderless="borderless"
              :clearable="clearable"
              :loading="campaignsIsLoading || isLoading"
              :use-input="useInput"
              :error="hasError"
              :options="options"
              :placeholder="placeholder"
              :disable="disabled"
              :class="classes"
              :multiple="multiple"
              :use-chips="useChips"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :style="{ 'word-break': 'break-all', width }"
              :behavior="behavior"
              :hide-bottom-space="hideBottomSpace"
              v-else
              v-model="selectedId"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn">
      <template v-slot:prepend
                v-if="prepend">
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>
      <template v-slot:option="{ itemProps, opt }"
                v-if="!multiple">
        <q-item v-bind="itemProps"
                v-close-popup
                @click.native="selectOption(opt)">
          <q-item-section>
            <q-item-label>{{ opt.name }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="isMessagingBlocked(opt, checkBlockedMessaging, false, true)" side>
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ getMessagingBlocked(opt) }}
            </q-tooltip>
            <q-badge color="blue">i</q-badge>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected-item="{ opt }">
        {{ opt.name }}
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            {{ noResultsText }}
          </q-item-section>
        </q-item>
      </template>

      <template v-if="multiple"
                v-slot:selected-item="scope">
        <q-chip dense
                color="white"
                class="tag-selected-chip"
                text-color="secondary"
                :tabindex="scope.tabindex">
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button"
               class="custom__remove d-flex align-items-center position-absolute r-0"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon" />
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import _ from 'lodash'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { aclMixin, selectorMixin } from 'src/plugins/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'line-selector',

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
      default: 'Lines',
      required: false
    },

    buttonText: {
      type: String,
      default: 'Modify Lines',
      required: false
    },

    genericMultiselect: {
      type: Boolean,
      default: true
    },

    genericStyling: {
      type: Boolean,
      default: true
    },

    useChips: {
      type: Boolean,
      default: false
    },

    useInput: {
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

    hasError: {
      type: Boolean,
      default: false
    },

    useOnlyActives: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: false
    },

    specificClass: {
      type: String,
      required: false
    },

    outlined: {
      type: Boolean,
      default: true
    },

    borderless: {
      type: Boolean,
      default: false
    },

    checkBlockedMessaging: {
      type: Boolean,
      default: false
    },

    behavior: {
      type: String,
      default: 'menu' // default, menu or dialog
    },

    customPlaceholder: {
      type: String,
      default: ''
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    isReadOnly: {
      type: Boolean,
      default: false
    },

    preSelectedTeamInboxLineId: {
      type: Number,
      default: null
    },

    hideBottomSpace: {
      type: Boolean,
      default: false
    },

    width: {
      type: String,
      default: undefined
    }
  },

  data () {
    return {
      selectedId: null,
      options: [],
      reference: 'lineSelect',
      emitChange: true,
      fullOptionsProperty: 'activeCampaignsAlphabeticalOrder'
    }
  },

  computed: {
    ...mapState(['campaigns', 'campaignsIsLoading']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile']),
    ...mapState('TeamInbox', ['contactsLastUsedLines', 'activeInbox']),
    ...mapGetters('TeamInbox', ['activeInboxCampaignIds']),

    placeholder () {
      if (this.customPlaceholder) {
        return this.customPlaceholder
      }

      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return 'Select Lines'
        case !this.multiple && !this.selectedId:
          return 'Select Line'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        let campaigns = _.clone(this.campaigns).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })

        if (this.useOnlyActives) {
          campaigns = campaigns.filter(campaign => campaign.active === true)
        }

        return campaigns
      }

      return []
    },

    activeCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        const campaigns = _.clone(this.campaignsAlphabeticalOrder)
          .filter(campaign => campaign.active === true)

        return !this.preSelectedTeamInboxLineId
          ? campaigns
          : campaigns.filter(campaign => this.activeInboxCampaignIds.includes(campaign.id))
      }

      return []
    },

    pausedCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        return _.clone(this.campaignsAlphabeticalOrder)
          .filter(campaign => campaign.active === false)
      }

      return []
    },

    disabled () {
      return this.disable || this.campaignsIsLoading || this.isReadOnly
    },

    classes () {
      return [
        this.prepend ? 'with-prepend' : '',
        this.genericStyling ? 'generic-selector' : '',
        this.highlighted ? this.highlightedClass : '',
        this.specificClass ? this.specificClass : ''
      ]
    },

    selectedLine () {
      return this.campaigns.find(campaign => campaign.id === this.selectedId)
    },

    noResultsText () {
      return !this.preSelectedTeamInboxLineId
        ? 'No results'
        : 'No lines found in this inbox'
    }
  },

  created () {
    this.options = this.activeCampaignsAlphabeticalOrder

    if (!this.campaignsIsLoading && !_.isEmpty(this.campaigns)) {
      this.selectedId = this.value
    }
  },

  mounted () {
    this.loadPlaceholder()

    if (this.preSelectedTeamInboxLineId) {
      // Line stickiness from the team inbox. Pre-select the last used line for the contact
      const line = this.activeCampaignsAlphabeticalOrder.find(campaign => campaign.id === this.preSelectedTeamInboxLineId)
      line && this.selectOption(line)
    }
  },

  methods: {
    selectOption (option) {
      this.selectedId = option.id
    },

    filterFn (val, update) {
      if (this.selectedId && val === this.selectedId) {
        update(() => {
          this.options = this.activeCampaignsAlphabeticalOrder.filter(campaign => campaign.id === this.selectedId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.activeCampaignsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.activeCampaignsAlphabeticalOrder.filter(campaign => campaign.name.toLowerCase().indexOf(needle) > -1)
      })
    },

    updateLines (val) {
      if (!this.genericMultiselect) {
        this.$refs.lineSelect.blur()
      }

      this.$emit('change', val)
    },

    loadPlaceholder () {
      const ref = this.$refs.lineSelect

      if (!ref) {
        return
      }

      const input = ref.$el.querySelector('.q-placeholder')

      if (input) {
        input.style.display = 'block'
      }
    }
  },

  watch: {
    value () {
      if (!this.campaignsIsLoading && !_.isEmpty(this.campaigns)) {
        this.selectedId = this.value
      }
    },

    selectedId (val) {
      if (this.selectedId !== this.value) {
        this.$emit('change', val)
      }

      if (!this.genericMultiselect) {
        this.showInputPlaceholder()
      }

      // return the incoming number of the selected campaign
      const found = this.campaigns.find(campaign => campaign.id === val)
      this.$emit('selectedNumber', found ? found.incoming_number : '')
    },

    campaignsIsLoading (val) {
      if (val) {
        this.selectedId = null
        return
      }

      this.selectedId = this.value
      this.options = this.campaignsAlphabeticalOrder

      if (typeof this.$refs.lineSelect !== 'undefined') {
        this.$refs.lineSelect.refresh()
      }
    },

    activeCampaignsAlphabeticalOrder (value) {
      this.options = value
    }
  }
}
</script>
