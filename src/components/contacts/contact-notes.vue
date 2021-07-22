<template>
  <b-card class="border-0 contact-notes-wrapper">
    <h4>Notes</h4>
    <div v-if="!isEdit"
         class="notes" @click="onEditNotes" v-html="contact.notes">
    </div>
    <div v-if="(!contact.notes || contact.notes.length < 1) && !isEdit"
         class="notes-empty-placeholder" @click="onEditNotes">Add notes here..</div>
    <div v-if="isEdit"
         style="max-width: 300px" v-on:blur="onBlur">
      <q-input
        ref="notesInput"
        outlined
        autogrow
        debounce="500"
        v-model="contact.notes"
        v-on:blur="onBlur"
      />
    </div>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-notes',
  computed: {
    ...mapGetters('contacts', ['contact']),
    notes () {
      return this.contact.notes
    }
  },
  data () {
    return {
      isEdit: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    onEditNotes () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.notesInput.focus()
      })
    },
    onBlur () {
      this.isEdit = false
      this.onUpdate()
    },
    onUpdate () {
      talk2Api.V1.contact.update(this.contact.id, { notes: this.contact.notes.trim() }).then(response => {
        this.setContact(response.data)
      })
    }
  },
  mounted () {
    this.isEdit = false
  }
}
</script>
