<template>
  <q-card
    flat
    :disabled="sessionLoader"
    class="bg-grey-1">
    <div class="pb-2">
      <ContactPhones />
    </div>
    <div class="pb-2">
      <ContactTags :contact="contact" />
    </div>
    <div class="pb-2">
      <ContactNotes :contact="contact" />
    </div>
  </q-card>
</template>

<script>

import { mapGetters } from 'vuex'
import ContactPhones from 'components/contacts/contact-phones'
import ContactTags from 'components/generic-selectors/contact-tags'
import ContactNotes from 'components/contacts/contact-notes'

export default {
  name: 'DetailsTools',
  computed: {
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),
    ...mapGetters('contacts', [
      'contact'
    ])
  },
  components: {
    ContactPhones,
    ContactTags,
    ContactNotes
  }
}
</script>
