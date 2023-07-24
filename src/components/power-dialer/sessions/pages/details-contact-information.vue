<template>
  <div>
    <q-card class="mt-0 mb-1 p-0 flex-grow-0"
            flat>
      <q-toolbar class="mt-2 shadow-2">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-medium px-2">
            About
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-card>
    <q-card class="p-0 py-0 flex-grow-1 h-100 overflow-hidden"
            flat
            :disabled="sessionLoader">
      <q-card-section class="p-0 h-100 session-contact-block overflow-y-scroll">
        <ContactInfo :has-expanded="false" />
        <ContactSaveBar v-if="isValidResource" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ContactInfo from 'components/contacts/contact-information'
import ContactSaveBar from 'components/contacts/contact-save-bar'
import {
  contactMixin,
  contactV2AttributesMixin
} from 'src/plugins/mixins'

export default {
  name: 'DetailsContactInformation',

  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },

  components: {
    ContactSaveBar,
    ContactInfo
  },

  mixins: [
    contactMixin,
    contactV2AttributesMixin
  ],

  computed: {
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    ...mapState('contacts', [
      'contact',
      'contactClone'
    ]),

    localResource () {
      return { ...this.resources }
    },

    isValidResource () {
      return this.contact.id === this.contactClone.id
    }
  },

  data () {
    return {
      test: '',
      form: [
        { label: 'First Name', name: 'first_name', type: 'text', disabled: false },
        { label: 'Last Name', name: 'last_name', type: 'text', disabled: false },
        { label: 'Email', name: 'email', type: 'text', disabled: false },
        { label: 'Company', name: 'company_name', type: 'text', disabled: false },
        { label: 'Website', name: 'website', type: 'text', disabled: false },
        { label: 'City', name: 'cnam_city', type: 'text', disabled: false },
        { label: 'State', name: 'cnam_state', type: 'select', disabled: false },
        { label: 'Country', name: 'cnam_country', type: 'select', disabled: false },
        { label: 'Zip Code', name: 'cnam_zipcode', type: 'text', disabled: false },
        { label: 'TCPA Approved', name: 'tcpa_approved', type: 'text', disabled: true },
        { label: 'Created At', name: 'created_at', type: 'text', disabled: true }
      ],
      customFields: [
        { label: 'Custom Fields', name: 'label', type: '', disabled: false },
        { label: 'Intake Source', name: 'intake-source', type: 'select', disabled: false },
        { label: 'Job Title', name: 'custom-field', type: 'select', disabled: false },
        { label: 'Related Product', name: 'custom-field', type: 'select', disabled: false },
        { label: 'HQ Zip Code', name: 'custom-field', type: 'select', disabled: false }
      ]
    }
  },

  created () {
    this.$VueEvent.listen('contact_updated', this.listeners.contactUpdated)
  },

  beforeDestroy () {
    this.$VueEvent.stop('contact_updated', this.listeners.contactUpdated)
  }
}
</script>
