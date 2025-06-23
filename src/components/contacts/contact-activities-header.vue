<template>
  <div class="calls-header d-flex justify-content-between flex-wrap">
    <talk-alert-banner
      class="cursor-pointer col-12 pl-0 pr-0 pb-2"
      v-if="isReadOnly"
      tooltip="You can view this contact and take basic actions like calling or replying,
      but editing, tagging, or adding to Lists, as well as enrolling in Sequences,
      AloAI Agents, or syncing to your CRM, is restricted."
    >
      <div class="d-flex align-items-center text-center justify-content-center" style="gap: .25rem">
        <lock-icon /> <span class="text-bold text-dark">Limited Access</span>
      </div>
    </talk-alert-banner>
    <div class="calls-header__label d-flex">
      <back-button class="p-0"
                   v-if="$q.screen.lt.md && ![TEAMINBOXES_MENU_COMMUNICATIONS_TITLE].includes($route.name)"
                   data-testid="contact-activities-back-btn"
                   @click="back"/>
      <div class="contact-name">{{ label }}</div>
      <b-badge class="d-flex align-items-center badge-task-status"
               :variant="resolveVariant"
               data-testid="contact-activities-status-badge"
               v-if="contact.task_status && isContactStatusControlEnabled">
        {{ contact.task_status | fixTaskStatusName }}
      </b-badge>
    </div>
    <div class="contact-activities-actions mr-3 text-nowrap d-flex">
      <div class="contact-activities-actions__mobile align-items-center flex-grow-1 justify-content-end">
        <b-dropdown no-caret
                    right
                    variant="light"
                    toggle-class="bg-white d-flex align-items-center"
                    data-testid="contact-activities-actions-dropdown"
                    class="m-2 b-compact-dropdown-button text-bold contact-activities-actions-dropdown d-flex align-items-center">
          <template #button-content>
            <ellipsis-icon />
          </template>
          <b-dropdown-item href=""
                           :disabled="!hasUnreads"
                           data-testid="contact-activities-mark-all-as-read-item"
                           @click="$emit('markAllAsRead')">
            <mail-open-icon class="mark-all-as-read-icon dropdown-icon"/>
            Mark all as read ({{ unreadCount }})
          </b-dropdown-item>

          <b-dropdown-item href=""
                           data-testid="contact-activities-export-communications-item"
                           class="d-flex"
                           :disabled="loading"
                           v-if="isAdmin && !isWidget && enableExport && !inPowerDialerPage"
                           @click="handleExportCommunications">
            <export-icon class="mark-all-as-read-icon dropdown-icon" />
            Export Communications
          </b-dropdown-item>

          <b-dropdown-item href="#"
                           :disable="isUpdatingStatus || isReadOnly"
                           v-if="contact.task_status === ContactTaskStatus.STATUS_OPEN && isContactStatusControlEnabled"
                           data-testid="contact-activities-move-to-pending-item"
                           @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_PENDING)">
            <timer-o-icon class="dropdown-icon"></timer-o-icon>
            Move to Pending
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           data-testid="contact-activities-close-item"
                           :disable="isUpdatingStatus || isReadOnly"
                           v-if="shouldDisplayContact"
                           @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_CLOSED)">
            <check-o-icon class="dropdown-icon"></check-o-icon>
            Close
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           :disable="isUpdatingStatus || isReadOnly"
                           v-if="[ContactTaskStatus.STATUS_CLOSED, ContactTaskStatus.STATUS_PENDING].includes(contact.task_status)"
                           data-testid="contact-activities-reopen-item"
                           @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_OPEN)">
            <inbox-o-icon class="dropdown-icon"></inbox-o-icon>
            Reopen
          </b-dropdown-item>
        </b-dropdown>
        <q-btn borderless
               flat
               class="contact-activities-actions__drawer_btn"
               data-testid="contact-activities-drawer-btn"
               v-if="!isWidget"
               @click="$emit('toggleDrawer')">
          <information-circle-icon/>
        </q-btn>
        <q-btn borderless
               flat
               class="contact-activities-actions__mobile_btn"
               data-testid="contact-activities-details-mobile-btn"
               v-if="!isWidget"
               @click="$emit('toggleDetails')">
          <information-circle-icon width="33"
                                   height="33"/>
        </q-btn>
      </div>
      <div class="contact-activities-actions__desktop d-flex flex-grow-1 justify-content-end">
        <q-spinner-dots v-if="processingMarkAllAsRead"
                        class="pl-1 pr-1"
                        color="primary"
                        size="40px" />
        <q-btn
          borderless
          flat
          no-caps
          type="a"
          color="primary"
          class="text-decoration-none mr-2"
          :disabled="processingMarkAllAsRead"
          v-if="hasUnreads"
          data-testid="contact-activities-mark-all-as-read-btn"
          @click="markAllAsRead">
          <span
            v-if="teamInbox"
            class="mx-2 d-flex align-items-center"
          >
            <span v-b-tooltip.html="activeInboxId ? {customClass: 'tooltip-dark'} : undefined"
                 :title="markAllAsReadTooltip">
              Mark all as read ({{ unreadCount }})
            </span>
            <information-circle-icon
              class="ml-1 cursor-pointer"
              width="16"
              height="16"
              v-b-tooltip.html="{customClass: 'tooltip-dark'}"
              :title="markAllAsReadTooltip" />
          </span>
          <span v-else class="mx-2 d-flex align-items-center">
            <span>Mark all as read ({{ unreadCount }})</span>
          </span>
        </q-btn>
        <q-btn borderless
               flat
               no-caps
               type="a"
               color="primary"
               class="text-decoration-none"
               data-testid="contact-activities-export-communications-btn"
               :disabled="loading"
               v-if="isAdmin && !isWidget && enableExport && !inPowerDialerPage"
               @click="handleExportCommunications">
          <span v-b-tooltip.html="{customClass: 'tooltip-dark'}"
                title="Export Communications"
                class="mx-2"
                v-if="!loading">
            <export-icon />
          </span>
          <q-spinner-bars v-if="loading"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>

        <q-btn borderless
               flat
               no-caps
               type="a"
               color="primary"
               class="text-decoration-none"
               :disable="isUpdatingStatus || isReadOnly"
               data-testid="contact-activities-move-to-pending-btn"
               @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_PENDING)"
               v-if="contact.task_status === ContactTaskStatus.STATUS_OPEN && isContactStatusControlEnabled">
          <span title="Move to Pending"
                class="mx-2"
                v-b-tooltip.html="{customClass: 'tooltip-dark'}"
                v-if="!isUpdatingStatus">
            <timer-o-icon></timer-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_PENDING"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>
        <q-btn borderless
               flat
               no-caps
               type="a"
               color="primary"
               class="text-decoration-none"
               :disable="isUpdatingStatus || isReadOnly"
               data-testid="contact-activities-reopen-btn"
               @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_OPEN)"
               v-if="shouldDisplayClosedOrPendingContact">
          <span title="Reopen"
                class="mx-2"
                v-b-tooltip.html="{customClass: 'tooltip-dark'}"
                v-if="!isUpdatingStatus">
            <inbox-o-icon></inbox-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_OPEN"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>
        <q-btn borderless
               flat
               no-caps
               type="a"
               color="primary"
               class="text-decoration-none"
               :disable="isUpdatingStatus || isReadOnly"
               data-testid="contact-activities-close-btn"
               @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_CLOSED)"
               v-if="shouldDisplayContact">
          <span title="Close"
                class="mx-2"
                v-b-tooltip.html="{customClass: 'tooltip-dark'}"
                v-if="!isUpdatingStatus">
            <check-o-icon></check-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_CLOSED"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>

        <q-btn flat
               color="primary"
               class="open-contact-details-btn d-flex align-items-center justify-content-center px-2"
               v-b-tooltip.hover="{customClass: 'tooltip-dark'}"
               :title="isContactDetailsCollapsed ? 'Show contact details' : 'Hide contact details'"
               @click="$emit('toggleDetails')">
          <phone-card-icon width="21" height="21" color="#62666E"/>
          <i class="ml-1 fa"
             style="color:#62666E"
             :class="[!isContactDetailsCollapsed ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
        </q-btn>
      </div>
    </div>
    <profile v-if="isMobile && $q.screen.lt.md && !isWidget && !teamInbox"
      :hideProfileInfo="true"></profile>
  </div>
