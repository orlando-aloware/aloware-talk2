<template>
  <lists-table :title="'Lists'"
               v-if="isDemoCompany"/>
</template>

<script>
import ListsTable from 'src/components/lists/lists-table'
import { mapState } from 'vuex'
import { userMixin } from 'src/plugins/mixins'

export default {
  name: 'Lists',

  mixins: [
    userMixin
  ],

  components: {
    ListsTable
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isDemoCompany () {
      return this.isCompanyPartOfAlowareDemoCompanies(this.currentCompany?.id)
    }
  }
}
</script>
