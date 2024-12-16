<template>
  <q-card flat
          style="height: 100%;">
    <div class="text-h6 text-grey-80 full-height fill-width row justify-center items-center"
         v-show="sessionPaused">
      Session Paused
    </div>
    <div class="t-menu pb-4"
         v-show="!sessionPaused">
      <chips-ellipsis headerLabel="CALL DISPOSITION"
                      headerClass="t-menu__header no-border t-dense d-flex align-items-center"
                      ref="callDispositionSelector"
                      identity="call-disposition"
                      default-label="No Call Dispositions"
                      initiallyDisabled
                      collapsible
                      :list-items="filteredCallDispositions"
                      :selected-item="callDisposition"
                      :display-count="4"
                      :forced="isHighlightedCallDisposition"
                      @on-selected-item="onSelectedCallDisposition" />
      <chips-ellipsis headerLabel="CONTACT DISPOSITION"
                      headerClass="t-menu__header t-dense d-flex align-items-center no-border pt-2"
                      ref="contactDispositionSelector"
                      identity="contact-disposition"
                      default-label="No Contact Dispositions"
                      collapsible
                      :list-items="filteredContactDispositions"
                      :selected-item="contactDisposition"
                      :display-count="6"
                      :forced="isHighlightedContactDisposition"
                      @on-selected-item="onSelectedContactDisposition" />
      <chips-ellipsis headerLabel="VOICEMAIL"
                      headerClass="t-menu__header no-border t-dense d-flex align-items-center pt-2"
                      ref="vm-drop"
                      identity="vm-drop"
                      default-label="No Voicemail"
                      initiallyDisabled
                      collapsible
                      :list-items="voicemails"
                      :display-count="3"
                      :is-empty="isVoicemailEmpty"
                      @on-selected-item="onVmDrop"/>
      <chips-ellipsis headerLabel="SEND MESSAGE"
                      headerClass="t-menu__header no-border t-dense d-flex align-items-center pt-2"
                      ref="smsTemplatesSelector"
                      identity="send-message"
                      default-label="No SMS Templates"
                      collapsible
                      :list-items="smsTemplates"
                      :display-count="4"
                      :forced="isHighlightedSmsTemplate"
                      :is-empty="isSmsTemplatesEmpty"
                      v-if="sessionSettings.min_redials > 0 && sessionSettings.force_sms"
                      @on-selected-item="onSelectedSmsTemplate"/>
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
      loadingSendVmDrop: false,
      smsTemplates: []
    }
  },

  computed: {
    ...mapFields('powerDialer', [
      'sessionPaused',
      'activeTask',
      'tasksSentSmsTemplates'
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
    },

    isSmsTemplatesEmpty () {
      return isEmpty(this.smsTemplates)
    }
  },

  created () {
    this.getVmDrops()
    this.getSmsTemplates()
  },

  mounted () {
    this.initCallDisposition()

    if (!this.isCallInProgressStatus) {
      this.$refs['vm-drop'].disable()
    }

    this.$VueEvent.listen('clearCallDispositionStatus', this.clearCallDispositionStatus)
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

    getSmsTemplates () {
      API.V1.smsTemplate.get().then(res => {
        this.smsTemplates = res.data
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

    refreshDispositionActions () {
      this.initCallDisposition()
      this.initSmsTemplate()
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

    initSmsTemplate () {
      if (!this.isReferenceAvailable('smsTemplatesSelector')) {
        return
      }

      if (['READY', 'MAKING_CALL'].includes(this.dialer.currentStatus) && this.$refs.smsTemplatesSelector.enabled) {
        this.$refs.smsTemplatesSelector.disable()
        return
      }

      if (!this.callDisposition) {
        this.$refs.smsTemplatesSelector.disable()
        return
      }

      // sms template already sent for this task, disable it
      if (this.activeTask && this.tasksSentSmsTemplates[this.activeTask.id]) {
        this.$refs.smsTemplatesSelector.disable()
        return
      }

      // enable selection if selected disposition is not a successful call disposition
      const successfulCallDispositionsIds = this.sessionSettings.successful_call_disposition_ids
      if (Array.isArray(successfulCallDispositionsIds) && !successfulCallDispositionsIds.includes(this.callDisposition)) {
        this.$refs.smsTemplatesSelector.enable()

        if (this.requireSmsSending) {
          // pause wrap up and wait for SMS selection
          this.$VueEvent.fire('pauseWrapUp', true)
        }
      } else {
        this.$refs.smsTemplatesSelector.disable()
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

    onSelectedSmsTemplate (item) {
      this.tasksSentSmsTemplates[this.activeTask.id] = item.id

      const message = {
        body: item.body,
        contact_id: this.contact.id,
        campaign_id: this.sessionSettings.campaign_id,
        phone_number: this.contact.phone_number
      }

      API.V1.message.send(message)
        .then(() => {
          this.$refs['smsTemplatesSelector'].disable()
          this.$refs['smsTemplatesSelector'].hideLoading()
          this.$generalNotification('Message sent successfully')
        }).catch(err => {
          console.log('[onSelectedSmsTemplate]', err)
          this.$generalNotification('Failed to send message', 'warning')

          this.$refs['smsTemplatesSelector'].disable()
          this.$refs['smsTemplatesSelector'].hideLoading()
        }).finally(() => {
          // sms send, proceed to next task
          this.$VueEvent.fire('pauseWrapUp', false)
        })
    },

    isReferenceAvailable (referenceId) {
      return !isEmpty(this.$refs?.[referenceId])
    },

    clearCallDispositionStatus () {
      this.selectedCallDisposition = null
      this.refreshDispositionActions()

      if (this.isContactNotDisposed) {
        this.$VueEvent.fire('pauseWrapUp', true)
      }
    }
  },

  watch: {
    'contact.id': function () {
      this.selectedContactDisposition = null
      this.selectedCallDisposition = null
      this.refreshDispositionActions()

      if (this.isContactNotDisposed) {
        this.$VueEvent.fire('pauseWrapUp', true)
      }
    },

    sessionPaused () {
      this.refreshDispositionActions()
    },

    'dialer.communication': function (communication) {
      this.refreshDispositionActions()
    },

    'dialer.currentStatus': function (status) {
      console.log('currentStatus', status)
    },

    isCallInProgressStatus (value) {
      if (value) {
        this.$refs['vm-drop'].enable()

        return
      }

      this.$refs['vm-drop'].disable()
    },

    callDisposition () {
      this.initSmsTemplate()
    },

    contactDisposition () {
      this.initSmsTemplate()
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('clearCallDispositionStatus', this.clearCallDispositionStatus)
  }
}
</script>
