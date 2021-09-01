<template>
  <div class="calls-header d-flex justify-content-between">
    <div class="calls-header__label">
      {{ label }} <b-badge :variant="resolveVariant" class="font-weight-light">{{ contact.task_status | fixTaskStatusName }}</b-badge>
    </div>
   <div class="mr-1">
     <q-btn
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none mr-2"
       v-if="hasUnreads"
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
       @click="onUpdateTaskStatus(ContactTaskStatus.STATUS_PENDING)">
       <q-tooltip anchor="top middle"
                  self="center middle">
         Move to Pending
       </q-tooltip>
      <span v-if="!isUpdatingStatus"
            class="mx-2">
        <timer-o-icon></timer-o-icon>
      </span>
       <q-spinner-bars v-if="isUpdatingStatus"
                       class="pl-1 pr-1"
                       color="primary"
                       size="20px"
       />
     </q-btn>
     <q-btn
       v-if="contact.task_status === ContactTaskStatus.STATUS_PENDING"
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none"
       :disable="isUpdatingStatus"
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
     <q-btn
       v-if="[ContactTaskStatus.STATUS_CLOSED, ContactTaskStatus.STATUS_PENDING].includes(contact.task_status)"
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none"
       :disable="isUpdatingStatus"
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
   </div>
  </div>
</template>

<script>
import TimerOIcon from 'components/icons/timer-o-icon'
import CheckOIcon from 'components/icons/check-o-icon'
import * as ContactTaskStatus from 'src/constants/contact-task-status.js'
import InboxOIcon from 'components/icons/inbox-o-icon'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-activities-header',

  components: { InboxOIcon, CheckOIcon, TimerOIcon },

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
    resolveVariant () {
      switch (this.contact.task_status) {
        case ContactTaskStatus.STATUS_OPEN:
          return 'primary'
        case ContactTaskStatus.STATUS_PENDING:
          return 'danger'
        default:
          return ''
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
        let contact = { ...this.contact }
        contact.task_status = status
        this.$VueEvent.fire('contact_task_status_updated', contact)
        this.isUpdatingStatus = false
        this.nextStat = null
      })
    }
  }
}
</script>
