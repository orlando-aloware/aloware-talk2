<template>
  <b-modal
    v-model="isOpen"
    size="xl"
    title="Import Wizard Modal"
    scrollable
    modal-class="import-modal"
    hide-footer
    centered
  >
    <div class="import-steps">
      <div
        class="import-steps__item"
        @click="onClickNext(1)"
        :class="{
          'import-steps__item--active': active === 1,
          'import-steps__item--done': done.includes(1)
        }"
      >
        <div class="import-steps__item__inner">
          <div
            class="import-steps__item__number"
            :class="{ 'animated animate__bounceIn': active === 1 }"
          >
            1
          </div>
          <div class="import-steps__item__title">Upload CSV</div>
        </div>
      </div>
      <div
        class="import-steps__item"
        @click="onClickNext(2)"
        :class="{
          'import-steps__item--active': active === 2,
          'import-steps__item--done': done.includes(2)
        }"
      >
        <div class="import-steps__item__inner">
          <div
            class="import-steps__item__number"
            :class="{ 'animated animate__bounceIn': active === 2 }"
          >
            2
          </div>
          <div class="import-steps__item__title">Select Columns</div>
        </div>
      </div>
      <div
        class="import-steps__item"
        @click="onClickNext(3)"
        :class="{
          'import-steps__item--active': active === 3,
          'import-steps__item--done': done.includes(3)
        }"
      >
        <div class="import-steps__item__inner">
          <div
            class="import-steps__item__number"
            :class="{ 'animated animate__bounceIn': active === 3 }"
          >
            3
          </div>
          <div class="import-steps__item__title">Review Data</div>
        </div>
      </div>
      <div
        class="import-steps__item"
        @click="onClickNext(4)"
        :class="{
          'import-steps__item--active': active === 4,
          'import-steps__item--done': done.includes(4)
        }"
      >
        <div class="import-steps__item__inner">
          <div
            class="import-steps__item__number"
            :class="{ 'animated animate__bounceIn': active === 4 }"
          >
            4
          </div>
          <div class="import-steps__item__title">Settings</div>
        </div>
      </div>
      <div
        class="import-steps__item"
        @click="onClickNext(5)"
        :class="{
          'import-steps__item--active': active === 5,
          'import-steps__item--done': done.includes(5)
        }"
      >
        <div class="import-steps__item__inner">
          <div
            class="import-steps__item__number"
            :class="{ 'animated animate__bounceIn': active === 5 }"
          >
            5
          </div>
          <div class="import-steps__item__title">Finish</div>
        </div>
      </div>
    </div>
    <div class="import-content">
      <div class="import-dropzone animated animate__fadeIn" v-if="active === 1">
        <div class="import-dropzone-content">
          <div class="import-dropzone-text mb-2">
            Drop your csv file here or
          </div>
          <button class="btn btn-success btn-upload mb-4">
            <i class="fa fa-upload"></i> Upload From Computer
          </button>

          <div class="import-dropzone-text mb-2 small">
            To get started with a template, click the link below
          </div>

          <div class="import-dropzone-link mb-2 small">
            <i class="fa fa-download"></i> Download Contacts Template
          </div>
        </div>
      </div>

      <div class="select-columns" v-if="active === 2">
        <div class="select-columns-alert select-columns-alert--success mb-3">
          <div class="font-weight-bold">
            1. First 10 Contacts in Your List look good
          </div>
          <div>
            We’ve fetched and analyzed the first 10 rows in your file and merged
            all phone numbers in the first column. Everything looks good.
          </div>
        </div>

        <div class="flex-grow-1 table-holder mb-3">
          <table class="table table-striped small table-sm">
            <thead>
              <tr>
                <th>Phone Numbers</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Notes</th>
                <th>City</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Notes</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in contacts" :key="item">
                <td>Phone Numbers</td>
                <td>First Name</td>
                <td>Last Name</td>
                <td>Company</td>
                <td>Email</td>
                <td>Date of Birtd</td>
                <td>Notes</td>
                <td>City</td>
                <td>Email</td>
                <td>Date of Birtd</td>
                <td>Notes</td>
                <td>City</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="select-columns-alert select-columns-alert--dark">
          <div class="font-weight-bold">
            2. Decide What happens If duplicates exist
          </div>
          <div>
            {{ whiteLabelText }} phone numbers as a unique identifier for contacts. If
            contacts share the same primary phone number, how do you wnat to
            handle them?
          </div>
        </div>

        <div class="px-2 py-4">
          <div class="mb-1 small">
            <b-form-radio
              id="checkbox-1"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Don’t add contact from this list if existing {{ whiteLabelContactText }} contact has
              same phone number
            </b-form-radio>
          </div>

          <div class="mb-1 small">
            <b-form-radio
              id="checkbox-1"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Replace {{ whiteLabelContactText }} contact if contact from this list has same phone
              number
            </b-form-radio>
          </div>

          <div class="mb-1 small">
            <b-form-radio
              id="checkbox-1"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Merge contacts from this list with any {{ whiteLabelContactText }} contact that shares
              the same phone number
            </b-form-radio>
          </div>
        </div>

        <div slot="modal-footer">
          <div class="d-flex align-items-center border-top pt-3">
            <button class="btn btn-outline-success btn-prev">
              <i class="fa fa-chevron-left"></i> Back
            </button>
            <div class="flex-grow-1"></div>
            <button class="btn btn-success btn-next">
              Next <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  mixins: [simpsocialMixin],
  computed: {
    whiteLabelText () {
      return this.isSimpsocial ? 'Uses' : 'Aloware uses'
    },

    whiteLabelContactText () {
      return this.isSimpsocial ? '' : 'Aloware'
    }
  },
  methods: {
    open () {
      this.isOpen = true
    },

    close () {
      this.isOpen = false
    },

    onClickNext (nextStep) {
      this.done = [...new Set(this.done).add(nextStep - 1)]
      this.active = nextStep
    }
  },
  data () {
    return {
      isOpen: false,
      done: [],
      active: 1,
      contacts: Array.from(new Array(100))
    }
  }
}
</script>
