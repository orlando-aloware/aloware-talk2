<template>
  <b-container>
    <b-form>
      <b-form-row class="mt-4">
        <b-col sm="12" md="6">
          <b-form-group
            label="First Name"
            class="form-label"
          >
            <b-form-input
              id="input-1"
              v-model="user.first_name"
              type="text"
              placeholder="First Name"
              required>

            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Last Name"
          >
            <b-form-input
              id="input-1"
              v-model="user.last_name"
              type="text"
              placeholder="Last Name"
              required>
            </b-form-input>
          </b-form-group>
        </b-col>

        <b-col
          sm="12"
          md="12">
          <b-form-group
            class="form-label"
            label="Description (Optional)"
          >
            <b-form-textarea
              id="textarea"
              v-model="user.description"
              placeholder="Enter something..."
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </b-form-group>
        </b-col>

        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Email"
          >
            <b-form-input
              v-model="user.email"
              type="text"
              placeholder="name@company.com"
              required>
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12" class="d-flex justify-between">
          <div>
            <h5 class="form-label">Change Password</h5>
            <p class="form-helper-text">Toggle the switch to change password</p>
          </div>
          <b-form-group
            label=""
            class="form-label"
          >
            <b-form-checkbox switch size="lg" v-model="showPasswordFields"></b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4" v-if="showPasswordFields">
        <b-col sm="12" md="6">
          <b-form-group
            label="Password"
            class="form-label"
          >
            <b-form-input
              id="input-1"
              v-model="user.password"
              type="password"
              placeholder="New Password"
              required>

            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Password Confirmation"
          >
            <b-form-input
              id="input-1"
              v-model="user.confirm_password"
              type="text"
              placeholder="Password Confirmation"
              required>
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Role</h5>
            <p class="form-helper-text">Choose a role for this user</p>
          </div>

          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              id="radio-slots"
              v-model="selected"
              :options="options"
              :aria-describedby="ariaDescribedby"
              name="radio-options-slots"
            >
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Backup Routing (Beta)</h5>
            <p class="form-helper-text">Call routing will check if the user is online on Aloware. If you check this, the backup phone number will ring if your not available.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Use phone number as backup.
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <hr/>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Text Message Handling (Beta)</h5>
            <p class="form-helper-text">If you don't want this user to be assigned to text messages please uncheck "Answers text messages."</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Answers text messages
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
export default {
  name: 'profile-settings',

  data () {
    return {
      user: {
        first_name: '',
        last_name: ''
      },
      showPasswordFields: false,
      selected: '',
      status: '',
      options: [
        { text: 'Admin', value: '1' },
        { text: 'Agent', value: '2' }
      ]
    }
  }
}
</script>
