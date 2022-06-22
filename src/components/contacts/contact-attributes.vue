<template>
  <div>
    <div class="d-block"
         v-for="attribute in attributes"
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
import talk2Api from 'src/plugins/api/api'
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
    },

    getAttributes () {
      return talk2Api.V1.contact.getAttributes(this.contact.id)
        .then(response => {
          this.attributes = response.data
          this.setContactAttributes(_.cloneDeep(response.data))
        })
    }
  },

  mounted () {
    this.getAttributes()

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
    'contact.id': function () {
      this.getAttributes()
    }
  }
}
</script>
