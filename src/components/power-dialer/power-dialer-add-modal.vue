<template>
  <q-dialog
    transition-show="jump-down"
    v-model="dialog">
    <q-card
      flat
      style="width: 400px; max-width: 90vw; min-height: 500px;"
      class="my-card py-2 px-2">
      <b-overlay :show="loading">
        <q-card-section class="row items-center q-pb-none">
          <h2>Power Dialer Task Options</h2>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div>
            You're converting <strong>{{ params.contact_ids ? params.contact_ids.length : 0 }} contacts</strong> into a Power Dialer task and adding it to your queue.
          </div>
        </q-card-section>

        <hr>

        <q-card-section>
          <label class="label mb-1 text-weight-bold">
            Conversion Options
          </label>

          <b-form-checkbox
            :value="option.value"
            v-model="conversion"
            v-for="option in options.conversion"
            :key="option.value">
            {{ option.text }}
            <information-circle-icon
              color="#2F80ED"
              v-if="option.helper"/>
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              v-if="option.helper">
              {{ option.helper }}
            </q-tooltip>
          </b-form-checkbox>
        </q-card-section>

        <q-card-section>
          <!-- Where to add -->
        </q-card-section>

        <q-card-section>
          <!-- Confirm button -->
        </q-card-section>
      </b-overlay>
    </q-card>
  </q-dialog>
</template>

<script>
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'PowerDialerAddModal',

  components: {
    InformationCircleIcon
  },

  data: () => ({
    dialog: false,
    loading: false,
    params: {},
    conversion: [],
    where: null,
    options: {
      conversion: [
        {
          value: 1,
          text: 'Turn multiple numbers into separated tasks',
          helper: 'Any non-primary numbers of a contact will be turned into separate tasks'
        }, {
          value: 2,
          text: 'Don\'t add duplicate phone numbers',
          helper: 'If unselected, duplicate numbers will be turned into separate tasks'
        }, {
          value: 3,
          text: 'Don\'t add international phone numbers'
        }
      ],
      where: [
        {
          value: 4,
          text: 'In queue',
          description: 'Default'
        }, {
          value: 5,
          text: 'Scheduled',
          description: 'If you want to call these contacts at a later time'
        }
      ]
    }
  }),

  mounted () {
    this.$VueEvent.listen('open_power_dialer_modal_options', (data) => {
      this.params = data
      this.dialog = true
    })
  }
}
</script>
