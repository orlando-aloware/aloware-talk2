<template>
  <q-card
    class="bg-grey-1"
    :disabled="sessionLoader"
    flat>
    <div class="pb-2">
      <ContactPhones />
    </div>
    <div class="pb-2">
      <ContactTags :contact="contact" />
    </div>
    <div class="pb-2">
      <ContactNotes :contact="contact"
                    @input="onNotesInput" />
    </div>
  </q-card>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import ContactPhones from 'components/contacts/contact-phones'
import ContactTags from 'components/generic-selectors/contact-tags'
import ContactNotes from 'components/contacts/contact-notes'

export default {
  name: 'DetailsTools',

  components: {
    ContactPhones,
    ContactTags,
    ContactNotes
  },

  computed: {
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    ...mapGetters('contacts', [
      'contact'
    ])
  },
  methods: {
    ...mapActions('contacts', [
      'updateChangedContactProperties'
    ]),

    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    }
  }
}
</script>
