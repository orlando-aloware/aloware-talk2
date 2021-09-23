<template>
  <b-container>
    <b-form>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Focus Mode</h5>
            <p class="form-helper-text">Only show me contacts that are assigned to me.</p>
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
            <h5 class="form-label">Available by Default, But Allow Manual Changes</h5>
            <p class="form-helper-text">Put user on available status after login and disable idle mode detection (auto offline).</p>
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
            <h5 class="form-label">Wrap up duration</h5>
            <p class="form-helper-text">Stay on wrap up for this amount of time before you go back to available for the next call.</p>
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
    </b-form>
  </b-container>
</template>

<script>
export default {
  name: 'personalization',

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
