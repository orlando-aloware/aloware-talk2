<template>
  <q-card flat
          style="height: 100%;">
    <div class="text-h6 text-grey-80 full-height fill-width row justify-center items-center"
         v-show="sessionPaused">
      Session Paused
    </div>
    <div class="t-menu pb-2"
         v-show="!sessionPaused">
      <chips-ellipsis headerLabel="CALL DISPOSITION"
                      headerClass="t-menu__header no-border t-dense d-flex align-items-center"
                      ref="callDispositionSelector"
                      identity="call-disposition"
                      default-label="No Call Dispositions"
                      initiallyDisabled
                      :list-items="filteredCallDispositions"
                      :selected-item="callDisposition"
                      :display-count="4"
                      :forced="isHighlightedCallDisposition"
                      @on-selected-item="onSelectedCallDisposition" />
      <chips-ellipsis headerLabel="CONTACT DISPOSITION"
                      headerClass="t-menu__header t-dense d-flex align-items-center no-border pt-0"
                      ref="contactDispositionSelector"
                      identity="contact-disposition"
                      default-label="No Contact Dispositions"
                      :list-items="filteredContactDispositions"
                      :selected-item="contactDisposition"
                      :display-count="6"
                      :forced="isHighlightedContactDisposition"
                      @on-selected-item="onSelectedContactDisposition" />
      <chips-ellipsis headerLabel="VOICEMAIL"
                      headerClass="t-menu__header no-border t-dense d-flex align-items-center"
                      ref="vm-drop"
                      identity="vm-drop"
                      default-label="No Voicemail"
                      initiallyDisabled
                      :list-items="voicemails"
                      :display-count="3"
                      :is-empty="isVoicemailEmpty"
                      @on-selected-item="onVmDrop"/>
    </div>
  </q-card>
</template>

<script>
import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions } from 'vuex'
import ChipsEllipsis from 'components/chips-ellipsis'
import { get, isEmpty } from 'lodash'
import {
  dispositionsMixin,
  dispositionsOptionsMixin
} from 'src/plugins/mixins'
import API from 'src/plugins/api/api'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import { VM_DROP_ENABLE_DELAY } from 'src/constants/delays'

export default {
  name: 'SessionCallDisposition',

  mixins: [
    dispositionsMixin,
    dispositionsOptionsMixin
  ],

  components: {
    ChipsEllipsis
  },

  data () {
    return {
      voicemails: [],
      loadingSendVmDrop: false
    }
  },

  computed: {
    ...mapFields('powerDialer', [
      'sessionPaused'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapState([
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

    isContactNotDisposed () {
      const hasContactDisposition = this.isContactDisposed || this.contact?.disposition_status_id

      return this.currentCompany && this.currentCompany.force_contact_disposition &&
        !hasContactDisposition
    },

    isCallCompleted () {
      return ((this.dialer.communication && this.dialer.communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) || ['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(this.dialer.currentStatus))
    },

    isVmDropReady () {
      const isCallConnected = !this.isCallCompleted || this.dialer.currentStatus === 'CALL_CONNECTED'
      return !isEmpty(this.dialer.communication) && isCallConnected
    },

    isVoicemailEmpty () {
      return isEmpty(this.voicemails)
    }
  },

  created () {
    this.getVmDrops()
  },

  mounted () {
    this.sessionPaused = false
    this.initCallDisposition()

    if (!this.isVmDropReady) {
      this.$refs['vm-drop'].disable()
    }
  },

  methods: {
    ...mapActions('powerDialer', [
      'updateContactDisposition',
      'updateCallDisposition'
    ]),

    ...mapActions([
      'setDialerContact',
      'setDialerCommunication'
    ]),

    getVmDrops () {
      API.V1.library.voicemailDrop.get({
        params: {
          user_id: this.profile.id
        }
      }).then(res => {
        if (isEmpty(this.sessionSettings.vm_drop_ids)) {
          return
        }

        this.voicemails = res.data.filter(vm => this.sessionSettings.vm_drop_ids.includes(vm.id))
      })
    },

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

        const dialerCommunication = this.$jsonClone(this.dialer.communication)

        if (dialerCommunication) {
          dialerCommunication.call_disposition_id = data.id
          this.setDialerCommunication(dialerCommunication)
        }

        this.$VueEvent.fire('pauseWrapUp', this.isNotDisposed)
        this.onCallDisposed(data.id)
        this.$refs.callDispositionSelector.hideLoading()
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.onCallDisposed(this.callDisposition)
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

        const dialerContact = this.$jsonClone(this.dialer.contact)

        if (dialerContact) {
          dialerContact.disposition_status_id = data.id
          this.setDialerContact(dialerContact)
        }

        this.$VueEvent.fire('pauseWrapUp', this.isNotDisposed)
        this.onContactDisposed(data.id)
        this.$refs.contactDispositionSelector.hideLoading()
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.onContactDisposed(this.contactDisposition)
        this.$refs.contactDispositionSelector.hideLoading()
      })
    },

    initCallDisposition () {
      if (isEmpty(this.dialer.communication)) {
        this.$refs.callDispositionSelector.disable()
        return
      }

      this.$refs.callDispositionSelector.enable()
    },

    onVmDrop (item) {
      if (!this.isVmDropReady || !item) {
        return
      }

      this.$refs['vm-drop'].disable()

      API.V1.dialer.sendVmDrop({
        communication_id: this.dialer.communication.id,
        file_name: item.uploaded_file.uuid,
        name: item.name
      }).then(() => {
        this.$refs['vm-drop'].hideLoading()
      }).catch(err => {
        console.log(err)
        this.$refs['vm-drop'].enable()
        this.$refs['vm-drop'].hideLoading()
      })
    }
  },

  watch: {
    'contact.id': function () {
      this.selectedContactDisposition = null
      this.selectedCallDisposition = null
      this.initCallDisposition()

      if (this.isContactNotDisposed) {
        this.$VueEvent.fire('pauseWrapUp', true)
      }
    },

    sessionPaused () {
      this.initCallDisposition()
    },

    'dialer.communication': function (communication) {
      // add 3 seconds delay to consistent with vm drop delay
      setTimeout(() => {
        this.initCallDisposition()
      }, VM_DROP_ENABLE_DELAY)

      if (this.isVmDropReady) {
        // add 3 seconds delay to make sure vm drop won't fail if requested
        // due to phone is still ringing.
        setTimeout(() => {
          this.$refs['vm-drop'].enable()
        }, VM_DROP_ENABLE_DELAY)

        return
      }

      this.$refs['vm-drop'].disable()
    }
  }
}
</script>
