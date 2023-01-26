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
      <ChipsEllipsis
        initiallyDisabled
        headerLabel="CALL DISPOSITION"
        headerClass="t-menu__header no-border t-dense d-flex align-items-center"
        ref="callDispositionSelector"
        identity="call-disposition"
        default-label="No Call Dispositions"
        :list-items="filteredCallDispositions"
        :selected-item="callDisposition"
        :display-count="4"
        @on-selected-item="onSelectedCallDisposition" />
      <ChipsEllipsis
        headerLabel="CONTACT DISPOSITION"
        headerClass="t-menu__header t-dense d-flex align-items-center no-border pt-0"
        ref="contactDispositionSelector"
        identity="contact-disposition"
        default-label="No Contact Dispositions"
        :list-items="filteredContactDispositions"
        :selected-item="contactDisposition"
        :display-count="6"
        @on-selected-item="onSelectedContactDisposition" />

      <!--div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
        <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
          VOICEMAIL
        </div>
      </div>
      <div class="d-flex t-menu__content over-flow px-3 pb-0"-->
        <!-- <VmDropSelector /> -->
        <!--ChipsEllipsis
          @on-selected-item="onSelectedContactDisposition"
          :list-items="[]"
          :selected-item="''"
          :display-count="6"
          identity="contact-disposition"
          default-label="No Voicemail" />
      </div-->

    </div>
  </q-card>
</template>

<script>

import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions } from 'vuex'
import ChipsEllipsis from 'components/chips-ellipsis'
import { get, isEmpty } from 'lodash'

export default {
  name: 'SessionCallDisposition',
  components: {
    ChipsEllipsis
  },
  mounted () {
    this.sessionPaused = false
    this.initCallDisposition()
  },
  computed: {
    ...mapFields('powerDialer', [
      'sessionPaused'
    ]),
    ...mapState([
      'callDispositions',
      'dispositionStatuses',
      'dialer'
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
      return this.selectedContactDisposition || this.contact?.disposition_status_id
    },
    callDisposition () {
      return this.selectedCallDisposition || this.dialer?.communication?.id
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'updateContactDisposition',
      'updateCallDisposition'
    ]),
    async onSelectedCallDisposition (data) {
      const communicationId = get(this.dialer, 'communication.id', null)

      if (!communicationId) {
        return
      }

      this.updateCallDisposition({
        id: communicationId,
        params: {
          call_disposition_id: data.id
        }
      }).then(res => {
        if (res?.id) {
          this.selectedCallDisposition = res?.call_disposition_id
        }

        this.$refs.callDispositionSelector.hideLoading()
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.$refs.callDispositionSelector.hideLoading()
      })
    },
    async onSelectedContactDisposition (data) {
      const contactId = get(this.contact, 'id', null)

      if (!contactId) {
        return
      }

      this.updateContactDisposition({
        id: contactId,
        params: {
          disposition_status: data.id
        }
      }).then(res => {
        if (res?.id) {
          const status = this.dispositionStatuses.find(ds => {
            return ds.id === res?.disposition_status_id
          })
          this.selectedContactDisposition = status.id
        }

        this.$refs.contactDispositionSelector.hideLoading()
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.$refs.contactDispositionSelector.hideLoading()
      })
    },
    initCallDisposition () {
      if (isEmpty(this.dialer.communication)) {
        this.$refs.callDispositionSelector.disable()
        return
      }

      this.$refs.callDispositionSelector.enable()
    }
  },
  data () {
    return {
      selectedContactDisposition: null,
      selectedCallDisposition: null,
      voicemail: []
    }
  },
  watch: {
    'contact.id': function () {
      this.selectedContactDisposition = null
      this.selectedCallDisposition = null
      this.initCallDisposition()
    },
    sessionPaused () {
      this.initCallDisposition()
    },
    'dialer.communication': function () {
      this.initCallDisposition()
    }
  }
}
</script>
