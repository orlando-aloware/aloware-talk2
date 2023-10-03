<template>
  <div class="calendar__helper">
    <b-button id="calendar-helper"
              size="sm"
              variant="light"
              class="btn-white d-flex align-items-center">
      <i class="large material-icons mr-1">help_outline</i>
      Help
    </b-button>
    <b-popover custom-class="calendar__helper__popover"
               placement="bottomleft"
               target="calendar-helper"
               title="Event Legends"
               width="280"
               triggers="click blur">
      <table class="w-100">
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-12 status-11"></i></td>
          <td>Upcoming Appointment</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-12 status-8 is_past"></i></td>
          <td>Past Appointment</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-12 status-9"></i></td>
          <td>Completed Appointment</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-12 status-10"></i></td>
          <td><s>Canceled Appointment</s></td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-12 status-14"></i></td>
          <td>Missed Appointment</td>
        </tr>
        <tr>
          <td colspan="2"><hr/></td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-13 status-8"></i></td>
          <td>Upcoming Reminder</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-13 status-8 is_past"></i></td>
          <td>Past Reminder</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-13 status-4"></i></td>
          <td>Completed Reminder</td>
        </tr>
        <tr>
          <td class="pr-2"><i class="fas fa-square event-color-type-13 status-5"></i></td>
          <td><s>Canceled Reminder</s></td>
        </tr>
      </table>
    </b-popover>
  </div>
</template>
