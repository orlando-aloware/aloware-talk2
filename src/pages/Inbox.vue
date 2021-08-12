<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="call-active">
    </div>
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side></inbox-side>
      <div class="d-flex flex-grow-1"
           v-if="['Inbox Contact', 'Inbox Contact Task'].includes($route.name)">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import talk2Api from 'src/plugins/api/api'

export default {
  components: {
    InboxSide
  },

  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapState('inbox', ['items', 'activeChannel'])
  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Inbox',
      contactId: null
    }
  },

  methods: {
    ...mapActions('inbox', ['setActiveChannel', 'setOpenTaskCount', 'setPendingTaskCount']),

    setChannel () {
      if (['Inbox Channel', 'Inbox Contact'].includes(this.$route.name)) {
        let channel = this.items.find(item => item.value === this.$route.params.channel)
        this.setActiveChannel(channel)
      }

      if (['Inbox'].includes(this.$route.name) && !this.activeChannel) {
        let channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }
    },
    fetchTaskData (taskStatusId) {
      const query = {
        filters: {
          contact_task_status: {
            value: [taskStatusId],
            operator: 1
          }
        }
      }
      return talk2Api.V2.contacts.list(query)
    },
    getPendingTaskCount () {
      this.fetchTaskData(ContactTaskStatus.STATUS_PENDING).then(response => {
        this.setPendingTaskCount(response.data.total)
      })
    },
    getOpenTaskCount () {
      this.fetchTaskData(ContactTaskStatus.STATUS_OPEN).then(response => {
        this.setOpenTaskCount(response.data.total)
      })
    }
  },

  mounted () {
    this.setChannel()
    this.getOpenTaskCount()
    this.getPendingTaskCount()
  },

  watch: {
    '$route.name': function () {
      this.setChannel()
    }
  }
}
</script>
