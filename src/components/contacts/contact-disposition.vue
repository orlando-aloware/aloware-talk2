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
              :loading="isBusy"
              :disable="disabled"
              @filter="filterFn"/>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as Roles from 'src/constants/roles'
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-disposition',
  mixins: [aclMixin],
  props: {
    disabled: {
      required: false,
      default: false,
      type: Boolean
    }
  },
  computed: {
    ...mapState(['dispositionStatuses', 'currentCompany']),
    ...mapGetters('contacts', ['contact']),
    isCompanyAgent () {
      return this.hasRole(Roles.COMPANY_AGENT)
    },
    sortedStatusDispositions () {
      if (this.dispositionStatuses) {
        let dispositionStatuses = _.clone(this.dispositionStatuses)
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
      isBusy: false,
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
        this.options = this.sortedStatusDispositions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    onDispose () {
      this.isBusy = true
      talk2Api.V1.contact.dispose(this.contact.id, { 'disposition_status': this.contact.disposition_status_id }).then(response => {
        this.setContact(response.data)
      }).finally(() => {
        this.isBusy = false
      })
    },
    ...mapActions('contacts', ['setContact'])
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
