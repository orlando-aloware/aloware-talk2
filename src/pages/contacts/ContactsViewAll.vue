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

  mounted () {
    this.setData(this.id)
    this.setSelectedList({ id: this.id, name: this.name, type: this.type })
  },

  methods: {
    ...mapActions('contacts', ['setSelectedList']),

    setData (id) {
      const list = this.lists[id] || {}
      if (Object.values(list).length > 0) {
        this.name = list.name
        this.type = list.type
        this.setSelectedList({ id: this.id, name: this.name, type: this.type })
      }
    }
  },

  watch: {
    '$route.params.id': function (id) {
      if (!id && this.$route.name === 'Contacts') {
        id = 'all'
      }
      if (id && this.$route.name === 'Contacts') {
        this.setData(id)
      }
    }
  }
}
</script>
