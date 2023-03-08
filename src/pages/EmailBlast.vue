<template>
  <div class="row w-100">
    <div class="messenger-container w-100 vh-100">
      <router-link class="p-1"
                   tag="a"
                   :to="{ name: 'Contact', params: { contact_id: id } }"
                   v-if="id">
        <i class="fa fa-arrow-left"></i>
        Return to contact
      </router-link>
      <iframe frameborder="0"
              class="w-100 h-100"
              :src="source"
              v-if="!loading">
      </iframe>
    </div>
  </div>
</template>

<script>
import { resellerMixin } from 'src/plugins/mixins'

export default {
  name: 'EmailBlast',

  props: {
    contactId: {
      type: Number,
      default: null
    }
  },

  mixins: [ resellerMixin ],

  data () {
    return {
      id: null
    }
  },

  created () {
    this.id = this.$route.params.id

    if (this.contactId !== null) {
      this.id = this.contactId
    }

    this.getIntegration('email-blast', {
      contactId: this.id
    })
  }
}
</script>
