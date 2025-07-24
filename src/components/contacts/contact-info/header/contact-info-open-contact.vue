<template>
  <q-btn
    color="primary"
    data-testid="contact-info-redirect-link"
    dense
    flat
    round
    size="md"
    @click="navigateToContact"
  >
    <q-tooltip
      v-if="!isMobile"
      anchor="top middle"
      content-class="fs-12"
      self="center middle"
    >
      View Contact Details
    </q-tooltip>
    <open-in-new-icon
      :size="20"
      data-testid="contact-info-redirect-icon"
    />
  </q-btn>
</template>

<script>
import { mapState } from 'vuex'
import OpenInNewIcon from 'src/components/icons/open-in-new-icon.vue'

export default {
  name: 'contact-info-open-contact',
  components: {
    OpenInNewIcon
  },
  props: {
    contact: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(['isMobile'])
  },
  methods: {
    navigateToContact () {
      if (this.contact?.id) {
        this.$router.push(`/contacts/${this.contact.id}`)
      }
    }
  }
}
</script>
