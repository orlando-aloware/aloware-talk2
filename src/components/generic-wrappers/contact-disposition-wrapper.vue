<template>
  <contact-disposition-selector :highlighted="highlighted"
                                :highlighted-class="highlightedClass"
                                :required="required"
                                v-model="dispositionStatusId"
                                @change="changeContactDisposition">
  </contact-disposition-selector>
</template>

<script>
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import { mapState } from 'vuex'

export default {
  name: 'contact-disposition-wrapper',

  components: { ContactDispositionSelector },

  props: {
    contact: {
      required: true
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },

    required: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loadingContactDisposition: false,
      dispositionStatusId: null
    }
  },

  computed: {
    ...mapState(['dialer'])
  },

  mounted () {
    if (this.contact) {
      this.dispositionStatusId = this.contact.disposition_status_id
    }
  },

  methods: {
    changeContactDisposition (dispositionStatusId) {
      this.loadingContactDisposition = true
      this.$axios.post('/api/v1/contact/' + this.contact.id + '/dispose', {
        disposition_status: dispositionStatusId
      }).then((res) => {
        this.loadingContactDisposition = false
        this.dispositionStatusId = dispositionStatusId
        this.$emit('change', dispositionStatusId)
        this.$VueEvent.fire('contact_disposed', res.data)
        this.$generalNotification('Contact disposed')
      }).catch((err) => {
        this.loadingContactDisposition = false
        console.log(err)
        this.$handleErrors(err.response)
        this.$emit('change', dispositionStatusId)
      })
    }
  },

  watch: {
    'contact.disposition_status_id': function (newValue) {
      this.dispositionStatusId = newValue
    }
  }
}
</script>
