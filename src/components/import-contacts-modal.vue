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
            Aloware uses phone numbers as a unique identifier for contacts. If
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
              Don’t add contact from this list if existing Aloware contact has
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
              Replace Aloware contact if contact from this list has same phone
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
              Merge contacts from this list with any Aloware contact that shares
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
export default {
  components: {},
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

<style lang="scss">
@import '../css/mixins';
@import '../css/variables';
@import '../css/breakpoints';
.import-modal {
  .modal-content {
    border-radius: 0;
  }
  .modal-body {
    padding: 0;
  }
  .modal-header {
    color: $white;
    background-color: $dark;
    border-bottom-color: $dark;
    border-radius: 0;
    padding: 15px;
    .close {
      color: $white;
    }
  }
}

.btn-prev {
  width: 100px;
  background-color: transparent;
  border-color: $green;
  &:hover {
    background-color: darken($green, 5%);
  }
}

.btn-next {
  width: 100px;
  background-color: $green;
  &:hover {
    background-color: darken($green, 5%);
  }
}

.select-columns {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  position: relative;
}

.select-columns-alert {
  font-size: 13px;
  padding: 15px;
  width: 100%;
  &--success {
    border: solid 1px $green;
    background-color: $light-green2;
  }
  &--dark {
    border: solid 1px $dark;
    background-color: lighten($dark, 80%);
  }
}

.table-holder {
  max-height: 300px;
  max-width: calc(100% -1px);
  overflow: auto;
  table {
    border-collapse: separate;
    border-spacing: 0;
    // word-break: break-all;
  }

  th {
    min-width: 100px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    position: sticky;
    top: 0;
    background-color: $white;
    border-bottom-width: 1px !important;
  }

  tr:first-child td {
    border-top: none;
  }

  td {
    min-width: 100px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.import-content {
  min-height: calc(100vh - 155px);

  @include screen('lg') {
    min-height: 500px;
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.import-dropzone {
  flex-grow: 1;
  height: 100%;
  width: 100%;
  border: dashed 1px $green;
  display: flex;
  align-items: center;
  justify-content: center;

  &-link {
    color: $green;
    font-weight: bold;
  }

  &-text {
    color: $grey-2;
    font-size: 14px;
  }

  &-content {
    text-align: center;
  }

  .btn-upload {
    background-color: $green;
    &:hover {
      background-color: darken($green, 5%);
    }
  }
}

.import-steps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom-width: 3px;
    border-bottom-style: solid;
    border-bottom-color: $grey-light;
    flex-grow: 1;
    cursor: pointer;

    &--active {
      border-color: $green !important;
      background-color: $green !important;
    }

    &--active & {
      &__number {
        color: $white !important;
        border-color: $white !important;
      }
      &__title {
        color: $white !important;
      }
    }

    &--done {
      border-color: $green;
    }

    &--done & {
      &__number {
        color: $black;
        border-color: $green;
      }
      &__title {
        color: $black;
      }
    }

    &__number {
      width: 30px;
      height: 30px;

      @include screen('lg') {
        width: 40px;
        height: 40px;
      }

      border-radius: 50%;
      border: solid 3px $grey-light;
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
      justify-content: center;
      margin-bottom: 5px;
      color: $grey-light;
    }

    &__inner {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      flex-grow: 1;
      padding-top: 10px;
      padding-bottom: 10px;
      transition: background-color 100ms ease-in-out;
    }

    &__title {
      display: none;
      font-weight: bold;
      color: $grey-light;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @include screen('md') {
        display: block;
        font-size: 10px;
      }

      @include screen('lg') {
        display: block;
        font-size: 14px;
      }
    }
  }

  &__item:last-child {
    border-right: none;
  }
}
</style>
