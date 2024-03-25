<template>
  <div class="calls-header d-flex justify-content-between pr-3">
    <div class="calls-header__label">
      <back-button class="p-0"
                   v-if="$q.screen.lt.md"
                   data-testid="contact-activities-back-btn"
                   @click="back"/>
      <div class="contact-name">{{ label }}</div>
      <b-badge class="d-flex align-items-center badge-task-status"
               :variant="resolveVariant"
               data-testid="contact-activities-status-badge"
               v-if="contact.task_status">
        {{ contact.task_status | fixTaskStatusName }}
      </b-badge>
    </div>
    <div class="contact-activities-actions text-nowrap">
      <div class="contact-activities-actions__mobile align-items-center flex-grow-1 justify-content-end">
        <b-dropdown no-caret
                    right
                    variant="light"
                    toggle-class="bg-white d-flex align-items-center"
                    data-testid="contact-activities-actions-dropdown"
                    class="m-2 b-compact-dropdown-button text-bold contact-activities-actions-dropdown d-flex align-items-center">
          <template #button-content>
            <ellipsis-icon/>
          </template>
          <b-dropdown-item href=""
                           :disabled="!hasUnreads"
                           data-testid="contact-activities-mark-all-as-read-item"
                           @click="$emit('markAllAsRead')">
            <mail-open-icon class="mark-all-as-read-icon dropdown-icon"/>
            Mark All as Read ({{ unreadCount }})
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           :disable="isUpdatingStatus"
                           v-if="contact.task_status === ContactTaskStatus.STATUS_OPEN"
                           data-testid="contact-activities-move-to-pending-item"
                           @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_PENDING)">
            <timer-o-icon class="dropdown-icon"></timer-o-icon>
            Move to Pending
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           :disable="isUpdatingStatus"
                           v-if="[ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(contact.task_status)"
                           data-testid="contact-activities-close-item"
                           @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_CLOSED)">
            <check-o-icon class="dropdown-icon"></check-o-icon>
            Close
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           :disable="isUpdatingStatus"
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
               @click="$emit('toggleDrawer')">
          <information-circle-icon/>
        </q-btn>
        <q-btn borderless
               flat
               class="contact-activities-actions__mobile_btn"
               data-testid="contact-activities-details-mobile-btn"
               @click="$emit('toggleDetails')">
          <information-circle-icon width="33"
                                   height="33"/>
        </q-btn>
      </div>
      <div class="contact-activities-actions__desktop d-flex flex-grow-1 justify-content-end">
        <q-btn
          borderless
          flat
          no-caps
          type="a"
          color="primary"
          class="text-decoration-none mr-2"
          v-if="hasUnreads"
          data-testid="contact-activities-mark-all-as-read-btn"
          @click="$emit('markAllAsRead')">
          <span class="mx-2">
            Mark All as Read ({{ unreadCount }})
          </span>
        </q-btn>
        <q-btn
          v-if="contact.task_status === ContactTaskStatus.STATUS_OPEN"
          borderless
          flat
          no-caps
          type="a"
          color="primary"
          class="text-decoration-none"
          :disable="isUpdatingStatus"
          data-testid="contact-activities-move-to-pending-btn"
          @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_PENDING)">
          <q-tooltip anchor="top middle"
                     self="center middle">
            Move to Pending
          </q-tooltip>
          <span v-if="!isUpdatingStatus"
                class="mx-2">
            <timer-o-icon></timer-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_PENDING"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>
        <q-btn
          v-if="[ContactTaskStatus.STATUS_CLOSED, ContactTaskStatus.STATUS_PENDING].includes(contact.task_status)"
          borderless
          flat
          no-caps
          type="a"
          color="primary"
          class="text-decoration-none"
          :disable="isUpdatingStatus"
          data-testid="contact-activities-reopen-btn"
          @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_OPEN)">
          <q-tooltip anchor="top middle"
                     self="center middle">
            Reopen
          </q-tooltip>
          <span v-if="!isUpdatingStatus"
                class="mx-2">
            <inbox-o-icon></inbox-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_OPEN"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>
        <q-btn
          v-if="[ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(contact.task_status)"
          borderless
          flat
          no-caps
          type="a"
          color="primary"
          class="text-decoration-none"
          :disable="isUpdatingStatus"
          data-testid="contact-activities-close-btn"
          @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_CLOSED)">
          <q-tooltip anchor="top middle"
                     self="center middle">
            Close
          </q-tooltip>
          <span v-if="!isUpdatingStatus"
                class="mx-2">
            <check-o-icon></check-o-icon>
          </span>
          <q-spinner-bars v-if="isUpdatingStatus && nextStat === ContactTaskStatus.STATUS_CLOSED"
                          class="pl-1 pr-1"
                          color="primary"
                          size="20px"
          />
        </q-btn>
      </div>
    </div>
    <profile v-if="isMobile && $q.screen.lt.md"
      :hideProfileInfo="true"></profile>
  </div>
</template>

<script>
import TimerOIcon from 'components/icons/timer-o-icon'
import CheckOIcon from 'components/icons/check-o-icon'
import * as ContactTaskStatus from 'src/constants/contact-task-status.js'
import InboxOIcon from 'components/icons/inbox-o-icon'
import talk2Api from 'src/plugins/api/api'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import MailOpenIcon from 'components/icons/mail-open-icon'
import EllipsisIcon from 'components/icons/ellipsis-icon'
import BackButton from 'components/back-button'
import Profile from 'components/profile'
import { mapState } from 'vuex'
export default {
  name: 'contact-activities-header',

  components: {
    Profile,
    InboxOIcon,
    CheckOIcon,
    TimerOIcon,
    InformationCircleIcon,
    MailOpenIcon,
    EllipsisIcon,
    BackButton
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
    }
  },

  computed: {
    ...mapState(['isMobile']),
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
    }
  },
  data () {
    return {
      ContactTaskStatus,
      isUpdatingStatus: false,
      nextStat: null
    }
  },

  methods: {
    onUpdateTaskStatus (status) {
      this.isUpdatingStatus = true
      this.nextStat = status
      talk2Api.V2.contacts.taskStatusUpdate(this.contact.id, { status: status }).then(res => {
        if (status === ContactTaskStatus.STATUS_CLOSED) {
          this.$emit('markAllAsRead')
        }

        const contact = { ...this.contact }
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
    }
  },
  watch: {
    'contact.task_status': function () {
      this.$VueEvent.fire('contact_task_status_updated', this.contact)
      this.isUpdatingStatus = false
      this.nextStat = null
    }
  }
}
</script>
