<template>
  <div class="broadcasts__add__view">
    <div class="broadcasts__add__view__form">
      <div class="broadcasts__add__view__form__header">
        {{ currentStep.name }}
      </div>

      <div class="broadcasts__add__view__form__content">
        <component :is="mainComponent"
                   ref="mainComponent"
                   @input="mainComponentChanged"
                   @contactGroupChanged="onContactGroupChanged"/>
        <!-- broadcast-add-contact -->
        <!-- broadcast-add-message -->
        <!-- broadcast-add-schedule -->
        <!-- broadcast-add-preview -->
      </div>

      <div class="broadcasts__add__view__form__footer">
        <!-- footer components -->

        <!-- buttons -->
        <b-button class="mr-2"
                  size="sm"
                  variant="light"
                  @click="onGoToPreviousStep"
                  v-if="currentStep.id > FIRST_STEP">
          Back
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  @click="onSubmitBroadcast"
                  v-if="currentStep.id === LAST_STEP">
          Send
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  :disabled="!isMainComponentValid"
                  @click="onGoToNextStep"
                  v-else>
          Next
        </b-button>
      </div>
    </div>

    <div class="broadcasts__add__view__info row mr-0">
      <template v-if="formData.contactGroup === 'list'">
        <div class="col-3 pr-2 pl-0">
          <q-card class="p-3"
                  flat>
            <span class="d-block text-h5 text-weight-medium">100</span>
            <span class="text-h6 text-weight-light">Contacts</span>
          </q-card>
        </div>
        <div class="col-3 px-2">
          <q-card class="p-3"
                  flat>
            <span class="d-block text-h5 text-weight-medium">$0.00</span>
            <span class="text-h6 text-weight-light">Estimated Cost</span>
          </q-card>
        </div>
      </template>
      <template v-if="currentStep.id >= 2">
        <div class="col-3 px-2">
          <q-card class="p-3"
                  flat>
            <span class="d-block text-h5 text-weight-medium">100/160</span>
            <span class="text-h6 text-weight-light">Characters</span>
          </q-card>
        </div>
        <div class="col-3 pl-2 pr-0">
          <q-card class="p-3"
                  flat>
            <span class="d-block text-h5 text-weight-medium">1/4</span>
            <span class="text-h6 text-weight-light">SMS Parts</span>
          </q-card>
        </div>
      </template>
      <template v-if="formData.contactGroup === 'filter'">
        <q-card class="col py-3"
                flat>
          <div class="row">
            <span class="col-3 text-h6 font-weight-bold">
              Contact Preview
            </span>
            <span class="col-3 text-h6 text-weight-regular">
              205 Contacts
            </span>
          </div>
          <div class="row">
            <div class="col h-20 px-0">
              <!-- Contact basic table -->
              <contacts-view :simpleTable="true"
                             :columns="CONTACTS_COLUMNS"
                             :list="{
                                name: 'All contacts',
                                type: '2',
                              }"/>
            </div>
          </div>
        </q-card>
      </template>
    </div>
  </div>
</template>

<script>
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
import BroadcastAddViewMessage from './broadcast-add-view-message.vue'
import BroadcastAddViewSchedule from './broadcast-add-view-schedule.vue'
import ContactsView from '../../pages/contacts/ContactsView.vue'
import {
  contactsMixins,
  visibilityMixin
} from 'src/plugins/mixins'
import { computed } from 'vue'

const FIRST_STEP = 1
const LAST_STEP = 4

const CONTACTS_COLUMNS = [{
  default: true,
  sticky: true,
  label: 'Checkbox',
  name: 'checkbox'
},
{
  name: 'name',
  label: 'Name',
  category: 0,
  order: 0,
  required: true,
  sortable: true,
  draggable: false,
  resizable: true,
  default: true,
  minWidth: 200
},
{
  name: 'first_name',
  label: 'First Name',
  category: 0,
  order: 1,
  sortable: true,
  draggable: true,
  resizable: true,
  default: false,
  minWidth: 225
},
{
  name: 'last_name',
  label: 'Last Name',
  category: 0,
  order: 2,
  sortable: true,
  draggable: true,
  resizable: true,
  default: false,
  minWidth: 225
},
{
  name: 'phone_number',
  label: 'Phone Number',
  category: 0,
  order: 3,
  sortable: true,
  draggable: true,
  resizable: true,
  default: true
},
{
  name: 'phone_numbers',
  relationName: 'phoneNumbers',
  label: 'All Phone Numbers',
  category: 0,
  order: 4,
  sortable: false,
  draggable: true,
  resizable: true,
  default: false,
  minWidth: 170
},
{
  name: 'contact_owner',
  label: 'Contact Owner',
  category: 2,
  order: 5,
  sortable: false,
  draggable: true,
  resizable: true,
  default: false
},
{
  name: 'disposition_status',
  relationName: 'dispositionStatus',
  label: 'Contact Disposition',
  category: 3,
  order: 6,
  sortable: false,
  draggable: true,
  resizable: true,
  default: false
},
{
  name: 'email',
  label: 'Email',
  category: 0,
  order: 7,
  sortable: false,
  draggable: true,
  resizable: true,
  default: false
},
{
  name: 'company_name',
  label: 'Company Name',
  category: 2,
  order: 8,
  sortable: false,
  draggable: true,
  resizable: true,
  default: false
}]

export default {
  name: 'broadcast-add-view',

  components: {
    BroadcastAddViewContacts,
    BroadcastAddViewMessage,
    BroadcastAddViewSchedule,
    ContactsView
  },

  mixins: [
    contactsMixins,
    visibilityMixin
  ],

  provide () {
    return {
      contactsData: computed(() => this.contactsData)
    }
  },

  props: {
    currentStep: {
      type: Object,
      required: true
    },

    steps: {
      type: Array,
      required: true
    }
  },

  computed: {
    mainComponent () {
      switch (this.currentStep.id) {
        case 1:
          return 'broadcast-add-view-contacts'
        case 2:
          return 'broadcast-add-view-message'
        case 3:
          return 'broadcast-add-view-schedule'
        case 4:
          return 'broadcast-add-view-preview'
        default:
          throw new Error('Invalid step ' + this.currentStep.id)
      }
    }
  },

  data: () => ({
    isMainComponentValid: true,
    FIRST_STEP,
    LAST_STEP,
    CONTACTS_COLUMNS,
    formData: {
      contactGroup: 'list'
    }
  }),

  methods: {
    mainComponentChanged (state) {
      // this.isMainComponentValid = state
    },

    onContactGroupChanged (contactGroup) {
      this.formData.contactGroup = contactGroup
      this.$emit('contactGroupChanged', contactGroup)
    },

    onGoToNextStep () {
      this.$emit('nextStep')
    },

    onGoToPreviousStep () {
      this.$emit('previousStep')
    },

    onSubmitBroadcast () {
      this.$emit('submit')
    }
  },

  watch: {
    'formData.contactGroup' (contactGroup) {
      if (contactGroup === 'filter') {
        this.loadData()
      }
    }
  }
}
</script>
