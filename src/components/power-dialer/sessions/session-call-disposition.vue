<template>
  <q-card
    flat
    style="height: 100%;">
    <div
      v-if="sessionPaused"
      class="text-h6 text-grey-80 full-height fill-width row justify-center items-center">
      Session Paused
    </div>
    <div v-else class="t-menu pb-2">
      <div class="t-menu__header no-border t-dense d-flex align-items-center">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          CALL DISPOSITION
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3">
        <ChipsEllipsis
          @on-selected-item="onSelectedCallDisposition"
          :list-items="filteredCallDispositions"
          :selected-item="callDisposition"
          :display-count="4"
          identity="call-disposition"
          default-label="No Call Dispositions" />
      </div>

      <div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          CONTACT DISPOSITION
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3">
        <ChipsEllipsis
          @on-selected-item="onSelectedContactDisposition"
          :list-items="filteredContactDispositions"
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
          :selected-item="''"
          :display-count="6"
          identity="contact-disposition"
          default-label="No Voicemail" />
      </div>

    </div>
  </q-card>
</template>

<script>

import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions } from 'vuex'
import ChipsEllipsis from 'components/chips-ellipsis'

export default {
  name: 'SessionCallDisposition',
  components: {
    ChipsEllipsis
  },
  mounted () {
    this.sessionPaused = false
  },
  computed: {
    ...mapFields('powerDialer', [
      'sessionPaused'
    ]),
    ...mapState([
      'callDispositions',
      'dispositionStatuses'
    ]),
    ...mapGetters('contacts', [
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionLoader',
      'sessionSettings'
    ]),
    filteredCallDispositions () {
      if (this.sessionSettings.call_disposition_ids &&
        this.sessionSettings.call_disposition_ids.length > 0) {
        return this.callDispositions.filter(d => {
          return this.sessionSettings.call_disposition_ids.includes(d.id)
        })
      }
      return this.callDispositions
    },
    filteredContactDispositions () {
      if (this.sessionSettings.contact_disposition_ids &&
        this.sessionSettings.contact_disposition_ids.length > 0) {
        return this.dispositionStatuses.filter(d => {
          return this.sessionSettings.contact_disposition_ids.includes(d.id)
        })
      }
      return this.dispositionStatuses
    },
    contactDisposition () {
      return this.contact_disposition || this.contact?.disposition_status_id
    },
    callDisposition () {
      return this.call_disposition || this.contact?.last_communication?.call_disposition_id
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'updateContactDisposition',
      'updateCallDisposition'
    ]),
    async onSelectedCallDisposition (data) {
      const response = await this.updateCallDisposition({
        id: this.contact?.last_communication?.id,
        params: {
          call_disposition_id: data.id
        }
      })
      if (response?.id) {
        this.call_disposition = response?.call_disposition_id
      }
    },
    async onSelectedContactDisposition (data) {
      const response = await this.updateContactDisposition({
        id: this.contact.id,
        params: {
          disposition_status: data.id
        }
      })
      if (response?.id) {
        const status = this.dispositionStatuses.find(ds => {
          return ds.id === response?.disposition_status_id
        })
        this.contact_disposition = status.id
      }
    }
  },
  data () {
    return {
      contact_disposition: null,
      call_disposition: null,
      voicemail: []
    }
  }
}
</script>
