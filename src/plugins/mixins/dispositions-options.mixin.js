import { mapGetters, mapState } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  data () {
    return {
      selectedId: this.value,
      selectedContactDisposition: null,
      selectedCallDisposition: null,
      type: null
    }
  },

  computed: {
    ...mapGetters('powerDialer', [
      'sessionSettings'
    ]),

    ...mapState([
      'callDispositions',
      'dispositionStatuses'
    ]),

    orderedDispositions () {
      if (this.type) {
        return this.getOrderedDispositions(this.type)
      }

      return []
    },

    contactDisposition () {
      return this.selectedContactDisposition || this.contact?.disposition_status_id
    },

    callDisposition () {
      return this.selectedCallDisposition || this.dialer?.communication?.call_disposition_id
    },

    filteredCallDispositions () {
      return this.getOrderedDispositions('call')
    },

    filteredContactDispositions () {
      return this.getOrderedDispositions('contact')
    }
  },

  methods: {
    getOrderedDispositions (type) {
      let dispositions = []
      let idProperty = null

      switch (type) {
        case 'call':
          idProperty = 'call_disposition_ids'
          dispositions = this.callDispositions
          break
        case 'contact':
          idProperty = 'contact_disposition_ids'
          dispositions = this.dispositionStatuses
          break
      }

      if (isEmpty(dispositions)) {
        return dispositions
      }

      let orderedOptions = this.$jsonClone(dispositions)
      const isInPowerDialerSession = this.$route?.meta?.id === 'power-dialer-session'
      const selectedIdvariableName = isInPowerDialerSession && this.type
        ? 'selectedId'
        : `${type}Disposition`
      let selectedOptionId = this[selectedIdvariableName]

      if (!this.multiple) {
        selectedOptionId = [selectedOptionId]
      }

      if (isInPowerDialerSession && this.sessionSettings[idProperty] &&
        this.sessionSettings[idProperty].length > 0) {
        let sessionSettingsOptionIds = this.$jsonClone(this.sessionSettings[idProperty])

        // if disposition is selected and doesn't exist in the options,
        // add it temporarily
        if (!isEmpty(selectedOptionId)) {
          sessionSettingsOptionIds = [...new Set(sessionSettingsOptionIds.concat(selectedOptionId))]
        }

        orderedOptions = dispositions.filter(disposition => {
          return sessionSettingsOptionIds.includes(disposition.id)
        })
      }

      return this.$alphabeticalSort(orderedOptions)
    }
  },

  watch: {
    orderedDispositions () {
      const referenceName = `${this.type}DispositionSelect`

      // clear search (filter) when disposition's options are updated
      if (this.useInput && this.$refs[referenceName]) {
        this.$refs[referenceName].updateInputValue('')
      }

      this.options = this.orderedDispositions
    }
  }
}
