<template>
  <div>
    <q-select class="inline-select"
              use-input
              input-debounce="0"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              behavior="menu"
              v-model="contact.disposition_status_id"
              :options="options"
              :loading="is_busy"
              @filter="filterFn"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import * as Roles from 'src/constants/roles'
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-disposition',
  computed: {
    ...mapState(['disposition_statuses', 'currentCompany']),
    ...mapGetters('contacts', ['contact']),
    isCompanyAgent () {
      return this.hasRole(Roles.COMPANY_AGENT)
    },
    sortedStatusDispositions () {
      if (this.disposition_statuses) {
        let dispositionStatuses = _.clone(this.disposition_statuses)
          .sort((a, b) => {
            let textA = a.name.toUpperCase()
            let textB = b.name.toUpperCase()
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          })

        // if company == 550 (GoSite), user is an agent,
        // exclude 'uncalled' and 'skipped' in the contact dispositions.
        if (this.currentCompany.id === 550 && this.isCompanyAgent) {
          dispositionStatuses = dispositionStatuses.filter(
            dispositionStatuses => ![10659, 11951].includes(dispositionStatuses.id)
          )
        }

        return dispositionStatuses
      }
      return []
    }
  },
  data () {
    return {
      is_busy: false,
      options: [],
      Roles
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.sortedStatusDispositions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        console.log(val)
        this.options = this.sortedStatusDispositions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    onDispose () {
      this.is_busy = true
      talk2Api.V1.contact.dispose(this.contact.id, { 'disposition_status': this.contact.disposition_status_id }).then(response => {
        this.setContact(response.data)
      }).finally(() => {
        this.is_busy = false
      })
    }
  },
  watch: {
    'contact.disposition_status_id': function () {
      this.onDispose()
    }
  },
  mounted () {
    this.options = this.sortedStatusDispositions
  }
}
</script>

<style scoped>

</style>
