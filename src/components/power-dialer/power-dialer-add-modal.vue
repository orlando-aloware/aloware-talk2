<template>
  <div v-if="!showInContactsPage">
    <b-modal dialog-class="modal-pd-add"
             data-testid="power-dialer-add-modal"
             centered
             hide-footer
             no-close-on-backdrop
             no-close-on-esc
             v-model="isOpen"
             @hidden="onHidden">
      <template #modal-title>
        <h2>Power Dialer Task Options</h2>
      </template>
      <q-card class="my-card"
              data-testid="power-dialer-add-modal-card"
              flat>
        <b-overlay data-testid="power-dialer-add-modal-overlay"
                   :show="loading > 0">
          <div data-testid="power-dialer-add-modal-converting-message">
            You're converting <strong>~{{ contactsDescription }}</strong> into a Power Dialer task and adding it to your queue.
          </div>

          <hr>

          <label class="label mb-1 text-weight-bold"
                 data-testid="power-dialer-add-modal-conversion-options">
            Conversion Options
          </label>
          <b-form-checkbox class="mb-2"
                           data-testid="power-dialer-add-modal-conversion-checkbox"
                           :value="option.value"
                           :key="option.value"
                           v-model="conversion"
                           v-for="option in conversionOptions">
            {{ option.text }}
            <information-circle-icon color="#2F80ED"
                                     data-testid="power-dialer-add-modal-circle-icon"
                                     v-if="option.helper"/>
            <q-tooltip anchor="top middle"
                       self="bottom middle"
                       data-testid="power-dialer-add-modal-helper-tooltip"
                       v-if="option.helper">
              {{ option.helper }}
            </q-tooltip>
          </b-form-checkbox>

          <label class="label mt-2 mb-1 text-weight-bold">
            Direction
          </label>
          <q-btn-toggle class="custom-toggle-button"
                        toggle-color="primary active"
                        color="transparent"
                        text-color="grey-90"
                        data-testid="power-dialer-add-modal-direction-toggle"
                        no-caps
                        dense
                        spread
                        unelevated
                        :options="directionOptions"
                        v-model="direction"/>

          <hr>

          <label class="label mb-1 text-weight-bold">
            Where do you want to add these tasks?
          </label>
          <b-form-radio class="mb-2"
                        data-testid="power-dialer-add-modal-where-radio"
                        :value="option.value"
                        :key="option.value"
                        v-model="where"
                        v-for="option in whereOptions">
            {{ option.text }} - <span style="color: var(--gray);">{{ option.description }}</span>
          </b-form-radio>
          <date-picker mode="dateTime"
                       title-position="left"
                       color="blue"
                       data-testid="power-dialer-add-modal-date-picker"
                       :min-date="new Date()"
                       :masks="masks"
                       :popover="popover_config"
                       v-model="schedule"
                       v-if="where === 'scheduled'">
            <template v-slot="{ inputValue, inputEvents }">
              <div class="ml-4 text-sm">
                <small class="text-grey">
                  Scheduled time:
                </small>
                <br>
                <input class="px-2 py-1 border rounded text-grey"
                       data-testid="power-dialer-add-modal-date-picker-input"
                       style="width: 155px"
                       :value="inputValue"
                       v-on="inputEvents"/>
              </div>
            </template>
          </date-picker>

          <b-button class="btn-block mt-4"
                    variant="primary"
                    size="sm"
                    data-testid="power-dialer-add-modal-save-button"
                    @click="save">
            Ok
          </b-button>
        </b-overlay>
      </q-card>
      <b-modal modal-class="confirm-dialog"
               title="Continue"
               data-testid="power-dialer-add-modal-confirm-dialog"
               centered
               v-model="confirm"
               @close="onHidden">
        <div class="text-left">
          <div class="text-dark">
            {{ confirm_message }}
          </div>
        </div>
        <template slot="modal-footer">
          <div class="d-flex w-100">
            <div class="flex-grow-1"></div>
            <button class="btn btn-sm btn-primary mr-2"
                    data-testid="power-dialer-add-modal-confirm-dialog-continue-button"
                    @click="closeConfirmDialog">
              Continue
            </button>
          </div>
        </template>
      </b-modal>
    </b-modal>
  </div>
  <div v-else>
    <b-modal no-close-on-backdrop
             no-close-on-esc
             hide-footer
             v-model="showContactModals['add']">
      <template #modal-header>
        <h2>Power Dialer Task Options</h2>
        <slot name="header-close-content">
          <b-button variant="transparent"
                    @click="hidePDModalsInContacts">
            <i class="fas fa-times"></i>
          </b-button>
        </slot>
      </template>
      <q-card class="my-card"
              data-testid="power-dialer-add-modal-card"
              flat>
        <b-overlay data-testid="power-dialer-add-modal-overlay"
                   :show="loading > 0">
          <div data-testid="power-dialer-add-modal-converting-message">
            You're converting <strong>~{{ contactsDescription }}</strong> into a Power Dialer task and adding it to your queue.
          </div>

          <hr>

          <div v-if="mode === 'add-contact-list'">
            <label class="label mb-1 text-weight-bold"
                   data-testid="power-dialer-add-modal-conversion-options">
              Select Power Dialer List
            </label>
            <b-row class="no-gutters mb-2">
              <b-col class="mr-1"
                     v-if="!isAgent">
                <b-form-group class="font-weight-light text-13 mb-0"
                              data-testid="add-to-power-dialer-modal-user-box"
                              label="User">
                  <user-selector :generic-styling="false"
                                 v-model="userId"
                                 @change="setUserId"/>
                </b-form-group>
              </b-col>

              <b-col class="ml-1">
                <b-form-group class="font-weight-light text-13 mb-0"
                              data-testid="add-to-power-dialer-modal-pd-list-box"
                              label="Power Dialer List">
                  <power-dialer-list-selector v-model="powerDialerListId"
                                              :user-id="userId"
                                              @change="setPowerDialerListId" />
                </b-form-group>
              </b-col>
            </b-row>
          </div>

          <label class="label mb-1 text-weight-bold"
                 data-testid="power-dialer-add-modal-conversion-options">
            Conversion Options
          </label>
          <b-form-checkbox class="mb-2"
                           data-testid="power-dialer-add-modal-conversion-checkbox"
                           :value="option.value"
                           :key="option.value"
                           v-model="conversion"
                           v-for="option in conversionOptions">
            {{ option.text }}
            <information-circle-icon color="#2F80ED"
                                     data-testid="power-dialer-add-modal-circle-icon"
                                     v-if="option.helper"/>
            <q-tooltip anchor="top middle"
                       self="bottom middle"
                       data-testid="power-dialer-add-modal-helper-tooltip"
                       v-if="option.helper">
              {{ option.helper }}
            </q-tooltip>
          </b-form-checkbox>

          <label class="label mt-2 mb-1 text-weight-bold">
            Direction
          </label>
          <q-btn-toggle class="custom-toggle-button"
                        toggle-color="primary active"
                        color="transparent"
                        text-color="grey-90"
                        no-caps
                        dense
                        spread
                        unelevated
                        data-testid="power-dialer-add-modal-direction-toggle"
                        :options="directionOptions"
                        v-model="direction"/>

          <hr>

          <label class="label mb-1 text-weight-bold">
              Where do you want to add these tasks?
          </label>
          <b-form-radio class="mb-2"
                        data-testid="power-dialer-add-modal-where-radio"
                        :value="option.value"
                        :key="option.value"
                        v-model="where"
                        v-for="option in whereOptions">
            {{ option.text }} - <span style="color: var(--gray);">{{ option.description }}</span>
          </b-form-radio>
          <date-picker mode="dateTime"
                       title-position="left"
                       color="blue"
                       data-testid="power-dialer-add-modal-date-picker"
                       :min-date="new Date()"
                       :masks="masks"
                       :popover="popover_config"
                       v-model="schedule"
                       v-if="where === 'scheduled'">
            <template v-slot="{ inputValue, inputEvents }">
              <div class="ml-4 text-sm">
                <small class="text-grey">
                  Scheduled time:
                </small>
                <br>
                <input class="px-2 py-1 border rounded text-grey"
                       data-testid="power-dialer-add-modal-date-picker-input"
                       style="width: 155px"
                       :value="inputValue"
                       v-on="inputEvents"/>
              </div>
            </template>
          </date-picker>

          <div class="row justify-center">
            <div class="col-6 text-center">
              <b-button class="btn-block mt-4"
                        variant="secondary"
                        size="sm"
                        :disabled="userId == null"
                        data-testid="power-dialer-add-modal-stay-in-contacts"
                        @click="saveAndStay">
                {{isMyOwnList ? 'Stay in Contacts' : 'Add to Power Dialer'}}
              </b-button>
            </div>
            <div class="col-6 text-center"
                 v-if="isMyOwnList">
              <b-button class="btn-block mt-4"
                        variant="primary"
                        size="sm"
                        data-testid="power-dialer-add-modal-go-to-power-dialer"
                        @click="save">
                Go to PowerDialer
              </b-button>
            </div>
          </div>
        </b-overlay>
      </q-card>
    </b-modal>

    <b-modal title="Confirmation"
             v-model="showContactModals['confirmation']">
      <p class="my-1">
        Are you sure you want to cancel the action?. The contacts will not be added to the queue.
      </p>
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="danger"
                  data-testid="power-dialer-add-modal-cancel-action-cancel"
                  @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="primary"
                  data-testid="power-dialer-add-modal-cancel-action-proceed"
                  @click="hidePDModalsInContacts()">
          Yes, Continue
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ImportConstants from 'src/constants/power-dialer-import'
import * as CompanyTiers from 'src/constants/company-international-tier'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { integrationMixin, aclMixin, userMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import { get, isEmpty } from 'lodash'
import moment from 'moment'
import UserSelector from 'components/generic-selectors/user-selector.vue'
import PowerDialerListSelector from 'components/power-dialer/power-dialer-list-selector.vue'

export default {
  name: 'power-dialer-add-modal',

  components: {
    DatePicker,
    InformationCircleIcon,
    UserSelector,
    PowerDialerListSelector
  },

  mixins: [integrationMixin, aclMixin, userMixin],

  props: {
    integration: {
      type: String,
      required: false
    },

    redirect: {
      type: Boolean,
      default: true
    },

    params: {
      type: Object,
      required: true
    },

    mode: {
      type: String,
      default: 'add' // add, duplicate, hubspot, add-contact-list
    },

    showInContactsPage: {
      type: Boolean,
      default: false
    },

    checkedCount: {
      type: Number,
      default: 0
    },

    contactList: {
      type: Object,
      default: null
    },

    selectedAllCount: {
      type: Number,
      default: 0
    },

    isManualSelection: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: 0,
      confirm: false,
      confirm_message: '',
      conversion: [
        'prevent_duplicates'
      ],
      where: 'queue',
      schedule: new Date(),
      direction: ImportConstants.BOTTOM,
      masks: {
        input: 'MM/DD/YYYY HH:mm'
      },
      popover_config: {
        placement: 'right'
      },
      count: 0,
      stay: false,
      showContactModals: {
        add: false,
        confirmation: false
      },
      userId: null,
      powerDialerListId: this.myQueueId,
      ContactListTypes
    }
  },

  computed: {
    ...mapState('contacts', [
      'isAddPowerDialerOpen',
      'currentListFilters',
      'showAddViewMyContacts',
      'search'
    ]),

    ...mapState(['users']),

    ...mapState('cache', ['currentCompany']),

    ...mapGetters('powerDialer', ['myQueueId']),

    ...mapState(['isDatatableSelectedAll', 'currentTimezone']),

    ...mapState('auth', ['profile']),

    isOpen: {
      get () {
        return this.isAddPowerDialerOpen
      },
      set (isOpen) {
        return isOpen
      }
    },

    isMyOwnList () {
      return this.userId === this.profile.id
    },

    requestParams () {
      let params = {
        ...this.params,
        'prevent_duplicates': this.conversion.includes('prevent_duplicates'),
        'multiple_phone_numbers': this.conversion.includes('multiple_phone_numbers'),
        'allow_international_phone_numbers': this.conversion.includes('allow_international_phone_numbers'),
        'own_contacts_only': this.conversion.includes('own_contacts_only') || this.showAddViewMyContacts,
        'direction': this.direction
      }

      if (this.search) {
        params.search = this.search
      }

      if (this.isDatatableSelectedAll) {
        params.selected_all = true

        if (params?.contact_ids) {
          delete params.contact_ids
        }
      }

      if (!isEmpty(this.currentListFilters)) {
        params.filter_groups = this.$jsonClone(this.currentListFilters)
      }

      if (this.where === 'scheduled') {
        params.future_scheduled_time = moment(this.schedule).utc().tz(this.currentTimezone).format('YYYY-MM-DD HH:mm:ss')
      }

      return params
    },

    contactsDescription () {
      let description = ''

      if (this.mode === 'add-contact-list' && this.contactList && !this.isManualSelection) {
        description += this.contactList.contactCount
      } else if (this.requestParams.selected_all) {
        description += this.selectedAllCount
      } else if (this.count !== null) {
        description += this.$options.filters.numFormat(this.count)
      }

      description += (this.count === 1 ? ' contact' : ' contacts')

      return description
    },

    isAllowedInternationalNumbers () {
      return this.currentCompany.international_tier !== CompanyTiers.INTERNATIONAL_TIER_1
    },

    conversionOptions () {
      const options = [
        {
          value: 'multiple_phone_numbers',
          text: 'Turn multiple numbers into separated tasks',
          helper: 'Any non-primary numbers of a contact will be turned into separate tasks'
        }, {
          value: 'prevent_duplicates',
          text: 'Prevent duplicate phone numbers',
          helper: 'If selected, duplicate numbers will not be included again'
        }, {
          value: 'own_contacts_only',
          text: 'Add own contacts only',
          helper: 'If selected, it will add only the contacts owned by you'
        }
      ]

      // add option only if company has international enabled and tier higher than 1
      if (this.isAllowedInternationalNumbers) {
        options.push({
          value: 'allow_international_phone_numbers',
          text: 'Add international phone numbers'
        })
      }

      return options
    },

    whereOptions () {
      return [
        {
          value: 'queue',
          text: 'In queue',
          description: 'Default'
        }, {
          value: 'scheduled',
          text: 'Scheduled',
          description: 'If you want to call these contacts at a later time'
        }
      ]
    },

    directionOptions () {
      return [
        {
          value: ImportConstants.BOTTOM,
          label: 'Bottom'
        }, {
          value: ImportConstants.TOP,
          label: 'Top'
        }
      ]
    }
  },

  mounted () {
    this.loading++

    // When open PD modal, verify if the authenticated user is in the list of users to select, and set it
    // as the default user if exists. This should happen only for 'add' and 'add-contact-list' modes
    if (this.profile.id && this.mode === 'add-contact-list' && this.filterUsers(this.users).find(user => user.id === this.profile.id)) {
      this.setUserId(this.profile.id)
    }

    if (this.mode === 'integration') {
      // check if a list from integration already exists
      this.checkIntegrationImport()
    }

    if (this.showInContactsPage) {
      this.showContactModals['add'] = true
    }

    this.setCount()
  },

  methods: {
    ...mapActions('contacts', [
      'setShouldUpdateSelectedListContactCount',
      'setSearch',
      'foldersLoaded',
      'addPowerDialerOpen',
      'createPdListClose'
    ]),

    setUserId (userId) {
      this.userId = userId
    },

    setPowerDialerListId (listId) {
      this.powerDialerListId = listId
    },

    setCount () {
      if (this.checkedCount) {
        this.count = this.checkedCount
        this.loading--
        return
      }

      if (this.params.contact_ids) {
        this.count = this.params.contact_ids.length
        this.loading--

        return
      }

      if (this.params.target && this.mode === 'integration') {
        this.count = this.params.size
        this.loading--

        return
      }

      if (this.params.target) {
        this.getListCount(this.params.target).then(res => {
          this.count = res.data.count
          this.loading--
        })
      }
    },

    onHidden () {
      this.addPowerDialerOpen(false)
      this.$emit('hidden')
    },

    saveAndStay () {
      this.stay = true
      this.save()
      this.addPowerDialerOpen(false)
      this.$emit('hidden')
    },

    openPDModalInContacts (type) {
      // Show the specified modal
      this.showContactModals[type] = true
    },

    hidePDModalsInContacts () {
      // Hide all modals
      for (let modal in this.showContactModals) {
        this.showContactModals[modal] = false
      }
      this.addPowerDialerOpen(false)
      this.$emit('hidden')
    },

    save () {
      this.loading++

      return this.getRequest()
        .catch((err) => {
          const {
            message,
            html
          } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
        .finally(() => {
          this.loading--
          this.addPowerDialerOpen(false)
          this.createPdListClose()
        })
    },

    getRequest () {
      // In case of new types of requests, you just need to setup a new mode and its own import method, like above
      switch (this.mode) {
        case 'add-contact-list':
          return this.addContacts()
        case 'add':
          return this.addContacts()
        case 'duplicate':
          return this.duplicateList()
        case 'integration':
          return this.importFromIntegration()
      }

      return Promise.reject()
    },

    addContacts () {
      const listId = get(this.requestParams, 'contact_list_id', this.powerDialerListId)

      // If mode is 'add-contact-list', user should select the PD list to add contacts
      // if user selected a list that is not myQueueId, set the new PD list id to receive the contacts
      if (this.mode === 'add-contact-list' && this.powerDialerListId !== this.myQueueId) {
        this.requestParams.contact_list_id = this.powerDialerListId
      }

      // If selectedAll OR is List action
      const shouldSelectAll = this.requestParams.selected_all || (this.mode === 'add-contact-list' && !this.isManualSelection)

      // Verify filters to avoid adding all company contacts
      if (shouldSelectAll && !this.requestParams.filter_groups && this.contactList && this.contactList.id !== 'all') {
        // Add to requests params the list_id to adding all contacts from current list
        this.requestParams.list_id = this.contactList.id
        this.requestParams.selected_all = true
      }

      // Don't send list_id for dynamic lists, it should use only the filters
      if (this.contactList?.type === this.ContactListTypes.DYNAMIC) {
        delete this.requestParams.list_id
      }

      // Remove contact_ids param if it's empty
      if (this.requestParams.contact_ids !== undefined && this.requestParams.contact_ids.length === 0) {
        delete this.requestParams.contact_ids
      }

      this.$VueEvent.fire('addContactsProgress', {
        id: listId,
        loading: true
      })

      return this.$axios
        .post('api/v2/power-dialer-list-items', this.requestParams)
        .then((res) => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.setSearch('')
          this.$generalNotification(res.data.message)
          this.$emit('submit')

          if (this.redirect && !this.stay) {
            if (this.params.contact_list_id) {
              this.$router.push(`/power-dialer/list/${this.params.contact_list_id}`)

              return
            }

            this.$router.push(`/power-dialer`)
          }

          if (this.stay) {
            this.stay = false
          }
        }).catch(error => {
          this.$VueEvent.fire('addContactsProgress', {
            id: null,
            loading: false
          })

          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },

    duplicateList () {
      // remove target from params
      let target = this.params.target
      let params = this.requestParams
      delete params.target

      return this.$axios
        .post(`/api/v2/power-dialer-lists/${target}/duplicate`, params)
        .then((res) => {
          this.reloadFolders()
          this.$generalNotification('Power dialer list has been successfully created from a contacts list.', 'success')
          this.$emit('submit')

          if (this.redirect) {
            this.$router.push({ path: `/power-dialer/list/${res.data.data.id}/in-queue` })
          }
        })
    },

    importFromIntegration () {
      switch (this.getIntegration()?.toLowerCase()) {
        case 'hubspot':
          return this.importFromHubspot()
        case 'pipedrive':
          return this.addPipedriveFilter()
        case 'zoho':
          return this.addZohoView()
      }
    },

    importFromHubspot () {
      // remove target and size from params
      let target = this.params.target
      let params = this.requestParams
      delete params.target
      delete params.size

      return talk2Api.V2.integrations.hubspot.importList(target, params)
        .then(response => response.data)
        .then(data => {
          const notification = this.$generalNotification('Your HubSpot contact list is being imported. We will notify you when it\'s ready.')
          this.$emit('submit', {
            notification: notification
          })
        })
        .catch(_err => {
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    addZohoView () {
      // remove target and size from params
      let target = this.params.target
      let params = this.requestParams
      delete params.target
      delete params.size

      return talk2Api.V2.integrations.zoho.importView(target, params)
        .then(response => response.data)
        .then(data => {
          const notification = this.$generalNotification('Your Zoho view is being imported. We will notify you when it\'s ready.')
          this.$emit('submit', {
            notification: notification
          })
        })
        .catch(_err => {
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    addPipedriveFilter () {
      // remove target and size from params
      let target = this.params.target
      let params = this.requestParams
      delete params.target
      delete params.size

      return talk2Api.V2.integrations.pipedrive.importFilter(target, params)
        .then(response => response.data)
        .then(data => {
          const notification = this.$generalNotification('Your Pipedrive filter is being imported. We will notify you when it\'s ready.')
          this.$emit('submit', {
            notification: notification
          })
        })
        .catch(_err => {
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    reloadFolders () {
      return this.$axios
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch(() => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    getListCount (id) {
      return this.$axios
        .get(`https://pr-10767.mde.alodev.org/api/v2/contacts-list/${id}/count`)
    },

    checkIntegrationImport () {
      switch (this.getIntegration()?.toLowerCase()) {
        case 'hubspot':
          return this.checkHubspotList()
        case 'pipedrive':
          return this.checkPipedriveFilter()
        case 'zoho':
          return this.checkZohoView()
      }
    },

    async checkZohoView () {
      this.loading++

      const res = await this.$axios
        .get('/api/v2/power-dialer-lists/zoho-view-exists/' + this.params.target)

      if (res.data.exists) {
        this.confirm_message = 'The Zoho view you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.confirm = true

        return
      }

      this.loading--
    },

    async checkPipedriveFilter () {
      this.loading++

      const res = await this.$axios
        .get('/api/v2/power-dialer-lists/pipedrive-filter-exists/' + this.params.target)

      if (res.data.exists) {
        this.confirm_message = 'The Pipedrive filter you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.confirm = true

        return
      }

      this.loading--
    },

    async checkHubspotList () {
      this.loading++

      const res = await this.$axios
        .get('/api/v2/power-dialer-lists/hubspot-list-exists/' + this.params.target)

      if (res.data.exists) {
        this.confirm_message = 'The HubSpot list you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.confirm = true

        return
      }

      this.loading--
    },

    closeConfirmDialog () {
      this.confirm = false
      this.loading--
    },

    getIntegration () {
      if (this.integration) {
        return this.integration
      }

      return this.integrationsEnabled[0]
    }
  },

  watch: {
    'isAddPowerDialerOpen': function (value) {
      this.isOpen = value
    },

    'params.contact_ids': function (contacts) {
      this.count = contacts.length
    }
  }
}
</script>
