<template>
  <div>
    <inbox-item v-for="contact in contacts"
                :key="contact.id"
                :contact="contact" width="320px" border rounded />
  </div>
</template>

<script>
import _ from 'lodash'
import { aclMixin } from '../../../boot/mixins'
import InboxItem from './inbox-item'
export default {
  name: 'inbox-list',

  mixins: [aclMixin],

  components: {
    InboxItem
  },

  data () {
    return {
      loading: false,
      CancelToken: null,
      source: null,
      pagination: {
        type: Object,
        required: true
      },
      paginationLoading: false,
      pageNumbers: [],
      contacts: []
    }
  },

  created () {
    this.CancelToken = this.$axios.CancelToken
    this.source = this.CancelToken.source()
    this.getContacts()
  },

  methods: {
    getContacts () {
      if (!this.hasPermissionTo('list contact')) {
        return
      }

      this.source.cancel('Operation canceled by the user.')
      this.source = this.CancelToken.source()
      this.loading = true
      this.paginationLoading = true
      let params = this.filter

      return this.$axios.get('/api/v1/contact', {
        params: params,
        cancelToken: this.source.token
      }).then(res => {
        let contacts = []
        for (let contact of res.data.data) {
          contact.tag_ids = contact.tags.map((a) => a.id)
          contacts.push(contact)
        }
        this.contacts = _.union(this.contacts, contacts)
        console.log(this.contacts)
        this.pagination = _.clone(res.data)
        delete this.pagination.data
        this.paginationLoading = false
        this.loading = false

        return Promise.resolve(res)
      }).catch(err => {
        console.log(err)
        if (this.$axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.log(err)
          this.paginationLoading = false
          this.loading = false
        }
        return Promise.reject(err)
      })
    },

    loadMore (index, done) {
      this.filter.page = index
      this.getContacts().then((res) => {
        if (res.data.data.length === 0) {
          done(true)
        } else {
          done()
        }
      }).catch((err) => {
        if (!this.$axios.isCancel(err)) {
          done(true)
        }
      }).finally(() => {
        if (this.$refs.scrollTargetRef) {
          this.$refs.scrollTargetRef.focus()
        }
      })
    },

    refreshContacts () {
      this.getContacts().catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
