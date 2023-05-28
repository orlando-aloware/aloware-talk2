<template>
  <b-modal id="tag-add-tag-contacts-to-pd"
           modal-class="tags__modal"
           no-close-on-esc
           no-close-on-backdrop
           centered
           size="md"
           v-model="openModal"
           @hidden="closeModal">
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
      <h6>Add Tasks to a User's Power Dialer List</h6>
    </template>

    <p class="text-13 text-amber-10">
      <span class="font-weight-bold">Note:</span>  This tool will respect user's visibility limits
    </p>

    <div class="pt-2">
      <label class="label mt-2 mb-1">Add Tasks to this User's Power Dialer (My Queue)</label>
      <user-selector :generic-styling="false"
                     v-model="userId"
                     @change="setUserId"/>
    </div>

    <div class="py-3">
      <label class="label mt-2 mb-1 font-weight-bold">
        Push Contacts To
      </label>
      <q-btn-toggle v-model="direction"
                    :options="directionOptions"
                    class="custom-toggle-button"
                    no-caps
                    dense
                    spread
                    unelevated
                    toggle-color="primary active"
                    color="transparent"
                    text-color="grey-90"/>

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
                  @click.prevent="closeModal">
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
import axios from 'axios'

export default {
  name: 'tag-contacts-add-to-power-dialer',

  mixins: [
    tagsMixin
  ],

  components: {
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
      userId: null
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('tagsModule', [
      'getSelectedTagIds'
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
    }
  },

  methods: {
    closeModal () {
      this.reset()
      this.$emit('closeAddTagContactsToPowerDialer')
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

    addTasksToPowerDialer () {
      this.loading = true

      let msg = `Are you sure you want to add the contacts under `
      msg += (this.isBulk ? `these tags` : 'this tag')
      msg += ` to this user's Power Dialer?`

      this.$bvModal.msgBoxConfirm(msg, {
        title: 'Event Confirmation',
        okTitle: 'Yes',
        cancelTitle: 'No',
        size: 'sm',
        buttonSize: 'sm'
      })
        .then(confirm => {
          if (!confirm) {
            this.loading = false
            return
          }

          if (this.isBulk) {
            this.bulkAddTasks()
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
        allow_international_phone_numbers: this.conversion.includes('allow_international_phone_numbers')
      }

      axios.post(`/api/v1/tags/${this.tag.id}/add-to-user-power-dialer`, payload)
        .then(res => {
          this.$generalNotification(res.data.message)
        }).catch(err => {
          this.$handleErrors(err.response)
          console.log(err)
        }).finally(() => {
          this.loading = false
          this.closeModal()
        })
    },

    bulkAddTasks () {
      if (!this.isBulk || !this.hasSelectedTagIds) {
        return
      }

      const payload = {
        user_id: this.userId,
        direction: this.direction,
        prevent_duplicates: this.conversion.includes('prevent_duplicates'),
        multiple_phone_numbers: this.conversion.includes('multiple_phone_numbers'),
        allow_international_phone_numbers: this.conversion.includes('allow_international_phone_numbers'),
        tag_ids: this.getSelectedTagIds
      }

      axios.post(`/api/v1/tags/bulk-add-to-user-power-dialer`, payload)
        .then(res => {
          this.$generalNotification(res.data.message)
          this.clearAllSelectedTags()
        }).catch(err => {
          this.$handleErrors(err.response)
          console.log(err)
        }).finally(() => {
          this.loading = false
          this.closeModal()
        })
    }
  }
}
</script>
