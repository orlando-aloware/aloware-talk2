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
              data-testid="contact-disposition-select"
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
    ...mapState(['dispositionStatuses']),
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('contacts', ['contact']),

    isCompanyAgent () {
      return this.hasRole(Roles.COMPANY_AGENT)
    },

    sortedStatusDispositions () {
      if (this.dispositionStatuses) {
        const dispositionStatuses = _.clone(this.dispositionStatuses)
          .sort((a, b) => {
            const textA = a.name.toUpperCase()
            const textB = b.name.toUpperCase()
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          })

        // if company == 550 (GoSite), user is an agent,
        // exclude 'uncalled' and 'skipped' in the contact dispositions.
        if (this.currentCompany.id === 550 && this.isCompanyAgent) {
          return dispositionStatuses.filter(
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

  mounted () {
    this.options = this.sortedStatusDispositions
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

    ...mapActions('contacts', ['setContact'])
  },

  watch: {
    'contact.disposition_status_id': function () {
      if (this.contact && this.contact.id) {
        this.$emit('select', this.contact.disposition_status_id)
      }
    }
  }
}
</script>
