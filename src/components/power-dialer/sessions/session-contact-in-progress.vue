<template>
  <q-card class="t-cards pt-2">
    <q-list class="px-2 pb-2">
      <q-item
        v-if="hasActiveTask && activeTask"
        class="active t-expansion-panel px-2">
        <div class="py-2">
          <q-avatar size="30px"
                    color="grey">
            <span v-if="isNoName">
              <i class="fa fa-user"></i>
            </span>
            <span v-else>
              {{ getInitials(this.activeTask.name) }}
            </span>
          </q-avatar>
        </div>

        <q-item-section class="pl-2">
          <q-item-label>
            {{ fullName }}
          </q-item-label>
          <q-item-label caption lines="2">
            {{ activeTask?.phone_number | fixPhone('NATIONAL', true) }}
          </q-item-label>
          <q-item-label caption lines="2">
            {{ activeTask?.company_name }}
          </q-item-label>
          <q-item-label caption lines="2">
            <i class="fa fa-globe"></i>
            {{ activeTask?.timezone }}
          </q-item-label>
        </q-item-section>

        <q-item-section
          v-if="statusCallConnected"
          class="t-item-icon"
          side top>
          <q-avatar
            @click="endCurrentCall"
            color="red"
            size="md">
            <PhoneIcon color="white" />
          </q-avatar>
        </q-item-section>

      </q-item>
      <div class="px-0 pb-1 text-grey"
           v-else>
        <q-card flat
                class="bg-grey-50 p-2 mx-2">
          <span class="px-2">
            No call in progress
          </span>
        </q-card>
      </div>
    </q-list>
  </q-card>
</template>

<script>
import { isEmpty } from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'
import PhoneIcon from 'components/icons/call-drop-icon'
import { avatarMixin } from 'src/plugins/mixins'

export default {
  name: 'SessionContactInProgress',

  mixins: [
    avatarMixin
  ],

  components: {
    PhoneIcon
  },

  computed: {
    ...mapFields('powerDialer', [
      'activeTask',
      'hasActiveTask'
    ]),

    ...mapState(['dialer']),

    isNoName () {
      const firstName = this.activeTask?.first_name
      const lastName = this.activeTask?.last_name

      return isEmpty(firstName) &&
        isEmpty(lastName)
    },

    fullName () {
      return this.isNoName
        ? `No Name`
        : `${this.activeTask?.first_name || ''} ${this.activeTask?.last_name || ''}`
    },

    activeTaskId () {
      return this.activeTask?.id
    },

    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    }
  },

  methods: {
    endCurrentCall () {
      this.$VueEvent.fire('hangupCall')
    }
  }
}
</script>
