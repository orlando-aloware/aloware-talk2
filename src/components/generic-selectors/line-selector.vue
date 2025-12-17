<template>
  <div class="generic-line-selector">
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
              :loading="isLoadingCampaigns || isLoading"
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
          <q-item-section class="no-results text-grey" style="word-break: break-word;">
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
      <template v-slot:hint v-if="selectedId && lineInboxName && !hideBottomSpace">
        Inbox: {{ lineInboxName }}
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
import userMixin from 'src/plugins/mixins/user.mixin'
import { COMPANY_AGENT } from 'src/constants/roles'
import { agentAvailableCampaignsCallback, isIvrOrDeadEndCampaign } from 'src/plugins/helpers/campaigns'
import { TEAMINBOXES_MENU_TITLE } from 'src/router/routes'

export default {
  name: 'line-selector',

  mixins: [
    aclMixin,
    selectorMixin,
    userMixin
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
    },

    showAllLines: {
      type: Boolean,
      default: false
    },

    isDialer: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      selectedId: null,
      options: [],
      reference: 'lineSelect',
      emitChange: true,
      fullOptionsProperty: 'activeCampaignsAlphabeticalOrder',
      isInitializing: true
    }
  },

  computed: {
    ...mapState(['campaigns', 'campaignsIsLoading']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile']),
    ...mapState('TeamInbox', ['contactsLastUsedLines', 'activeInbox', 'activeInboxId', 'teamInboxCampaigns', 'loadingTeamInboxCampaigns']),
    ...mapGetters('TeamInbox', ['activeInboxCampaignIds']),

    useTeamInboxCampaigns () {
      return !this.isDialer && // Use standard campaigns for dialer
        this.activeInboxId && // Check if there is an active inbox (this is cached in store/storage)
        this.$route.name.includes(TEAMINBOXES_MENU_TITLE) // Only use team inbox campaigns if on the team inbox page
    },

    isLoadingCampaigns () {
      return this.useTeamInboxCampaigns
        ? this.loadingTeamInboxCampaigns
        : this.campaignsIsLoading
    },

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
      if (!this.availableCampaigns) {
        return []
      }

      const orderedCampaigns = _.clone(this.availableCampaigns).sort((a, b) => {
        const textA = a.name.toUpperCase()
        const textB = b.name.toUpperCase()
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
      })

      if (this.useOnlyActives) {
        return orderedCampaigns.filter(campaign => campaign.active === true)
      }

      return orderedCampaigns
    },

    activeCampaignsAlphabeticalOrder () {
      if (!this.campaignsAlphabeticalOrder.length) {
        return []
      }

      const activeCampaigns = _.clone(this.campaignsAlphabeticalOrder)
        .filter(campaign => campaign.active === true)

      if (this.showAllLines) {
        return activeCampaigns
      }

      if (this.shouldLimitAgentLinesVisibility) {
        // Only show lines that the agent has access to
        return activeCampaigns.filter(
          campaign => agentAvailableCampaignsCallback(campaign, this.profile.id)
        )
      }

      return !this.preSelectedTeamInboxLineId
        ? activeCampaigns
        : activeCampaigns.filter(
          campaign =>
            this.activeInboxCampaignIds.includes(campaign.id) ||
            isIvrOrDeadEndCampaign(campaign)
        )
    },

    pausedCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        return _.clone(this.campaignsAlphabeticalOrder)
          .filter(campaign => campaign.active === false)
      }

      return []
    },

    disabled () {
      return this.disable || this.isLoadingCampaigns || this.isReadOnly
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
      return this.availableCampaigns.find(campaign => campaign.id === this.selectedId)
    },

    lineInboxName () {
      const { ring_group: ringGroup } = this.selectedLine || {}

      const deletedPattern = /_deleted_\d+$/
      const name = ringGroup?.name

      return name?.match(deletedPattern) ? '' : name
    },

    shouldLimitAgentLinesVisibility () {
      return this.hasRole(COMPANY_AGENT) &&
        this.hasCompanyTeamInboxLineManagementEnhancements
    },

    noResultsText () {
      if (this.shouldLimitAgentLinesVisibility && !this.activeCampaignsAlphabeticalOrder.length) {
        return 'You don\'t have access to any lines. Please contact your company admin to be added to a Team Inbox before making calls.'
      }

      return !this.preSelectedTeamInboxLineId || this.showAllLines
        ? 'No results'
        : 'No lines found in this inbox'
    },

    availableCampaigns () {
      return this.useTeamInboxCampaigns
        ? this.teamInboxCampaigns
        : this.campaigns
    },

    allCampaigns () {
      // Remove duplicates from the campaigns array
      return [...this.campaigns, ...this.teamInboxCampaigns]
        .filter((value, index, self) => {
          return self.findIndex(v => v.id === value.id) === index
        })
    }
  },

  created () {
    this.options = this.activeCampaignsAlphabeticalOrder

    if (this.preSelectedTeamInboxLineId && this.options.length === 1) {
      // If there is only one line and the line is pre-selected, emit the event to initiate the call
      this.$emit('initiateCall', this.options[0])
    }
  },

  mounted () {
    this.loadPlaceholder()

    // Set initial value if campaigns are already loaded
    if (this.value && !this.isLoadingCampaigns && !_.isEmpty(this.availableCampaigns)) {
      this.selectedId = this.value
    }

    if (this.preSelectedTeamInboxLineId) {
      // Line stickiness from the team inbox. Pre-select the last used line for the contact
      const line = this.activeCampaignsAlphabeticalOrder.find(campaign => campaign.id === this.preSelectedTeamInboxLineId)
      line && this.selectOption(line)
    }

    // If the pre-selected line is present, check if it's available
    // Otherwise, check if the regular value is available
    this.checkUnavailableLine(this.preSelectedTeamInboxLineId || this.value)

    // Mark initialization as complete
    this.$nextTick(() => {
      this.isInitializing = false
    })
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
    },

    checkUnavailableLine (lineId) {
      if (
        !this.multiple &&
        !!lineId &&
        !this.isLoadingCampaigns &&
        !this.options.find(({ id }) => id === lineId)
      ) {
        console.log('checkUnavailableLine cleared selectedId')
        console.log('checkUnavailableLine > lineId', lineId)
        console.log('checkUnavailableLine > campaignsIsLoading', this.campaignsIsLoading)
        console.log('checkUnavailableLine > options', this.options)
        // If the selected campaign (forced v-model) is not in the options,
        // emit a change event to clear the value and emit an invalid-line event
        this.selectedId = null
        this.$emit('change', null)
        this.$emit('invalid-line-selection', this.allCampaigns.find(({ id }) => id === lineId))
      }
    }
  },

  watch: {
    value (value) {
      if (this.isLoadingCampaigns || _.isEmpty(this.availableCampaigns)) {
        return
      }

      this.selectedId = value
      this.checkUnavailableLine(value)
    },

    selectedId (val) {
      if (this.selectedId !== this.value && !this.isInitializing) {
        this.$emit('change', val)
      }

      if (!this.genericMultiselect) {
        this.showInputPlaceholder()
      }

      // return the incoming number of the selected campaign
      const campaign = this.allCampaigns.find(campaign => campaign.id === val)
      this.$emit('selectedNumber', campaign ? campaign.incoming_number : '')

      // Only check unavailable line if not initializing
      if (!this.isInitializing) {
        this.checkUnavailableLine(val)
      }
    },

    isLoadingCampaigns (val) {
      if (val) {
        this.selectedId = null
        return
      }

      this.options = this.activeCampaignsAlphabeticalOrder

      // Only set selectedId if not initializing to prevent false change events
      if (!this.isInitializing) {
        this.selectedId = this.value
      }

      if (typeof this.$refs.lineSelect !== 'undefined') {
        this.$refs.lineSelect.refresh()
      }
    },

    activeCampaignsAlphabeticalOrder (value) {
      this.options = value
    },

    options (value) {
      this.$emit('update:lineCount', value.length)
    }
  }
}
</script>

<style lang="scss">
// Inbox Name overflow (hint text)
.generic-line-selector {
  .q-field__bottom {
    .q-field__messages {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
