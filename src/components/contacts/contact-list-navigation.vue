<template>
  <b-button-toolbar data-testid="contact-list-navigation-btn-toolbar" class="btn-contact-list-navigation" key-nav>
    <b-button-group class="mx-1" data-testid="contact-list-navigation-btn-group">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disabledPrev"
                data-testid="contact-list-navigation-btn-prev"
                @click.prevent="onPrevContact">
        <i class="material-icons">keyboard_arrow_left</i>
      </b-button>
    </b-button-group>
    <b-button-group class="mx-1">
      <b-button size="sm"
                variant="light"
                class="btn-white btn-contact-prev-next"
                :disabled="disabledNext"
                data-testid="contact-list-navigation-btn-next"
                @click.prevent="onNextContact">
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
      'changingSelectedContact'
    ]),
    currentId () {
      return this.$route.params.id
    },
    currentIndex () {
      return this.contacts.findIndex(item => String(item.id) === String(this.$route.params.id))
    },
    lastIndex () {
      return this.contacts.length - 1
    },
    prevContact () {
      return this.currentIndex !== 0 ? this.contacts[(this.currentIndex - 1)] : null
    },
    nextContact () {
      return this.currentIndex !== this.lastIndex ? this.contacts[(this.currentIndex + 1)] : null
    },
    disabledPrev () {
      return this.changingSelectedContact || !this.prevContact
    },
    disabledNext () {
      return this.changingSelectedContact || !this.nextContact
    }
  },

  data () {
    return {
      contacts: []
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
  },

  mounted () {
    this.$VueEvent.listen('contactsListSidebarDataLoaded', (data) => {
      this.contacts = data
    })
  }
}
</script>
