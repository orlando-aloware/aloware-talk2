<template>
  <div class="calendar__filters">
    <b-button class="btn-white d-flex align-items-center"
              size="sm"
              variant="light"
              v-b-modal.calendar-filters-modal>
      Filters
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
        <generic-multi-select buttonText="'All'"
                              :values="search.statuses"
                              :options="statuses">
        </generic-multi-select>

        <!-- Users -->
      </q-card>

      <template #modal-footer="{ cancel, ok }">
        <div class="d-flex w-100">
          <div class="flex-grow-1"></div>
          <button class="btn btn-sm btn-default mr-2"
                  @click="cancel()">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary mr-2"
                  @click="save(ok)">
            Apply Filters
          </button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import GenericMultiSelect from '../../components/generic-selectors/generic-multi-select'

export default {
  components: {
    GenericMultiSelect
  },

  data: () => ({
    search: {
      appointments: true,
      reminders: true,
      statuses: [],
      users: []
    }
  }),

  computed: {
    statuses () {
      let data = []

      if (this.search.appointments) {
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED)
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET)
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED)
      }

      if (this.search.reminders) {
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW)
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW)
        data.push(CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW)
      }

      return data
    }
  },

  methods: {
    save (close) {
      this.$emit('input', this.search)

      // close modal when done
      close()
    }
    // getFiltersCount
  }
}
</script>
