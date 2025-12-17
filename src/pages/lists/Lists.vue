<template>
  <lists-table />
</template>

<script>
import ListsTable from 'src/components/lists/lists-table'
import { mapState, mapActions } from 'vuex'
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
    ...mapState('cache', ['currentCompany'])
  },

  destroyed () {
    this.resetLists()
  },

  methods: {
    ...mapActions('listsModule', ['resetLists'])
  }
}
</script>
