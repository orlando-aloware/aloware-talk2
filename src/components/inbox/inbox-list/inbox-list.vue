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
      cancelToken: null,
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
    this.cancelToken = this.$axios.CancelToken
    this.source = this.cancelToken.source()
    this.getContacts()
  },

  methods: {
    getContacts () {
      if (!this.hasPermissionTo('list contact')) {
        return
      }

      this.source.cancel('Operation canceled by the user.')
      this.source = this.cancelToken.source()
      this.loading = true
      this.paginationLoading = true
      const params = this.filter

      return this.$axios.get('/api/v1/contact', {
        params: params,
        cancelToken: this.source.token
      }).then(res => {
        const contacts = []
        const contact = { data: null }
        for (contact.data of res.data.data) {
          contact.data.tag_ids = contact.data.tags.map((a) => a.id)
          contacts.push(contact.data)
        }
        this.contacts = _.union(this.contacts, contacts)
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
        this.$handleErrors(err.response)
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
        this.$handleErrors(err.response)
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
