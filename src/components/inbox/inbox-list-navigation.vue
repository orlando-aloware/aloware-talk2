<template>
  <b-button-toolbar class="btn-inbox-list-navigation" key-nav>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disablePreviousButton"
                @click="onPreviousItem">
        <i class="material-icons">keyboard_arrow_left</i>
      </b-button>
    </b-button-group>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disableNextButton"
                @click="onNextItem">
        <i class="material-icons">keyboard_arrow_right</i>
      </b-button>
    </b-button-group>
  </b-button-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'inbox-list-navigation',

  computed: {
    ...mapState('inbox', ['contacts', 'hasMoreContacts']),
    ...mapGetters('contacts', [
      'contact',
      'changingSelectedContact'
    ]),
    currentIndex () {
      return this.contacts.findIndex(item => item.id === this.contact.id)
    },
    lastIndex () {
      return this.contacts.length - 1
    },
    previousItem () {
      let index = this.currentIndex - 1
      return this.currentIndex !== 0 ? this.contacts[index] : null
    },
    nextItem () {
      let index = this.currentIndex + 1
      return this.currentIndex !== this.lastIndex ? this.contacts[index] : null
    },
    disablePreviousButton () {
      return this.changingSelectedContact || !this.previousItem
    },
    disableNextButton () {
      return this.changingSelectedContact || (!this.nextItem && !this.hasMoreContacts)
    }
  },
  methods: {
    onPreviousItem () {
      window.VueEvent.fire('navigate_task_tab', this.previousItem)
    },
    onNextItem () {
      if (this.currentIndex === this.lastIndex) {
        window.VueEvent.fire('load_and_navigate_inbox_tab', this.currentIndex)
      } else {
        window.VueEvent.fire('navigate_task_tab', this.nextItem)
      }
    }
  }
}
</script>
