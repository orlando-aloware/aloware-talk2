<template>
  <contacts-view :id="id" :name="name" :type="String(type)"/>
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
      id: 'all',
      name: 'All Contacts',
      type: 2
    }
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems'])
  },
  methods: {
    ...mapActions('contacts', ['setSelectedList']),
    setData (id) {
      if (!id) { return }
      const list = this.lists[id]
      this.id = id
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
    this.setData(this.$route.params.id)
    this.setSelectedList({ id: this.id, name: this.name, 'type': this.type })
  }
}
</script>
