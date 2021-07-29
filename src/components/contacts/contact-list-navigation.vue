<template>
  <b-button-toolbar class="btn-contact-list-navigation" key-nav>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="changingSelectedContact || !prevContact"
                @click="onPrevContact">
        <i class="material-icons">keyboard_arrow_left</i>
      </b-button>
    </b-button-group>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="changingSelectedContact || !nextContact"
                @click="onNextContact">
        <i class="material-icons">keyboard_arrow_right</i>
      </b-button>
    </b-button-group>
  </b-button-toolbar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-list-navigation',
  computed: {
    ...mapGetters('contacts', [
      'selectedList',
      'listItems',
      'contact',
      'changingSelectedContact'
    ]),
    contacts () {
      return this.listItems[this.selectedList.id].data
    },
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
    }
  },
  methods: {
    onPrevContact () {
      this.navigate(this.prevContact)
    },
    onNextContact () {
      this.navigate(this.nextContact)
    },
    navigate (contact) {
      this.$router.push({
        name: 'Contact',
        params: { id: JSON.stringify(contact.id) }
      })
    }
  }
}
</script>

<style scoped>

</style>
