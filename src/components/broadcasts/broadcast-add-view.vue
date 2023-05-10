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
                  v-if="currentStep.id > FIRST_STEP">
          Back
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  v-if="currentStep.id === LAST_STEP">
          Send
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  :disabled="!isMainComponentValid"
                  v-else>
          Next
        </b-button>
      </div>
    </div>

    <div class="broadcasts__add__view__info row mr-0">
      <template v-if="formData.contactGroup === 'list'">
        <q-card class="col-3 py-3 mr-2"
                flat>
          <span class="d-block text-h5 text-weight-medium">100</span>
          <span class="text-h6 text-weight-light">Contacts</span>
        </q-card>
        <q-card class="col-3 py-3 mx-2"
                flat>
          <span class="d-block text-h5 text-weight-medium">$0.00</span>
          <span class="text-h6 text-weight-light">Estimated Cost</span>
        </q-card>
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
            <div class="col">
              <!-- Contact basic table -->
            </div>
          </div>
        </q-card>
      </template>
    </div>
  </div>
</template>

<script>
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
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
    isMainComponentValid: false,
    FIRST_STEP,
    LAST_STEP,
    CONTACTS_COLUMNS,
    formData: {
      contactGroup: null
    }
  }),

  methods: {
    mainComponentChanged (state) {
      this.isMainComponentValid = state
    },
    onContactGroupChanged (contactGroup) {
      this.formData.contactGroup = contactGroup
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
