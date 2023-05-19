<template>
  <div class="pl-3 d-inline-flex"
       v-if="isShown">
    <b-form-checkbox class="mt-2 cursor-pointer"
                     size="sm"
                     switch
                     :class="{ disabled: !isInboxFiltersLoaded || isGettingTasksList || isFetchingContacts }"
                     :disabled="!isInboxFiltersLoaded || isGettingTasksList || isFetchingContacts"
                     v-model="inboxShowMyContactsFilter">
    </b-form-checkbox>
    <label class="text-primary mt-2 cursor-pointer"
           :class="{ disabled: !isInboxFiltersLoaded || isGettingTasksList || isFetchingContacts }"
           @click="myContactsFilterChange">My Contacts</label>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'

export default {
  name: 'inbox-my-contacts-filter',

  mixins: [
    inboxRoutesMixin
  ],

  computed: {
    ...mapState('inbox', [
      'inboxShowMyContacts',
      'isInboxFiltersLoaded',
      'isGettingTasksList',
      'isFetchingContacts'
    ]),

    isShown () {
      return this.$route.name === 'Inbox' ||
        (this.$route?.meta?.title === 'Communications' &&
          this.$route.params.channel !== 'mentions')
    }
  },

  data () {
    return {
      inboxShowMyContactsFilter: false
    }
  },

  created () {
    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
  },

  methods: {
    myContactsFilterChange () {
      if (!this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts) {
        return
      }

      this.inboxShowMyContactsFilter = !this.inboxShowMyContactsFilter
    },

    onMyContactsChange () {
      this.setInboxShowMyContacts(this.inboxShowMyContactsFilter)

      if (this.inboxTaskRoutes.includes(this.$route.name)) {
        this.$VueEvent.fire('inbox_load_contacts', this.inboxShowMyContactsFilter)
        return
      }

      // for inbox channels
      this.$VueEvent.fire('inbox_load_communications', this.inboxShowMyContactsFilter)
    },

    ...mapActions('inbox', [
      'setInboxShowMyContacts'
    ])
  },

  watch: {
    inboxShowMyContacts (value) {
      if (value !== this.inboxShowMyContactsFilter) {
        this.inboxShowMyContactsFilter = value
      }
    },

    inboxShowMyContactsFilter () {
      this.onMyContactsChange()
    }
  }
}
</script>
