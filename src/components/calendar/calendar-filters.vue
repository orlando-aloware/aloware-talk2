<template>
  <div class="calendar__filters">
    <b-button class="btn-white d-flex align-items-center"
              size="sm"
              variant="light"
              v-b-modal.calendar-filters-modal>
      Filters
      <b-badge v-if="filterCount > 0"
               class="d-flex align-items-center contact-filter-count ml-1"
               pill
               variant="primary">
        {{ filterCount }}
      </b-badge>
    </b-button>
    <b-modal id="calendar-filters-modal"
             ref="modal"
             centered>
      <template #modal-title>
        <h2>Filters</h2>
      </template>
      <q-card class="my-card"
              flat>
        <!-- Appointments switch -->
        <b-form-group>
          <b-form-checkbox switch
                           v-model="search.appointments">
            Appointments
          </b-form-checkbox>
        </b-form-group>

        <!-- Reminders switch -->
        <b-form-group>
          <b-form-checkbox switch
                           v-model="search.reminders">
            Reminders
          </b-form-checkbox>
        </b-form-group>

        <!-- Statuses -->
        <b-form-group class="form-label"
                      label="Status">
          <communication-disposition-status-selector :options="statuses"
                                                     :generic-styling="false"
                                                     :multiple="true"
                                                     :use-chips="true"
                                                     v-model="search.status">
          </communication-disposition-status-selector>
        </b-form-group>

        <hr>

        <!-- Users -->
        <b-form-group class="form-label"
                      label="Users">
          <user-selector :generic-styling="false"
                         :multiple="true"
                         :use-chips="true"
                         v-model="search.users"
                         @change="onUserChange">
          </user-selector>
        </b-form-group>
      </q-card>

      <template #modal-footer="{ cancel, ok }">
        <div class="d-flex w-100">
          <div class="flex-grow-1"></div>
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click="hide(cancel)">
            Cancel
          </button>
          <button class="btn btn-sm bg-primary text-white mr-2"
                  @click="save(ok)">
            Apply Filters
          </button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import CommunicationDispositionStatusSelector from '../../components/generic-selectors/communication-disposition-status-selector.vue'
import UserSelector from '../../components/generic-selectors/user-selector.vue'

export default {
  components: {
    CommunicationDispositionStatusSelector,
    UserSelector
  },

  props: {
    filters: {
      appointments: {
        type: Boolean,
        required: true
      },

      reminders: {
        type: Boolean,
        required: true
      },

      users: {
        type: Array,
        required: true
      },

      status: {
        type: Array,
        required: true
      }
    }
  },

  data () {
    return {
      search: {
        appointments: this.filters.appointments,
        reminders: this.filters.reminders,
        users: this.filters.users,
        status: this.filters.status
      },
      originalFilters: {}
    }
  },

  computed: {
    statuses () {
      const names = {
        [CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW]: 'Completed Reminder',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW]: 'Cancelled Reminder',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW]: 'Pending Reminder',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW]: 'Missed Reminder',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED]: 'Cancelled Appointment',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET]: 'Set Appointment',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED]: 'Completed Appointment',
        [CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_MISSED]: 'Missed Appointment',
        0: 'All'
      }

      let data = []

      if (this.search.appointments) {
        data.push(
          CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED,
          CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET,
          CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED,
          CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_MISSED
        )
      }

      if (this.search.reminders) {
        data.push(
          CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW,
          CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW,
          CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW,
          CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW
        )
      }

      return data.map(status => ({
        id: status,
        name: names[status]
      }))
    },

    filterCount () {
      let count = 0

      count += this.originalFilters.appointments ? 0 : 1
      count += this.originalFilters.reminders ? 0 : 1
      count += this.originalFilters.users.length
      count += this.originalFilters.status.length

      return count
    }
  },

  created () {
    this.originalFilters = _.clone(this.filters)
  },

  methods: {
    onUserChange (user) {
      this.search.users = user
    },

    save (close) {
      this.originalFilters = _.clone(this.search)
      this.$emit('save', this.search)

      // close modal when done
      close()
    },

    hide (close) {
      this.search = _.clone(this.originalFilters)
      this.$emit('cancel')

      close()
    },

    keepStatusConsistent () {
      const remove = []

      this.search.status.forEach((status, index) => {
        // for every selected status, check if exists in dropdown
        const exists = this.statuses.some(s => s.id === status)

        // if dont exists, means that the user deselected the option (toggler) but the status remain selected
        if (!exists) {
          remove.push(index)
        }
      })

      // remove reverse to not mess with indexes
      remove
        .reverse()
        .forEach(index => {
          this.search.status.splice(index, 1)
        })
    }
  },

  watch: {
    'search.appointments' (state) {
      if (!state) {
        this.keepStatusConsistent()
      }
    },

    'search.reminders' (state) {
      if (!state) {
        this.keepStatusConsistent()
      }
    }
  }
}
</script>
