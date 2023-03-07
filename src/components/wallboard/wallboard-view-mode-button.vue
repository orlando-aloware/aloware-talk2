<template>
  <b-form-group>
      <b-form-radio-group buttons
                          button-variant="outline-primary"
                          :options="options"
                          v-model="mode"
                          @change="onChange"/>
  </b-form-group>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'wallboard-view-mode-button',

  computed: {
    ...mapGetters('wallboard', {
      viewMode: 'getViewMode'
    }),

    options () {
      return [
        {
          text: 'Comfort',
          value: 'comfort'
        },
        {
          text: 'Compact',
          value: 'compact'
        }
      ]
    }
  },

  data () {
    return {
      mode: null
    }
  },

  mounted () {
    this.mode = this.viewMode
  },

  methods: {
    ...mapActions('wallboard', [
      'setViewMode'
    ]),

    onChange (value) {
      this.setViewMode(value)
    }
  }
}
</script>
