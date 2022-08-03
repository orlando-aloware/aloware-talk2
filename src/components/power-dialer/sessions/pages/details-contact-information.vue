<template>
  <div>
    <q-card flat
            class="mt-0 p-0">
      <q-toolbar class="mt-2 shadow-2">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-medium px-2">
            About
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-card>
    <q-card flat
            class="mt-1 p-0 py-0 session-contact-info-scroller"
            :disabled="sessionLoader">
      <q-card-section class="p-0">
        <ContactInfo
          :has-expanded="false" />
        <ContactSaveBar
          v-if="isValidResource" />
      </q-card-section>
      <!-- <q-card-section
        v-for="(f, i) in form"
        :key="`f.name-${i}`"
        class="py-0">
        <div class="d-block">
          <div
            :class="`${f.name === 'label' ? 'text-uppercase text-weight-medium text-caption pb-2 pt-3' : ''} text-muted custom-input-label mb-0`">
            {{ f.label }}
          </div>
          <template>
            <InputField
              v-if="f.type === 'text'"
              v-model="localResource[f.name]"
              :disabled="f.disabled" />
            <SelectStateField
              v-else-if="f.type === 'select' && f.name === 'state'"
              v-model="localResource[f.name]" dense
              :options="[]"
              :disabled="f.disabled" />
            <SelectCountryField
              v-else-if="f.type === 'select' && f.name === 'country'"
              v-model="localResource[f.name]" dense
              :options="[]"
              :disabled="f.disabled" />
            <SelectField
              v-else-if="f.type === 'select'"
              v-model="localResource[f.name]" dense
              :options="[]"
              :disabled="f.disabled" />
          </template>
        </div>
      </q-card-section> -->
      <q-card-section>

      </q-card-section>
    </q-card>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
// import InputField from 'components/contacts/contact-input-field'
// import SelectField from 'components/generic-selectors/user-selector'
// import SelectStateField from 'src/components/contacts/location-state-selector'
// import SelectCountryField from 'src/components/contacts/location-country-selector'
import ContactInfo from 'components/contacts/contact-information'
import ContactSaveBar from 'components/contacts/contact-save-bar'

export default {
  name: 'DetailsContactInformation',
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    // InputField,
    // SelectField,
    // SelectStateField,
    // SelectCountryField,
    ContactSaveBar,
    ContactInfo
  },
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
  }
}
</script>
