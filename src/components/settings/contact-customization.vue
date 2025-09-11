<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2">
              {{ SettingsMap.contact_customization.title }}
            </h1>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.contact_customization.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Contact Fields</h5>
            <p class="form-helper-text">{{ SettingsMap.contact_customization.description }}</p>
          </div>
        </b-col>

        <b-col sm="12" class="px-0">
          <contact-fields-selector
            v-if="!loadingAttributeDictionaries"
            :selected-fields="selectedFields"
            @change="onChange"
          />
          <div
            v-else
            class="mt-4 flex justify-start items-center"
          >
            <q-spinner
              color="primary"
              class="mr-2"
              size="2em"
            />
            Loading custom attributes...
          </div>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import SettingsMap from 'components/settings/settings-map'
import ContactFieldsSelector from 'components/contacts/contact-fields-selector'
import { DEFAULT_FIELD_ORDER } from 'src/constants/contact-fields-definitions'
import { mapActions, mapGetters } from 'vuex'
import { settingsMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-customization',

  components: {
    ContactFieldsSelector
  },

  mixins: [settingsMixin],

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      loadingAttributeDictionaries: true,
      selectedFields: []
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),

    SettingsMap () {
      return SettingsMap
    }
  },

  methods: {
    ...mapActions(['setAttributeDictionaries']),

    ...mapActions('settings', ['updateChangedUserProperties', 'setFormValidity', 'setUserClone']),

    loadAttributeDictionaries () {
      this.$axios.get('/api/v1/attribute-dictionary').then(res => {
        this.setAttributeDictionaries(res.data.data)
      }).finally(() => {
        this.loadingAttributeDictionaries = false
      })
    },

    initializeSelectedFields () {
      this.selectedFields = this.profile.setting_contact_fields
        ? [...this.profile.setting_contact_fields]
        : [...DEFAULT_FIELD_ORDER]
    },

    onChange (newSelectedFields) {
      this.selectedFields = newSelectedFields
      this.onUpdateFields(newSelectedFields, 'setting_contact_fields')

      const isValid = newSelectedFields.length > 0
      this.setFormValidity(isValid)
    },

    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })
    }
  },

  created () {
    this.initializeSelectedFields()
    this.loadAttributeDictionaries()
  }
}
</script>
