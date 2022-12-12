<template>
  <b-modal dialog-class="modal-pd-add"
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
            flat>
      <b-overlay :show="loading > 0">
        <div>
          You're converting <strong>{{ contactsDescription }}</strong> into a Power Dialer task and adding it to your queue.
        </div>

        <hr>

        <label class="label mb-1 text-weight-bold">
          Conversion Options
        </label>
        <b-form-checkbox class="mb-2"
                         :value="option.value"
                         :key="option.value"
                         v-model="conversion"
                         v-for="option in conversionOptions">
          {{ option.text }}
          <information-circle-icon color="#2F80ED"
                                   v-if="option.helper"/>
          <q-tooltip anchor="top middle"
                     self="bottom middle"
                     v-if="option.helper">
            {{ option.helper }}
          </q-tooltip>
        </b-form-checkbox>

        <label class="label mt-2 mb-1 text-weight-bold">
          Direction
        </label>
        <b-form-radio-group class="w-100"
                            button-variant="outline-primary"
                            name="radio-btn-outline"
                            size="sm"
                            buttons
                            :options="directionOptions"
                            v-model="direction">
        </b-form-radio-group>

        <hr>

        <label class="label mb-1 text-weight-bold">
          Where do you want to add these tasks?
        </label>
        <b-form-radio class="mb-2"
                      :value="option.value"
                      :key="option.value"
                      v-model="where"
                      v-for="option in whereOptions">
          {{ option.text }} - <span style="color: var(--gray);">{{ option.description }}</span>
        </b-form-radio>
        <date-picker mode="dateTime"
                     title-position="left"
                     color="blue"
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
                         style="width: 155px"
                         :value="inputValue"
                         v-on="inputEvents"/>
                </div>
            </template>
        </date-picker>

        <b-button class="btn-block mt-4"
                  variant="primary"
                  size="sm"
                  @click="save">
          Ok
        </b-button>
      </b-overlay>
    </q-card>
    <b-modal modal-class="confirm-dialog"
             title="Continue"
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
                  @click="closeConfirmDialog">
            Continue
          </button>
        </div>
      </template>
    </b-modal>
  </b-modal>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { mapActions, mapState } from 'vuex'
import * as ImportConstants from 'src/constants/power-dialer-import'
import * as CompanyTiers from 'src/constants/company-international-tier'
import { integrationMixin } from 'src/plugins/mixins'

export default {
  name: 'power-dialer-add-modal',

  components: {
    DatePicker,
    InformationCircleIcon
  },

  mixins: [integrationMixin],

  props: {
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
      default: 'add' // add, duplicate, hubspot
    }
  },

  data: () => ({
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
    count: 0
  }),

  computed: {
    ...mapState('contacts', ['isAddPowerDialerOpen']),
    ...mapState('cache', ['currentCompany']),
    isOpen: {
      get () {
        return this.isAddPowerDialerOpen
      },
      set (isOpen) {
        return isOpen
      }
    },
    requestParams () {
      let params = {
        ...this.params,
        'prevent_duplicates': this.conversion.includes('prevent_duplicates'),
        'multiple_phone_numbers': this.conversion.includes('multiple_phone_numbers'),
        'allow_international_phone_numbers': this.conversion.includes('allow_international_phone_numbers'),
        'own_contacts_only': this.conversion.includes('own_contacts_only'),
        'direction': this.direction
      }

      if (this.where === 'scheduled') {
        params.future_scheduled_time = this.schedule.toISOString().substr(0, 10)
      }

      return params
    },
    contactsDescription () {
      return this.count + (this.count === 1 ? ' contact' : ' contacts')
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
          text: 'Bottom'
        }, {
          value: ImportConstants.TOP,
          text: 'Top'
        }
      ]
    }
  },

  mounted () {
    this.loading++

    if (this.mode === 'integration') {
      // check if Hubspot list already exists
      this.checkIntegrationImport()
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
    setCount () {
      if (this.params.contact_ids) {
        this.count = this.params.contact_ids.length
        this.loading--
      } else if (this.params.target) {
        if (this.mode === 'integration') {
          this.count = this.params.size
          this.loading--
        } else {
          this.getListCount(this.params.target).then(res => {
            this.count = res.data.count
            this.loading--
          })
        }
      }
    },
    onHidden () {
      this.addPowerDialerOpen(false)
      this.$emit('hidden')
    },
    save () {
      this.loading++

      return this.getRequest()
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
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
      return this.$axios
        .post('api/v2/power-dialer-list-items', this.requestParams)
        .then(() => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.setSearch('')
          this.$generalNotification('Selected contacts were successfully added.')
          this.$emit('submit')

          if (this.redirect) {
            if (this.params.contact_list_id) {
              this.$router.push(`/power-dialer/list/${this.params.contact_list_id}`)
            } else {
              this.$router.push(`/power-dialer`)
            }
          }
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
      switch (this.integrationName) {
        case 'hubspot':
          return this.importFromHubspot()
        case 'pipedrive':
          return this.addPipedriveFilter()
        case 'zoho':
          return this.addZohoView()
      }
    },
    importFromHubspot () {
      console.log({ requestParams: this.requestParams, params: this.params })
      // remove target and size from params
      let target = this.params.target
      let params = this.requestParams
      delete params.target
      delete params.size

      return this.$axios
        .post('/api/v2/power-dialer-lists/import-hubspot-list/' + target, params)
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

      return this.$axios
        .post('/api/v2/power-dialer-lists/import-zoho-view/' + target, params)
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

      return this.$axios.post('/api/v2/power-dialer-lists/import-pipedrive-filter/' + target, params)
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
        .get(`${process.env.API_REPORTING_URL}/api/v2/power-dialer-lists/${id}/count`)
    },
    checkIntegrationImport () {
      switch (this.integrationName) {
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
      } else {
        this.loading--
      }
    },
    async checkPipedriveFilter () {
      this.loading++

      const res = await this.$axios
        .get('/api/v2/power-dialer-lists/pipedrive-filter-exists/' + this.params.target)

      if (res.data.exists) {
        this.confirm_message = 'The Pipedrive filter you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.confirm = true
      } else {
        this.loading--
      }
    },
    async checkHubspotList () {
      this.loading++

      const res = await this.$axios
        .get('/api/v2/power-dialer-lists/hubspot-list-exists/' + this.params.target)

      if (res.data.exists) {
        this.confirm_message = 'The HubSpot list you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.confirm = true
      } else {
        this.loading--
      }
    },
    closeConfirmDialog () {
      this.confirm = false
      this.loading--
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
