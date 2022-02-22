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
import _ from 'lodash'
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
      return _.get(this.listItems, `${this.selectedList.id}.data`, [])
    },
    currentIndex () {
      return this.contacts.findIndex(item => item.id === this.contact.id)
    },
    lastIndex () {
      return this.contacts.length - 1
    },
    prevContact () {
      return this.currentIndex !== 0 ? this.contacts[(this.currentIndex - 1)] : null
    },
    nextContact () {
      return this.currentIndex !== this.lastIndex ? this.contacts[(this.currentIndex + 1)] : null
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
