<template>
  <b-button-toolbar class="btn-inbox-list-navigation" key-nav>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disablePreviousButton"
                @click="onPrevContact">
        <i class="material-icons">keyboard_arrow_left</i>
      </b-button>
    </b-button-group>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disableNextButton"
                @click="onNextContact">
        <i class="material-icons">keyboard_arrow_right</i>
      </b-button>
    </b-button-group>
  </b-button-toolbar>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { inboxMixin } from 'src/plugins/mixins'

export default {
  name: 'inbox-list-navigation',

  mixins: [inboxMixin],

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
    prevContact () {
      let index = this.currentIndex - 1
      return this.currentIndex !== 0 ? this.contacts[index] : null
    },
    nextContact () {
      let index = this.currentIndex + 1
      return this.currentIndex !== this.lastIndex ? this.contacts[index] : null
    },
    disablePreviousButton () {
      return this.changingSelectedContact || !this.prevContact
    },
    disableNextButton () {
      return this.changingSelectedContact || (!this.nextContact && !this.hasMoreContacts)
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    ...mapActions('inbox', ['setSelectedContact']),
    onPrevContact () {
      this.setSelectedContact(this.prevContact)
      this.navigate(this.prevContact)
    },
    onNextContact () {
      if (this.currentIndex === this.lastIndex) {
        this.page = this.nextPage
        this.loadMoreContactTasks().then(() => {
          this.setSelectedContact(this.nextContact)
          this.navigate(this.nextContact)
        })
      } else {
        this.setSelectedContact(this.nextContact)
        this.navigate(this.nextContact)
      }
    },
    navigate (contact) {
      this.$router.push({
        name: 'Inbox Contact Task',
        params: { id: JSON.stringify(contact.id) }
      })
    }
  }
}
</script>

<style scoped>

</style>
