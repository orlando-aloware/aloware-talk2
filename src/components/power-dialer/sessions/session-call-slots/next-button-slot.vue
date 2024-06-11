<template>
  <div>
    <slot>
      <q-btn class="sessions-button my-1 ml-1 free-width"
             size="sm"
             no-wrap
             no-caps
             unelevated
             outline
             :class="canNextTask ? 'border border-danger' : ''"
             :color="canNextTask ? 'grey-4' : 'grey-8'"
             :disabled="!canNextTask"
             @click="nextTask">
        <PlayBarIcon class="mr-1"
                     :color="canNextTask ? '#FF3B3B' : '#62666E'"
        />
        <div class="text-body2" :class="canNextTask ? 'text-red-7' : 'white'">Next</div>
      </q-btn>
    </slot>
  </div>
</template>

<script>
import PlayBarIcon from 'components/icons/play-bar-icon.vue'

export default {
  name: 'NextButtonSlot',
  components: {
    PlayBarIcon
  },
  props: ['canNextTask', 'onNextTask'],
  methods: {
    nextTask () {
      this.$emit('onNextTask')
    }
  }
}
</script>
