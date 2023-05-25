<template>
  <q-btn-toggle class="mx-2 mt-2 mb-1 custom-toggle-button"
                dense
                no-caps
                unelevated
                :options="options"
                v-model="mode">
    <template v-for="option in options"
              v-slot:[option.slot]>
      <div class="options"
           :key="option.slot">
        <span :class="['text-left task-status-name p-2', viewMode === option.value ? 'text-white' : 'text-grey-90']">
          {{ option.name }}
        </span>
      </div>
    </template>
  </q-btn-toggle>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'wallboard-view-mode-button',

  computed: {
    ...mapGetters('wallboard', {
      viewMode: 'getViewMode'
    }),

    options () {
      return [
        {
          slot: 'one',
          value: 'comfort',
          name: 'Comfort'
        },
        {
          slot: 'two',
          value: 'compact',
          name: 'Compact'
        }
      ]
    }
  },

  data: () => ({
    mode: null
  }),

  mounted () {
    this.mode = this.viewMode
  },

  methods: {
    ...mapMutations('wallboard', {
      setViewMode: 'SET_VIEW_MODE'
    })
  },

  watch: {
    mode (value) {
      this.setViewMode(value)
    }
  }
}
</script>
