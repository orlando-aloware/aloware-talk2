<template>
  <q-dialog v-model="isOpen">
    <q-card>
      <q-form class="appointment-form"
              ref="appointmentForm"
              @submit.prevent="onSubmit">
        <q-card-section class="bg-blue-80">
          <h2 class="text-grey-1">Sad to see you go! 😢</h2>
        </q-card-section>
        <q-card-section>
          <div>
            <h2>
              Please select a reason as to why you are choosing to switch back to Aloware Classic (Talk1):
            </h2>
          </div>
          <div class="q-gutter-sm">
            <q-item class="py-0 mb-0 text-weight-bold">
              <q-radio v-model="reason"
                      :val="1"
                      label="I am just playing around 🕹️" />
            </q-item>
            <div class="my-2 py-0 text-weight-bold">
              <span class="ml-3 mr-2">-</span>
              <span>I don't understand how to use Talk2</span>
            </div>
            <div class="pl-2 pt-0 mt-0">
              <q-item class="my-0 py-0 text-weight-medium">
                <q-radio v-model="reason"
                        :val="2"
                        label="How to communicate with my contacts 💬" />
              </q-item>
              <q-item class="my-0 py-0 text-weight-medium">
                <q-radio v-model="reason"
                        :val="3"
                        label="How to use the Power Dialer 📱" />
              </q-item>
              <q-item class="my-0 py-0 text-weight-medium">
                <q-radio v-model="reason"
                        :val="4"
                        label="How to find my contacts 👤" />
              </q-item>
              <q-item class="my-0 py-0 text-weight-medium">
                <q-radio v-model="reason"
                        :val="5"
                        label="Other ..." />
              </q-item>
              <div class="ml-4"
                   v-if="reason == 5">
                <p>Please specify:</p>
                <q-input type="textarea"
                         outlined
                         v-model="explanations[0]" />
              </div>
            </div>
            <q-item class="py-0 my-0 text-weight-bold">
              <q-radio v-model="reason"
                      :val="6"
                      label="I am experiencing glitches/bugs in Talk2 💻" />
            </q-item>
            <q-item class="py-0 my-0 text-weight-bold">
              <q-radio v-model="reason"
                      :val="7"
                      label="Talk2 is slower than Aloware Classic 🐢" />
            </q-item>
            <q-item class="py-0 my-0 text-weight-bold">
              <q-radio v-model="reason"
                      :val="8"
                      label="I don't like Talk2 💔" />
            </q-item>
            <q-item class="pb-0 my-0 text-weight-bold">
              <q-radio v-model="reason"
                      :val="9"
                      label="Other ..." />
            </q-item>
            <div class="ml-4"
                 v-if="reason == 9">
              <p>Please specify:</p>
              <q-input type="textarea"
                       outlined
                       v-model="explanations[1]" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white">
          <q-btn type="submit"
                 class="px-2 py-1 mr-auto"
                 flat
                 color="secondary"
                 @click="closeDialog">Stay in Talk 🥳</q-btn>
          <q-btn type="submit"
                 class="px-2 py-1"
                 flat
                 color="primary"
                 @click="onSubmit">Send and go classic</q-btn>
        </q-card-actions>
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
      explanations: [
        '',
        ''
      ]
    }
  },
  methods: {
    onSubmit () {
      this.$emit('submit')
    },
    resetForm () {
      return null
    },
    closeDialog () {
      this.$emit('toggle')
    }
  }
}
</script>

<style>

</style>
