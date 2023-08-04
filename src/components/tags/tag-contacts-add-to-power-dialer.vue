<template>
  <b-modal id="tag-add-tag-contacts-to-pd"
           modal-class="tags__modal"
           size="md"
           centered
           v-model="openModal"
           @hide="closeModalPrompt">
    <b-overlay no-wrap
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>{{ formName }}</h6>
    </template>

    <p class="text-13 text-amber-10">
      <span class="font-weight-bold">Note:</span>  This tool will respect user's visibility limits
    </p>

    <div class="pt-2">
      <label class="label mb-3">Add Tasks to this User's Power Dialer List</label>
      <b-row class="no-gutters">
        <b-col class="mr-1">
          <b-form-group class="font-weight-light text-13 mb-0"
                        label="User">
            <user-selector :generic-styling="false"
                           v-model="userId"
                           @change="setUserId"/>
          </b-form-group>
        </b-col>

        <b-col class="ml-1">
          <b-form-group class="font-weight-light text-13 mb-0"
                        label="Power Dialer List">
            <power-dialer-list-selector v-model="powerDialerListId"
                                        :user-id="userId"
                                        @change="setPowerDialerListId" />
          </b-form-group>
        </b-col>
      </b-row>

    </div>

    <div class="py-3">
      <label class="label mt-2 mb-1 font-weight-bold">
        Push Contacts To
      </label>
      <q-btn-toggle class="custom-toggle-button"
                    toggle-color="primary active"
                    text-color="grey-90"
                    color="transparent"
                    no-caps
                    dense
                    spread
                    unelevated
                    :options="directionOptions"
                    v-model="direction" />

      <b-form-checkbox class="mx-2 mt-2"
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
    </div>

    <p class="text-13 mt-2 mb-0"
       v-if="!isBulk"
       v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`" />

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModalPrompt">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  :disabled="!userId"
                  @click.prevent="addTasksToPowerDialer">
            Add Tasks
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import UserSelector from 'components/generic-selectors/user-selector.vue'
import * as ImportConstants from 'src/constants/power-dialer-import'
import * as CompanyTiers from 'src/constants/company-international-tier'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { tagsMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'
import API from 'src/plugins/api/api'
import PowerDialerListSelector from 'components/power-dialer/power-dialer-list-selector.vue'

export default {
  name: 'tag-contacts-add-to-power-dialer',

  mixins: [
    tagsMixin
  ],

  components: {
    PowerDialerListSelector,
    UserSelector,
    InformationCircleIcon
  },

  props: {
    tag: {
      type: Object,
      required: false
    },

    isShow: {
      type: Boolean,
      required: true
    },

    isBulk: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      direction: ImportConstants.BOTTOM,
      conversion: [
        'prevent_duplicates'
      ],
      userId: null,
      powerDialerListId: this.myQueueId
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('powerDialer', [
      'myQueueId'
    ]),

    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    },

    directionOptions () {
      return [
        {
          value: ImportConstants.BOTTOM,
          label: 'Bottom'
        },
        {
          value: ImportConstants.TOP,
          label: 'Top'
        }
      ]
    },

    isAllowedInternationalNumbers () {
      return this.currentCompany?.international_tier !== CompanyTiers.INTERNATIONAL_TIER_1
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

    formName () {
      return `Add Tasks to a User's Power Dialer List`
    }
  },

  methods: {
    closeModalPrompt (bvModalEvent) {
      if (!this.userId) {
        this.closeModal()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the ${this.formName} form?`, {
        title: `Close ${this.formName}`,
        okTitle: 'Yes, I\'m sure',
        cancelTitle: 'No, I\'m not',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (confirm) {
            this.closeModal()
          }
        })
    },

    closeModal () {
      this.$emit('closeAddTagContactsToPowerDialer')
      this.reset()
    },

    reset () {
      this.direction = ImportConstants.BOTTOM
      this.conversion = [
        'prevent_duplicates'
      ]
      this.userId = null
    },

    setUserId (userId) {
      this.userId = userId
    },

    setPowerDialerListId (listId) {
      this.powerDialerListId = listId
    },

    addTasksToPowerDialer () {
      this.loading = true

      let msg = `Are you sure you want to add the contacts under `
      msg += (this.isBulk ? `these tags` : 'this tag')
      msg += ` to this user's Power Dialer List?`

      this.$bvModal.msgBoxConfirm(msg, {
        title: 'Event Confirmation',
        okTitle: 'Yes',
        cancelTitle: 'No',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (!confirm) {
            this.loading = false
            return
          }

          this.addTasks()
        })
    },

    addTasks () {
      const payload = {
        user_id: this.userId,
        direction: this.direction,
        prevent_duplicates: this.conversion.includes('prevent_duplicates'),
        multiple_phone_numbers: this.conversion.includes('multiple_phone_numbers'),
        allow_international_phone_numbers: this.conversion.includes('allow_international_phone_numbers'),
        power_dialer_list_id: this.powerDialerListId
      }
      let xhr = null

      if (this.isBulk) {
        payload.tag_ids = this.getSelectedTagIds
        xhr = API.V1.tags.bulkAddTasksToUserPowerDialer(payload)
      } else {
        xhr = API.V1.tags.addTasksToUserPowerDialer(this.tag.id, payload)
      }

      xhr
        .then(res => {
          this.loading = false
          this.$generalNotification(res.data.message)
          this.closeModal()
        }).catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>
