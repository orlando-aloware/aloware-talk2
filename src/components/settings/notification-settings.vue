<template>
  <b-container>
    <b-form>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Communication Notifications</h5>
            <p class="form-helper-text">Notify this user when the following communication occurs:</p>
          </div>

          <b-form-group
            label=""
            v-slot="{ ariaDescribedby }"
          >
            <b-form-checkbox-group
              v-model="selected"
              :options="communicationNotificationOptions"
              :aria-describedby="ariaDescribedby"
              switches
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Account Level Notifications (Admins Only)</h5>
            <p class="form-helper-text">Receive daily emails for account activity:</p>
          </div>

          <b-form-group
            label=""
            v-slot="{ ariaDescribedby }"
          >
            <b-form-checkbox-group
              v-model="selected"
              :options="communicationNotificationOptions"
              :aria-describedby="ariaDescribedby"
              switches
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Event Notifications</h5>
            <p class="form-helper-text">Notify this user when the following appointment or reminder event occurs:</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              It is created
            </b-form-checkbox>
          </b-form-group>
          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              One minute before
            </b-form-checkbox>
          </b-form-group>
          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Fifteen minutes before
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              One hour before
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              One day before
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Line Notifications</h5>
            <p class="form-helper-text">Get extra notifications from the lines you choose below.</p>
          </div>

          <b-form-group
            label=""
            v-slot="{ ariaDescribedby }"
          >
            <b-form-checkbox-group
              v-model="selected"
              :options="communicationNotificationOptions"
              :aria-describedby="ariaDescribedby"
              switches
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Notification Channels</h5>
            <p class="form-helper-text">Choose what channels you want this user to get notified on.</p>
          </div>

          <b-form-group
            label=""
            v-slot="{ ariaDescribedby }"
          >
            <b-form-checkbox-group
              v-model="selected"
              :options="communicationNotificationOptions"
              :aria-describedby="ariaDescribedby"
              switches
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
export default {
  name: 'notification-settings',

  data () {
    return {
      user: {
        first_name: '',
        last_name: ''
      },
      showPasswordFields: false,
      selected: '',
      options: [
        { text: 'Admin', value: '1' },
        { text: 'Agent', value: '2' }
      ],
      communicationNotificationOptions: [
        { text: 'Call to personal line or to the ring groups this user belongs to', value: '1' },
        { text: 'Text message to personal line or to the ring groups this user belongs to', value: '2' },
        { text: 'Voicemail to personal line or to the ring groups this user belongs to', value: '3' },
        { text: 'When this user is mentioned', value: '4' },
        { text: 'When an appointment is assigned to this user', value: '5' },
        { text: 'When a reminder is assigned to this user', value: '6' }
      ]
    }
  }
}
</script>
