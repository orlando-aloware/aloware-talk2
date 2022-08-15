<template>
  <q-dialog v-model="isOpen">
    <q-card>
      <q-form class="appointment-form"
              ref="appointmentForm"
              @submit.prevent="onSubmit">
        <q-card-section>
          <h2>Sad to see you go! 😢</h2>
        </q-card-section>
        <q-card-section>
          <div>
            Please select a reason as to why you are choosing to switch back to Aloware Classic (Talk1):
          </div>
          <q-field label="Name"
                   stack-label>
            <div class="q-gutter-sm">
              <q-radio v-model="reason"
                      :val="1"
                      label="I am just playing around" />
              <q-radio v-model="reason"
                      :val="2"
                      label="How to communicate with my contacts" />
              <q-radio v-model="reason"
                      :val="3"
                      label="How to use he Power Dialer" />
              <q-radio v-model="reason"
                      :val="4"
                      label="How to find my contacts" />
              <q-radio v-model="reason"
                      :val="5"
                      label="Other, please specify:" />

              <q-field>
                <q-input type="textarea"
                        v-if="reason == 5"
                        v-model="explanation" />
              </q-field>

              <q-radio v-model="reason"
                      :val="6"
                      label="I am experiencing glitches/bugs in Talk2" />
              <q-radio v-model="reason"
                      :val="7"
                      label="Talk2 is slower than Aloware Classic" />
              <q-radio v-model="reason"
                      :val="8"
                      label="I don't like Talk2" />
              <q-radio v-model="reason"
                      :val="9"
                      label="Other, please specify:" />

              <q-field>
                <q-input type="textarea"
                        v-if="reason == 9"
                        v-model="explanation" />
              </q-field>
            </div>
          </q-field>
        </q-card-section>
        <q-card-action>
          <q-btn type="submit">Send and go classic</q-btn>
        </q-card-action>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      reason: 1,
      explanation: ''
    }
  },
  methods: {
    onSubmit () {
      return null
    },
    resetForm () {
      return null
    }
  }
}
</script>

<style>

</style>
