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
  dialerCommunicationMixin,
  dispositionsMixin,
  dispositionsOptionsMixin
} from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'SessionCallDisposition',

  mixins: [
    dispositionsMixin,
    dispositionsOptionsMixin,
    dialerCommunicationMixin
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

    isVoicemailEmpty () {
      return isEmpty(this.voicemails)
    }
  },

  created () {
    this.getVmDrops()
  },

  mounted () {
    this.initCallDisposition()

    if (!this.isCallInProgressStatus) {
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

        if (this.isReferenceAvailable('callDispositionSelector')) {
          this.$refs.callDispositionSelector.hideLoading()
        }
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.onCallDisposed(this.callDisposition)

        if (this.isReferenceAvailable('callDispositionSelector')) {
          this.$refs.callDispositionSelector.hideLoading()
        }
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

        if (this.isReferenceAvailable('contactDispositionSelector')) {
          this.$refs.contactDispositionSelector.hideLoading()
        }
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
        this.onContactDisposed(this.contactDisposition)

        if (this.isReferenceAvailable('contactDispositionSelector')) {
          this.$refs.contactDispositionSelector.hideLoading()
        }
      })
    },

    initCallDisposition () {
      if (isEmpty(this.dialer.communication) &&
        this.isReferenceAvailable('callDispositionSelector')) {
        this.$refs.callDispositionSelector.disable()
        return
      }

      if (this.isReferenceAvailable('callDispositionSelector')) {
        this.$refs.callDispositionSelector.enable()
      }
    },

    onVmDrop (item) {
      if (!this.isCallInProgressStatus || !item) {
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
    },

    isReferenceAvailable (referenceId) {
      return !isEmpty(this.$refs?.[referenceId])
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
      this.initCallDisposition()
    },

    isCallInProgressStatus (value) {
      if (value) {
        this.$refs['vm-drop'].enable()

        return
      }

      this.$refs['vm-drop'].disable()
    }
  }
}
</script>
