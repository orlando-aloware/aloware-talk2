<template>
  <div class="h-100 w-100">
    <div v-for="attribute in attributes"
         :key="attribute.id">
      <p class="text-muted custom-input-label mb-0">{{ attribute.name }}</p>
      <contact-input-field v-model="attribute.value"
                           :disabled="!hasPermissionTo('update contact')"
                           @updateField="(eventPayload) => onUpdateFields(eventPayload, attribute.name)">
      </contact-input-field>
    </div>
  </div>
</template>

<script>
import ContactInputField from 'components/contacts/contact-input-field'
import { mapActions, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import _ from 'lodash'

export default {
  name: 'contact-attributes',
  mixins: [aclMixin],
  components: { ContactInputField },

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
      attributes: []
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
