<template>
  <contacts-view :id="id" :name="name" :type="String(type)"/>
</template>

<script>
import ContactsView from './ContactsView.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    ContactsView
  },
  data () {
    return {
      id: 'all',
      name: 'All Contacts',
      type: 1
    }
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems'])
  },
  methods: {
    setData (id) {
      if (!id) { return }
      const list = this.lists[id]
      console.log(list, this.listItems[id], id)
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
  }
}
</script>
