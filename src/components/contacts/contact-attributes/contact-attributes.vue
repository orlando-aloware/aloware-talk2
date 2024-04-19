<template>
  <div class="h-100 w-100" data-testid="contact-attributes-wrapper">
    <div v-for="attribute in attributes"
         :key="attribute.id">

      <p class="text-muted custom-input-label mb-0">{{ attribute.name }}</p>

      <!-- if date picker -->
      <attribute-type-date-picker
        v-if="attribute.type === ContactAttributetTypeEnum.DATE_PICKER"
        :attribute="attribute"
        :disabled="!hasPermissionTo('update contact')"
        :timezone="contact.timezone"
        data-testid="contact-attributes-type-date-picker"
        @updateField="(eventPayload) => onUpdateFields(eventPayload, attribute.name)"
      />

      <!-- if any other type -->
      <attribute-type-text
        v-else
        :attribute="attribute"
        :disabled="!hasPermissionTo('update contact')"
        data-testid="contact-attributes-type-text"
        @updateField="(eventPayload) => onUpdateFields(eventPayload, attribute.name)"
      />

    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import _ from 'lodash'
import { ContactAttributeTypeEnum } from 'components/contacts/contact-attributes/enums/contact-attribute-type-enum'
import AttributeTypeText from 'components/contacts/contact-attributes/attribute-types/attribute-type-text'
import AttributeTypeDatePicker from 'components/contacts/contact-attributes/attribute-types/attribute-type-date-picker'

export default {
  name: 'contact-attributes',
  mixins: [aclMixin],
  components: {
    AttributeTypeText,
    AttributeTypeDatePicker
  },

  props: {
    contact: {
      required: true,
      type: Object
    }
  },

  computed: {
    ...mapState('contacts', ['contactAttributes', 'changedContactAttributes'])
  },

  data () {
    return {
      attributes: [],
      ContactAttributetTypeEnum: ContactAttributeTypeEnum
    }
  },

  methods: {
    ...mapActions('contacts', ['updateChangedContactAttributes', 'setContactAttributes']),

    onUpdateFields (value, prop) {
      this.updateChangedContactAttributes({
        name: prop,
        value: value
      })
    }
  },

  mounted () {
    this.attributes = _.cloneDeep(this.contactAttributes)

    this.$VueEvent.listen('cancelContactChanges', () => {
      this.attributes = _.cloneDeep(this.contactAttributes)
    })

    this.$VueEvent.listen('customAttributesUpdated', (contact) => {
      if (this.contact.id === contact.id) {
        // reassign the updated values
        this.setContactAttributes(_.cloneDeep(this.attributes))
      }
    })
  },
  watch: {
    contactAttributes: {
      deep: true,
      handler: function (value) {
        this.attributes = _.cloneDeep(value)
      }
    }
  }
}
</script>
