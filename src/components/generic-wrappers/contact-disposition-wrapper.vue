<template>
  <contact-disposition-selector v-model="dispositionStatusId"
                                @change="changeContactDisposition">
  </contact-disposition-selector>
</template>

<script>
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'

export default {
  name: 'contact-disposition-wrapper',

  components: { ContactDispositionSelector },

  props: {
    contact: {
      required: true
    }
  },

  data () {
    return {
      loadingContactDisposition: false,
      dispositionStatusId: null
    }
  },

  mounted () {
    this.dispositionStatusId = this.contact.disposition_status_id
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
        this.$VueEvent.fire('contact_disposed', dispositionStatusId)
        this.$generalNotification('Contact disposed')
      }).catch((err) => {
        this.loadingContactDisposition = false
        console.log(err)
      })
    }
  }
}
</script>
