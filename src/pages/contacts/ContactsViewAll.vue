<template>
  <contacts-view :id="this.id" :name="name" :type="String(type)"/>
</template>

<script>
import ContactsView from './ContactsView.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    ContactsView
  },
  data () {
    return {
      name: 'All Contacts',
      type: 2
    }
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems']),
    id () {
      if (this.$route.params.id) {
        return this.$route.params.id
      }
      return 'all'
    }

  },
  methods: {
    ...mapActions('contacts', ['setSelectedList']),
    setData (id) {
      const list = this.lists[id] || {}
      this.name = list.name
      this.type = list.type
    }
  },
  watch: {
    '$route.params.id': function (id) {
      this.setData(id)
    }
  },
  mounted () {
    this.setData(this.id)
    this.setSelectedList({ id: this.id, name: this.name, type: this.type })
  }
}
</script>
