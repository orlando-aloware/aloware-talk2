<template>
  <div class="inbox-mid border-left-0 border-top-0" :class="{'inbox-mid--show': showingMid}">
    <contact-activities class="flex-grow-1 w-auto"
                        ref="contactActivities"
                        :communications="filteredCommunications"
                        :campaignId="selectedCampaignId"
                        v-if="selectedContactId !== null">
    </contact-activities>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContactActivities from 'components/contacts/contact-activities'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import contactMixins from 'src/plugins/mixins/contact.mixin'

export default {
  name: 'inbox-mid.vue',
  mixins: [contactsMixins, contactMixins],
  components: { ContactActivities },
  props: {
    contactInfoOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showMessage: false,
      showingMid: false
    }
  },
  computed: {
    ...mapState('inbox', ['selectedContactId'])
  },
  created () {
    this.contactId = this.selectedContactId
    if (this.selectedContactId) {
      this.processFetchContactInfo()
    }
  },
  mounted () {
    this.$VueEvent.listen('show_message', this.toggle)
    this.$VueEvent.listen('make_call', this.showMid)
  },
  methods: {
    toggle () {
      this.showMessage = !this.showMessage
      console.log(this.showMessage)
    },
    showMid () {
      this.showingMid = true
    },
    getContact (id) {
      this.selectedContactChanging(true)
      return this.fetchContactInfo(id).then(response => {
        this.setContact(response.data)
        this.selectedContactChanging(false)
        this.$refs.contactActivities.scrollMessages()
      })
    }
  },
  watch: {
    selectedContactId: function () {
      if (this.selectedContactId) {
        this.getContact(this.selectedContactId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-mid {
  background-color: $white;
  border: solid 1px $grey-light3;
  display: none;
  position: relative;
  overflow: hidden;
  flex-grow: 1;

  &--show {
    @include screen-max('sm') {
      position: absolute;
      display: flex;
      z-index: 1000;
      width: 100%;
      height: 100%;
    }
  }

  @include screen('md') {
    display: flex;
  }
}
</style>
