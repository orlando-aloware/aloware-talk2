<template>
  <q-btn
    :to="contactUrl"
    color="primary"
    data-testid="contact-info-redirect-link"
    dense
    flat
    round
    size="md"
    class="text-decoration-none"
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
    ...mapState(['isMobile']),

    contactUrl () {
      return this.contact?.id ? `/contacts/${this.contact.id}` : '#'
    }
  }
}
</script>
