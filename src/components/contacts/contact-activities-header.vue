<template>
  <div class="calls-header d-flex justify-content-between">
    <div class="calls-header__label">
      {{ label }}
    </div>
   <div class="mr-1">
     <q-btn
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none mr-2"
       v-if="hasUnreads"
       @click="$emit('markAllAsRead')">
      <span class="mx-2">
        Mark All as Read ({{ unreadCount }})
      </span>
     </q-btn>
     <q-btn
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none">
       <q-tooltip anchor="top middle"
                  self="center middle">
         Move to Pending
       </q-tooltip>
      <span class="mx-2">
        <timer-o-icon></timer-o-icon>
      </span>
     </q-btn>
     <q-btn
       borderless
       flat
       no-caps
       type="a"
       color="primary"
       class="text-decoration-none">
       <q-tooltip anchor="top middle"
                  self="center middle">
         Close
       </q-tooltip>
      <span class="mx-2">
        <check-o-icon></check-o-icon>
      </span>
     </q-btn>
   </div>
  </div>
</template>

<script>
import TimerOIcon from 'components/icons/timer-o-icon'
import CheckOIcon from 'components/icons/check-o-icon'
export default {
  name: 'contact-activities-header',
  components: { CheckOIcon, TimerOIcon },
  props: {
    label: {
      type: String,
      required: true
    },
    hasUnreads: {
      type: Boolean,
      required: false,
      default: false
    },
    unreadCount: {
      type: Number,
      required: false,
      default: 0
    }
  }
}
</script>
