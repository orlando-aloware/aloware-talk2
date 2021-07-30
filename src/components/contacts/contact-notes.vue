<template>
  <b-card class="border-0 contact-notes-wrapper">
    <h4>Notes</h4>
    <div v-if="!isEdit"
         class="notes mt-1" @click="onEditNotes" v-html="contact.notes">
    </div>
    <div v-if="(!contact.notes || contact.notes.length < 1) && !isEdit"
         class="notes-empty-placeholder" @click="onEditNotes">Add notes here..</div>
    <div v-if="isEdit"
         class="mt-1"
         style="max-width: 300px">
      <contact-notes-input ref="notesInput"
                           v-model="contact.notes"
                           @blur="onBlur">
      </contact-notes-input>
    </div>
  </b-card>
</template>

<script>

import talk2Api from 'src/plugins/api/api'
import ContactNotesInput from 'components/contacts/contact-notes-input'

export default {
  name: 'contact-notes',
  components: { ContactNotesInput },
  props: {
    contact: {
      required: true
    },
    title: {
      required: false,
      default: 'Notes'
    }
  },

  computed: {
    notes () {
      return this.contact.notes
    }
  },

  data () {
    return {
      isEdit: false,
      prevValue: ''
    }
  },

  methods: {
    onEditNotes () {
      this.isEdit = true
    },
    onInput (value) {
      this.$emit('input', value)
    },
    onBlur () {
      this.isEdit = false
      if (this.prevValue !== this.contact.notes) {
        this.onUpdate()
      }
    },
    onUpdate () {
      talk2Api.V1.contact.update(this.contact.id, { notes: (this.contact.notes ? this.contact.notes.trim() : this.contact.notes) }).then(response => {
        this.$emit('update', response.data)
        this.prevValue = this.contact.notes
      })
    }
  },

  mounted () {
    this.isEdit = false
    this.prevValue = this.contact.notes
  }
}
</script>
