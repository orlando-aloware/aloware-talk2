<template>
  <div class="border-0 p-0 w-100">
    <div class="w-100">
      <div class="pb-2">
        <q-btn no-caps
               unelevated
               size="md"
               class="btn-filter-wrapper border btn-outlined-light"
               :loading="loading"
               :disable="loading"
               data-testid="open-calendar-button"
               @click="openCalendar">
          <template v-slot>
            <div class="mx-2 px-1 text-nowrap d-flex align-items-center">
              <calendar-icon-outlined class="mr-1" />
              <span class="ml-1">
                Open Calendar
              </span>
            </div>
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import CalendarIconOutlined from 'components/icons/calendar-icon-outlined'
import { mapState } from 'vuex'
import { classicMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'open-calendar-button',

  components: {
    CalendarIconOutlined
  },

  mixins: [
    classicMixin,
    simpsocialMixin
  ],

  props: {
    communicationId: {
      required: true
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  data () {
    return {
      loading: false
    }
  },

  methods: {
    openCalendar () {
      // redirect to Classic only if talk isn't enabled
      const url = this.currentCompany.talk_enabled ? '' : this.getClassicURL(this.isSimpSocial)

      window.open(`${url}/calendar?communication_id=${this.communicationId}&view=month`)
    }
  }
}
</script>
