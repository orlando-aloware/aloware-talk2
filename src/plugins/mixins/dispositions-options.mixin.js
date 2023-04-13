import { mapGetters, mapState } from 'vuex'
import { clone } from 'lodash'

export default {
  data () {
    return {
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
      let dispositions = null
      let idProperty = null

      switch (this.type) {
        case 'call':
          idProperty = 'call_disposition_ids'
          dispositions = this.callDispositions
          break
        case 'contact':
          idProperty = 'contact_disposition_ids'
          dispositions = this.dispositionStatuses
          break
      }

      if (this.$route.meta.id === 'power-dialer-session' && dispositions &&
        this.sessionSettings[idProperty] && this.sessionSettings[idProperty].length > 0) {
        return dispositions.filter(disposition => {
          return this.sessionSettings[idProperty].includes(disposition.id)
        })
      }

      if (dispositions) {
        return clone(dispositions).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    filteredCallDispositions () {
      if (this.sessionSettings.call_disposition_ids &&
        this.sessionSettings.call_disposition_ids.length > 0) {
        return this.callDispositions.filter(d => {
          return this.sessionSettings.call_disposition_ids.includes(d.id)
        })
      }

      return this.callDispositions
    },

    filteredContactDispositions () {
      if (this.sessionSettings.contact_disposition_ids &&
        this.sessionSettings.contact_disposition_ids.length > 0) {
        return this.dispositionStatuses.filter(d => {
          return this.sessionSettings.contact_disposition_ids.includes(d.id)
        })
      }

      return this.dispositionStatuses
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
