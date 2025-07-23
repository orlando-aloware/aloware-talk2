<template>
  <div class="alw-contact-info-time">
    <span class="material-icons" data-testid="contact-info-schedule-span">
      schedule
    </span>
    <digital-clock
      :timezone="timezone"
      class="ml-2"
      data-testid="contact-info-digital-clock"
    />
  </div>
</template>

<script>
import DigitalClock from 'components/digital-clock'

export default {
  name: 'contact-info-time',
  components: {
    DigitalClock
  },
  props: {
    timezone: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.alw-contact-info-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
