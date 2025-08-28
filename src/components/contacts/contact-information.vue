<template>
  <b-card class="border-0 position-relative contact-about-wrapper" data-testid="contact-information-wrapper">
    <div v-if="hasExpanded" class="d-flex justify-content-between align-items-center">
      <h4 class="mb-0" data-testid="contact-information-has-expanded">About this contact</h4>
      <b-link :to="SettingsMap.contact_customization.route"
              class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center">
          <q-tooltip anchor="top middle"
                     self="bottom middle"
                     :offset="[0, 16]">
           Customize contact fields
         </q-tooltip>
        <setting-icon color="#256eff"
                      width="16"
                      height="16"
                      class="search-icon" />
      </b-link>
    </div>

    <div :class="`information-container ${autoHeightClass}`" :style="maxHeightStyle">
      <!-- Dynamic field rendering based on user settings -->
      <div
        v-for="(field, index) in renderableFields"
        :key="field.key"
        class="w-100"
        :class="{ 'mt-2': index === 0 }"
      >
          <p class="text-muted custom-input-label mb-0">{{ field.label }}</p>

          <!-- User Selector -->
          <user-selector
            v-if="field.component === 'user-selector'"
            v-bind="getFieldProps(field)"
            :disable="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @change="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Contact Disposition Selector -->
          <contact-disposition-selector
            v-else-if="field.component === 'contact-disposition-selector'"
            v-bind="getFieldProps(field)"
            :disable="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @change="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Contact Input Field -->
          <contact-input-field
            v-else-if="field.component === 'contact-input-field'"
            v-bind="getFieldProps(field)"
            :disabled="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @updateField="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Location State Selector -->
          <location-state-selector
            v-else-if="field.component === 'location-state-selector'"
            v-bind="getFieldProps(field)"
            :disabled="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @select="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Location Country Selector -->
          <location-country-selector
            v-else-if="field.component === 'location-country-selector'"
            v-bind="getFieldProps(field)"
            :disabled="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @select="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Timezone Selector -->
          <q-timezone-selector
            v-else-if="field.component === 'q-timezone-selector'"
            v-bind="getFieldProps(field)"
            :disabled="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @select="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Date Picker Selector -->
          <date-picker-selector
            v-else-if="field.component === 'date-picker-selector'"
            v-bind="getFieldProps(field)"
            :can-edit="!isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @change="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Lead Source Selector -->
          <lead-source-selector
            v-else-if="field.component === 'lead-source-selector'"
            v-bind="getFieldProps(field)"
            :disable="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @change="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Line Selector -->
          <line-selector
            v-else-if="field.component === 'line-selector'"
            v-bind="getFieldProps(field)"
            :is-read-only="isFieldDisabled(field)"
            v-model="contact[field.dataField]"
            :data-testid="getFieldTestId(field)"
            @change="(eventPayload) => onUpdateFields(eventPayload, field.dataField)"
          />

          <!-- Custom Attributes (individual rendering) -->
          <template v-else-if="field.type === 'custom_attribute'">
            <attribute-type-date-picker
              v-if="field.attributeType === ContactAttributeTypeEnum.DATE_PICKER"
              :attribute="getCustomAttribute(field.attributeId)"
              :disabled="isFieldDisabled(field)"
              :timezone="contact.timezone || ''"
              :data-testid="getFieldTestId(field)"
              @updateField="(eventPayload) => onUpdateCustomAttribute(eventPayload, field.attributeId)"
            />
            <attribute-type-text
              v-else
              :attribute="getCustomAttribute(field.attributeId)"
              :disabled="isFieldDisabled(field)"
              :data-testid="getFieldTestId(field)"
              @updateField="(eventPayload) => onUpdateCustomAttribute(eventPayload, field.attributeId)"
            />
          </template>

          <!-- Display-only fields (readonly text) -->
          <p v-else-if="field.component === 'readonly-text'">
            {{ getFormattedFieldValue(field) }}
          </p>
      </div>
    </div>

    <b-button class="expand-toggle"
              variant="light"
              size="sm"
              pill
              v-if="shouldShowExpandToggle"
              data-testid="contact-information-toggle"
              @click="onExpanded">
      <i class="material-icons icon">{{ expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import { CONTACT_FIELD_DEFINITIONS, ContactFieldsHelper, DEFAULT_FIELD_ORDER } from 'src/constants/contact-fields-definitions'
import LocationStateSelector from 'src/components/contacts/location-state-selector'
import LocationCountrySelector from 'src/components/contacts/location-country-selector'
import ContactInputField from 'src/components/contacts/contact-input-field'
import UserSelector from 'components/generic-selectors/user-selector'
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import QTimezoneSelector from 'components/contacts/q-timezone-selector'
import DatePickerSelector from 'components/generic-selectors/date-picker-selector'
import LineSelector from 'components/generic-selectors/line-selector'
import AttributeTypeText from 'components/contacts/contact-attributes/attribute-types/attribute-type-text'
import AttributeTypeDatePicker from 'components/contacts/contact-attributes/attribute-types/attribute-type-date-picker'
import { ContactAttributeTypeEnum } from 'components/contacts/contact-attributes/enums/contact-attribute-type-enum'
import LeadSourceSelector from 'components/generic-selectors/lead-source-selector.vue'
import SettingIcon from 'components/icons/setting-o-icon'
import SettingsMap from 'components/settings/settings-map'

export default {
  name: 'contact-information',

  mixins: [aclMixin],

  props: {
    firstOutboundCall: {},

    hasExpanded: {
      type: Boolean,
      default: true
    },

    isReadOnly: {
      type: Boolean,
      default: false
    }
  },

  components: {
    AttributeTypeText,
    AttributeTypeDatePicker,
    DatePickerSelector,
    QTimezoneSelector,
    ContactDispositionSelector,
    UserSelector,
    ContactInputField,
    LocationCountrySelector,
    LocationStateSelector,
    LineSelector,
    LeadSourceSelector,
    SettingIcon
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactAttributes']),
    ...mapGetters('auth', ['profile']),

    SettingsMap () {
      return SettingsMap
    },

    autoHeightClass () {
      return this.expanded ? 'auto-height' : 'overflow-hidden'
    },

    shouldShowExpandToggle () {
      const minFieldsToShowToggle = 5
      return this.hasExpanded && this.renderableFieldsCount >= minFieldsToShowToggle
    },

    maxHeightStyle () {
      if (this.expanded) {
        return ''
      }

      const heightPerField = 60
      const maxNotExpandedHeight = 225
      const totalFieldsHeight = this.renderableFieldsCount * heightPerField
      const maxHeight = totalFieldsHeight > maxNotExpandedHeight ? maxNotExpandedHeight : totalFieldsHeight
      return `max-height: ${maxHeight}px;`
    },

    timeOfFirstOutboundCall () {
      if (this.firstOutboundCall) {
        return this.$options.filters.fixFullDateUTCRelative(this.firstOutboundCall.created_at)
      }

      return '--:--'
    },

    timeToFirstOutboundCall () {
      if (this.contact && this.firstOutboundCall) {
        const formatted = this.formatHumanized(window.moment(this.firstOutboundCall.created_at).diff(window.moment(this.contact.created_at)))
        return !formatted ? '--:--' : `After ${formatted}`
      }

      return '--:--'
    },

    expanded () {
      if (this.hasExpanded) {
        return this.isExpanded
      }

      return true
    },

    visibleFields () {
      const selectedFields = this.profile.setting_contact_fields || DEFAULT_FIELD_ORDER
      return selectedFields.map(fieldKey => {
        // Handle custom attributes
        if (fieldKey.startsWith('custom_attribute_')) {
          const attributeIdStr = fieldKey.replace('custom_attribute_', '')
          const attributeId = parseInt(attributeIdStr)

          // Validate the parsed attribute ID
          if (isNaN(attributeId) || !attributeIdStr) {
            return null
          }

          // Find attribute - handle both id and attribute_id properties
          const attribute = this.contactAttributes.find(attr =>
            attr.id === attributeId || attr.attribute_id === attributeId
          )

          if (!attribute) {
            return null
          }

          // Normalize attribute structure for createCustomAttributeDefinition
          const normalizedAttribute = {
            ...attribute,
            id: attribute.id || attribute.attribute_id,
            name: attribute.name,
            type: attribute.type
          }

          return ContactFieldsHelper.createCustomAttributeDefinition(normalizedAttribute)
        }

        // Handle standard fields
        return CONTACT_FIELD_DEFINITIONS[fieldKey] || null
      }).filter(field => field !== null)
    },

    renderableFields () {
      return this.visibleFields.filter(field => this.shouldShowField(field))
    },

    renderableFieldsCount () {
      return this.renderableFields.length
    }
  },

  data () {
    return {
      isExpanded: false,
      attributes: [],
      ContactAttributeTypeEnum: ContactAttributeTypeEnum
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactAttributes', 'setContact', 'updateChangedContactProperties', 'updateChangedContactAttributes']),

    onExpanded () {
      this.isExpanded = !this.isExpanded
    },

    getAttributes () {
      talk2Api.V1.contact.getAttributes(this.contact.id)
        .then(response => {
          this.setContactAttributes(response.data)
        })
    },

    onUpdateFields (value, prop) {
      this.contact[prop] = value
      this.updateChangedContactProperties({
        name: prop,
        value: value
      })
    },

    /**
     * Formats provided period(moment.diff) into human readable format
     *
     * @param period
     *
     * @return string
     */
    formatHumanized (period) {
      if (period === 0) {
        return '0 second'
      }

      const segments = []
      const duration = window.moment.duration(period)

      // return nothing when the duration is falsy or not correctly parsed (P0D)
      if (duration.toISOString() === 'P0D' || !duration.isValid()) {
        return ''
      }

      // for duration's year value
      if (duration.years() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'years', 'year'))
      }

      // for duration's month value
      if (duration.months() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'months', 'month'))
      }

      // for duration's days value
      if (duration.days() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'days', 'day'))
      }

      // for duration's hours value
      if (duration.hours() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'hours', 'hour'))
      }

      // for duration's minutes value
      if (duration.minutes() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'minutes', 'minute'))
      }

      // for duration's seconds value, this will only pass if segments is empty
      if (duration.seconds() >= 1 && !segments.length) {
        segments.push(this.computeAndHumanize(duration, 'seconds', 'second'))
      }

      // sanity test, if there are items added to the segment
      if (!segments.length) {
        return ''
      }

      // do formatting
      // eslint-disable-next-line no-return-assign
      return segments.reduce((acc, cur, index) => acc += acc ? `${index === segments.length - 1 ? ' and' : ','} ${cur}` : cur, '')
    },

    /**
     * Converts the duration value and humanize result
     *
     * @param duration
     * @param field
     * @param singular
     *
     * @return string
     */
    computeAndHumanize (duration, field, singular) {
      const temp = Math.floor(duration[field]())

      return `${temp} ${temp > 1 ? field : singular}`
    },

    /**
     * Get field value from contact data
     */
    getFieldValue (field) {
      if (field.computed) {
        // Handle computed fields
        switch (field.key) {
          case 'time_of_first_outbound_call':
            return this.timeOfFirstOutboundCall
          case 'time_to_first_outbound_call':
            return this.timeToFirstOutboundCall
          default:
            return this.contact[field.dataField]
        }
      }
      return this.contact[field.dataField]
    },

    /**
     * Check if field should be visible based on permissions and conditions
     */
    shouldShowField (field) {
      // Check permissions
      if (field.permissions && field.permissions.length > 0) {
        if (!field.permissions.some(permission => this.hasPermissionTo(permission))) {
          return false
        }
      }

      // Check conditions
      if (field.condition && typeof field.condition === 'function') {
        return field.condition(this.contact)
      }

      return true
    },

    /**
     * Check if field is disabled for editing
     */
    isFieldDisabled (field) {
      if (field.type === 'display_only') {
        return true
      }

      if (field.editPermissions && field.editPermissions.length > 0) {
        // Special case for admin permission
        if (field.editPermissions.includes('admin')) {
          return !this.isAdmin || this.isReadOnly
        }

        return !field.editPermissions.some(permission => this.hasPermissionTo(permission)) || this.isReadOnly
      }

      return this.isReadOnly
    },

    /**
     * Get component props for a field
     */
    getFieldProps (field) {
      const props = { ...field.props }

      // Handle dynamic props
      Object.keys(props).forEach(key => {
        if (typeof props[key] === 'function') {
          props[key] = props[key](this.contact)
        }
      })

      return props
    },

    /**
     * Get test id for a field
     */
    getFieldTestId (field) {
      return `contact-information-${field.key.replace(/_/g, '-')}-${field.component.includes('selector') ? 'selector' : 'input'}`
    },

    /**
     * Get formatted field value with appropriate filter
     */
    getFormattedFieldValue (field) {
      const value = this.getFieldValue(field)

      if (field.filter && this.$options.filters[field.filter]) {
        return this.$options.filters[field.filter](value)
      }

      return value
    },

    /**
     * Get custom attribute by ID
     */
    getCustomAttribute (attributeId) {
      if (!attributeId || isNaN(attributeId)) {
        return {}
      }

      const attribute = this.contactAttributes.find(attr =>
        attr.id === attributeId || attr.attribute_id === attributeId
      )

      return attribute || {}
    },

    /**
     * Handle custom attribute updates
     */
    onUpdateCustomAttribute (value, attributeId) {
      if (!attributeId || isNaN(attributeId)) {
        return
      }

      const attribute = this.getCustomAttribute(attributeId)

      if (!attribute || !attribute.name) {
        return
      }

      this.updateChangedContactAttributes({
        name: attribute.name,
        value: value
      })
    }
  }
}
</script>
