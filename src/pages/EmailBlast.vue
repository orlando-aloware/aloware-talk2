<template>
  <div class="row w-100">
    <div class="messenger-container w-100"
         :style="{height: '100vh'}">
      <router-link class="p-1"
                   tag="a"
                   :to="{ name: 'Contact', params: { contact_id: id } }"
                   v-if="id">
        <i class="fa fa-arrow-left"></i>
        Return to contact
      </router-link>
      <iframe frameborder="0"
              class="w-100 h-100"
              v-if="!loading"
              :src="source">
      </iframe>
    </div>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { resellerMixin } from 'src/plugins/mixins'
import { get } from 'lodash'
export default {
  name: 'EmailBlast',

  props: {
    contactId: {
      type: Number,
      required: false,
      default: null
    }
  },

  mixins: [ resellerMixin ],

  data () {
    return {
      source: '',
      loading: false,
      id: null
    }
  },

  created () {
    this.id = this.$route.params.id
    console.log('this.id: ', this.id)
    if (this.contactId !== null) {
      this.id = this.contactId
    }
  },

  mounted () {
    this.getIntegration()
  },

  methods: {
    getIntegration () {
      this.loading = true
      talk2Api.V1.integrations.simpsocial.emailBlast.get()
        .then(res => {
          this.source = this.getUrl(get(res.data, 'source', ''))
          this.loading = false
        })
        .catch(err => {
          console.log(err)
          this.loading = false
          this.$handleErrors(err.response)
        })
    },

    getUrl (baseUrl) {
      if (baseUrl === '') {
        return baseUrl
      }

      let url = new URL(baseUrl)

      if (this.contact_id) {
        url.searchParams.append('contact_id', this.contactId.toString())
      }

      return url.href
    }
  }
}
</script>