</template>

<script>
import BackButton from 'components/back-button'
import TalkAlertBanner from 'components/common/talk-alert-banner.vue'
import CheckOIcon from 'components/icons/check-o-icon'
import EllipsisIcon from 'components/icons/ellipsis-icon'
import InboxOIcon from 'components/icons/inbox-o-icon'
import LockIcon from 'components/icons/inbox/lock-icon.vue'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import MailOpenIcon from 'components/icons/mail-open-icon'
import TimerOIcon from 'components/icons/timer-o-icon'
import Profile from 'components/profile'
import * as ContactTaskStatus from 'src/constants/contact-task-status.js'
import talk2Api from 'src/plugins/api/api'
import { cloneDeep } from 'src/plugins/helpers/functions'
import { aclMixin, teamInboxPropsMixin } from 'src/plugins/mixins'
import { TEAMINBOXES_MENU_COMMUNICATIONS_TITLE } from 'src/router/routes'
import { mapGetters, mapState } from 'vuex'
import ExportIcon from '../icons/export-icon.vue'
import PhoneCardIcon from 'components/icons/phone-card-icon.vue'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'contact-activities-header',

  mixins: [
    aclMixin,
    teamInboxPropsMixin
  ],

  components: {
    LockIcon,
    TalkAlertBanner,
    Profile,
    InboxOIcon,
    CheckOIcon,
    TimerOIcon,
    InformationCircleIcon,
    MailOpenIcon,
    EllipsisIcon,
    BackButton,
    ExportIcon,
    PhoneCardIcon
  },

  props: {
    contact: {
      type: Object,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    hasUnreads: {
      type: Boolean,
      required: false,
      default: false
    },
    unreadCount: {
      type: Number,
      required: false,
      default: 0
    },
    enableExport: {
      type: Boolean,
      default: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState(['isMobile', 'isWidget']),
    ...mapState('TeamInbox', ['activeInboxId']),
    ...mapGetters('cache', ['isContactStatusControlEnabled']),
    ...mapFields('settings', ['isContactDetailsCollapsed']),
    resolveVariant () {
      switch (this.contact.task_status) {
        case ContactTaskStatus.STATUS_OPEN:
          return 'primary'
        case ContactTaskStatus.STATUS_PENDING:
          return 'danger'
        default:
          return ''
      }
    },
    activityContact: {
      get () {
        return this.contact
      },
      set (activityContact) {
        return activityContact
      }
    },

    shouldDisplayContact () {
      return [ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(this.contact?.task_status) && this.isContactStatusControlEnabled
    },

    shouldDisplayClosedOrPendingContact () {
      return [ContactTaskStatus.STATUS_CLOSED, ContactTaskStatus.STATUS_PENDING].includes(this.contact?.task_status) && this.isContactStatusControlEnabled
    },

    inPowerDialerPage () {
      const previousPage = this.$route?.query?.previousPage
      return previousPage === 'Power Dialer'
    },

    markAllAsReadTooltip () {
      return `<b class="text-nowrap">This will mark all communications for this contact as read in this Team Inbox only.</b>
      <br/><span class="text-nowrap">This does not affect the contact's unread calls or messages in other inboxes.</span>`
    }
  },
  data () {
    return {
      ContactTaskStatus,
      isUpdatingStatus: false,
      nextStat: null,
      loading: false,
      processingMarkAllAsRead: false,
      TEAMINBOXES_MENU_COMMUNICATIONS_TITLE
    }
  },

  methods: {
    async markAllAsRead () {
      this.processingMarkAllAsRead = true
      this.$emit('markAllAsRead')
    },

    markContactCommunicationsAllAsReadListener (data) {
      this.processingMarkAllAsRead = false
    },

    onUpdateTaskStatus (status) {
      this.isUpdatingStatus = true
      this.nextStat = status
      talk2Api.V2.contacts.taskStatusUpdate(this.contact.id, { status: status }).then(res => {
        if (status === ContactTaskStatus.STATUS_CLOSED) {
          this.$emit('markAllAsRead')
        }

        const contact = cloneDeep(this.contact)
        const key = { data: null }
        for (key.data in res.data) {
          if (typeof contact[key.data] !== 'undefined') {
            contact[key.data] = res.data[key.data]
          }
        }
        contact.task_status = status
        this.activityContact = contact
      })
    },
    back () {
      if (!this.$route.path.includes('channels') && this.$route.path.includes('contact')) {
        this.$router.back()
        return
      }

      const path = this.$route.path.split('/')
      path.pop()
      path.pop()

      if (!isNaN(path[(path.length - 1)] / 1)) {
        path.pop()
        path.pop()
      }

      this.$router.push(path.join('/'))
    },

    async handleExportCommunications () {
      this.loading = true

      try {
        await talk2Api.V2.contacts.exportCommunications(this.contact.id, this.teamInbox)
        this.$generalNotification('Contact communications export request has been successfully submitted and is queued for processing.')
      } catch (error) {
        console.log(error)
        this.$generalNotification('Unable to process export request! Please try again later.', 'error')
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    'contact.task_status': function () {
      this.$VueEvent.fire('contact_task_status_updated', this.contact)
      this.isUpdatingStatus = false
      this.nextStat = null
    },

    '$route.params.id': function (value) {
      // Reset the processingMarkAllAsRead flag when the contact id changes, for precaution
      this.processingMarkAllAsRead = false
    }
  },

  created () {
    this.$VueEvent.listen('mark_contact_communications_all_as_read', this.markContactCommunicationsAllAsReadListener)
  },

  beforeDestroy () {
    this.$VueEvent.stop('mark_contact_communications_all_as_read', this.markContactCommunicationsAllAsReadListener)
  }
}
</script>

<style scoped>
.tooltip-dark::v-deep(.tooltip-inner)
{
  min-width: fit-content;
  font-size: 14px !important;
  background-color: #000 !important;
  color: #fff !important;
}
</style>
