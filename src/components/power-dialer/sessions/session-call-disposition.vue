<template>
  <q-card flat :disabled="sessionLoader">
    <div class="t-menu pb-2">
      <div class="t-menu__header no-border t-dense d-flex align-items-center">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          CALL DISPOSITION
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3 pb-1">
        <ChipsEllipsis
          @on-selected-item="onSelectedCallDisposition"
          :list-items="callDispositions"
          :selected-item="{}"
          :display-count="4"
          identity="call-disposition"
          default-label="No Call Dispositions" />
      </div>

      <div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          CONTACT DISPOSITION
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3 pb-1">
        <ChipsEllipsis
          @on-selected-item="onSelectedContactDisposition"
          :list-items="dispositionStatuses"
          :selected-item="contactDisposition"
          :display-count="6"
          identity="contact-disposition"
          default-label="No Contact Dispositions" />
      </div>

      <div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          VOICEMAIL
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3 pb-0">
        <!-- <VmDropSelector /> -->
        <ChipsEllipsis
          @on-selected-item="onSelectedContactDisposition"
          :list-items="[]"
          :selected-item="{}"
          :display-count="6"
          identity="contact-disposition"
          default-label="No Voicemail" />
        <!-- <q-chip
          v-for="chip in voicemail"
          :key="chip.name"
          color="grey-7"
          outline
          square
          :class="`p-0 mx-2 ${chip.outlined ? '' : 'text-blue'}`">
          -{{ chip.label }}
        </q-chip>
        <b-dropdown
          text="..."
          no-caret
          right size="sm"
          variant="white"
          class="m-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <i class="fa fa-ellipsis-h"></i>
          </template>
          <b-dropdown-item href="#">
            Option 101
          </b-dropdown-item>
          <b-dropdown-item href="#">
            Option 201
          </b-dropdown-item>
        </b-dropdown> -->
      </div>

    </div>
  </q-card>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import ChipsEllipsis from 'components/chips-ellipsis'
// import VmDropSelector from 'components/generic-selectors/vm-drop-selector'

export default {
  name: 'SessionCallDisposition',
  components: {
    ChipsEllipsis
    // VmDropSelector
  },
  computed: {
    ...mapState([
      'callDispositions',
      'dispositionStatuses'
    ]),
    ...mapGetters('contacts', [
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),
    contactDisposition () {
      return this.contact_disposition || this.contact.disposition_status
    },
    callDisposition () {
      return null
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'updateContactDisposition',
      'updateCallDisposition'
    ]),
    async onSelectedCallDisposition (data) {
      console.log('Selected Call Dispostion : ', data)
      let response = await this.updateCallDisposition({
        id: this.contact.last_communication.id,
        params: {
          call_disposition_id: data.id
        }
      })
      console.log('response :>> ', response)
    },
    async onSelectedContactDisposition (data) {
      let response = await this.updateContactDisposition({
        id: this.contact.id,
        params: {
          disposition_status: data.id
        }
      })
      if (response?.id) {
        this.contact_disposition = this.dispositionStatuses.find(ds => {
          return ds.id === response.disposition_status_id
        })
      }
    }
  },
  data () {
    return {
      contact_disposition: null,
      voicemail: [
        // { label: 'Default Voicemail' },
        // { label: 'Follw Up VM' }
      ]
    }
  }
}
</script>
