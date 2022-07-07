<template>
  <b-modal dialog-class="modal-pd-add"
           hide-footer
           v-model="dialog">
    <template #modal-title>
      <h2>Power Dialer Task Options</h2>
    </template>
    <q-card class="my-card"
            flat>
      <b-overlay :show="loading">
        <div>
          You're converting <strong>{{ contactsDescription }}</strong> into a Power Dialer task and adding it to your queue.
        </div>

        <hr>

        <label class="label mb-1 text-weight-bold">
          Conversion Options
        </label>
        <b-form-checkbox class="mb-2"
                         :value="option.value"
                         :key="option.value"
                         v-model="conversion"
                         v-for="option in options.conversion">
          {{ option.text }}
          <information-circle-icon color="#2F80ED"
                                   v-if="option.helper"/>
          <q-tooltip anchor="top middle"
                     self="bottom middle"
                     v-if="option.helper">
            {{ option.helper }}
          </q-tooltip>
        </b-form-checkbox>

        <hr>

        <label class="label mb-1 text-weight-bold">
          Where do you want to add these tasks?
        </label>
        <b-form-radio class="mb-2"
                      :value="option.value"
                      :key="option.value"
                      v-model="where"
                      v-for="option in options.where">
          {{ option.text }} - <span style="color: var(--gray);">{{ option.description }}</span>
        </b-form-radio>
        <date-picker mode="dateTime"
                     title-position="left"
                     color="blue"
                     :min-date="new Date()"
                     :masks="masks"
                     :popover="popover_config"
                     v-model="schedule"
                     v-if="where === 'scheduled'">
            <template v-slot="{ inputValue, inputEvents }">
                <div class="ml-4 text-sm">
                  <small class="text-grey">
                    Scheduled time:
                  </small>
                  <br>
                  <input class="px-2 py-1 border rounded text-grey"
                         style="width: 155px"
                         :value="inputValue"
                         v-on="inputEvents"/>
                </div>
            </template>
        </date-picker>

        <b-button class="btn-block mt-4"
                  variant="primary"
                  size="sm"
                  @click="addContacts">
          Ok
        </b-button>
      </b-overlay>
    </q-card>
  </b-modal>
</template>

<script>
import InformationCircleIcon from 'components/icons/information-circle-icon'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

export default {
  name: 'PowerDialerAddModal',

  components: {
    InformationCircleIcon,
    DatePicker
  },

  data: () => ({
    dialog: false,
    loading: false,
    params: {},
    conversion: [
      'multiple',
      'duplicated'
    ],
    where: 'queue',
    schedule: new Date(),
    options: {
      conversion: [
        {
          value: 'multiple',
          text: 'Turn multiple numbers into separated tasks',
          helper: 'Any non-primary numbers of a contact will be turned into separate tasks'
        }, {
          value: 'duplicated',
          text: 'Don\'t add duplicate phone numbers',
          helper: 'If unselected, duplicate numbers will be turned into separate tasks'
        }, {
          value: 'international',
          text: 'Don\'t add international phone numbers'
        }
      ],
      where: [
        {
          value: 'queue',
          text: 'In queue',
          description: 'Default'
        }, {
          value: 'scheduled',
          text: 'Scheduled',
          description: 'If you want to call these contacts at a later time'
        }
      ]
    },
    masks: {
      input: 'MM/DD/YYYY HH:mm'
    },
    popover_config: {
      placement: 'right'
    }
  }),

  computed: {
    contactsDescription () {
      let count = this.params.contact_ids ? this.params.contact_ids.length : 0

      return count + (count === 1 ? ' contact' : ' contacts')
    }
  },

  mounted () {
    this.$VueEvent.listen('open_power_dialer_modal_options', (data) => {
      console.log(data)
      this.params = data
      this.dialog = true
    })
  },

  methods: {
    addContacts () {
      console.log(this.params)
    }
  }
}
</script>

<style>
.modal-pd-add {
  width: 420px;
  max-width: 90vw;
}
</style>
