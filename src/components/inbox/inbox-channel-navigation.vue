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
  name: 'inbox-channel-navigation',

  computed: {
    ...mapState('inbox', ['communications', 'hasMoreCommunications', 'selectedCommunication']),
    ...mapGetters('contacts', [
      'contact',
      'changingSelectedContact'
    ]),
    currentIndex () {
      if (!this.selectedCommunication) {
        return 0
      }
      return this.communications.findIndex(item => item.id === this.selectedCommunication.id)
    },
    lastIndex () {
      return this.communications.length - 1
    },
    previousItem () {
      let index = this.currentIndex - 1
      return this.currentIndex !== 0 ? this.communications[index] : null
    },
    nextItem () {
      let index = this.currentIndex + 1
      return this.currentIndex !== this.lastIndex ? this.communications[index] : null
    },
    disablePreviousButton () {
      return this.changingSelectedContact || !this.previousItem
    },
    disableNextButton () {
      return this.changingSelectedContact || (!this.nextItem && !this.hasMoreCommunications)
    }
  },
  methods: {
    onPreviousItem () {
      // this.navigate(this.previousItem)
      window.VueEvent.fire('navigate_channel', this.previousItem)
    },
    onNextItem () {
      if (this.currentIndex === this.lastIndex) {
        window.VueEvent.fire('load_and_navigate_channel', this.currentIndex)
      } else {
        window.VueEvent.fire('navigate_channel', this.nextItem)
      }
    }
  }
}
</script>

<style scoped>

</style>
