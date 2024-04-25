<template>
  <div>
    <q-select class="inline-select"
              input-debounce="0"
              map-options
              emit-value
              disable
              option-value="value"
              option-label="text"
              behavior="menu"
              v-model="contact.text_authorized"
              data-testid="tcpa-selector"
              :options="options"/>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'tcpa-selector',
  data () {
    return {
      options: [{ 'value': 1, 'text': 'Yes' }, { 'value': 0, 'text': 'No' }]
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.countries
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.options.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    onUpdate () {
      talk2Api.V1.contact.update(this.contact.id, { 'text_authorized': this.contact.text_authorized }).then(response => {
        if (response.data.id === this.contact.id) {
          this.setContact(response.data)
        }
      })
    }
  },
  watch: {
    'contact.text_authorized': function () {
      this.onUpdate()
    }
  }
}
</script>
