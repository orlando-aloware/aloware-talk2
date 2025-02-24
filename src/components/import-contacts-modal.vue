<template>
  <b-modal size="xl"
           title="Import Wizard"
           scrollable
           modal-class="import-modal"
           centered
           data-testid="import-contacts-modal"
           v-model="isOpen">
    <div class="import-steps">
      <div class="import-steps__item cursor-default"
           data-testid="import-step-1"
           :class="{
             'import-steps__item--active': currentStep === STEPS.DNC_AGREEMENT,
             'import-steps__item--done': done.includes(STEPS.DNC_AGREEMENT)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                 'animated animate__bounceIn': currentStep === STEPS.DNC_AGREEMENT
               }">
            1
          </div>
          <div class="import-steps__item__title">DNC Agreement</div>
        </div>
      </div>
      <div class="import-steps__item cursor-default"
           data-testid="import-step-2"
           :class="{
             'import-steps__item--active': currentStep === STEPS.CSV_UPLOAD,
             'import-steps__item--done': done.includes(STEPS.CSV_UPLOAD)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                 'animated animate__bounceIn': currentStep === STEPS.CSV_UPLOAD
               }">
            2
          </div>
          <div class="import-steps__item__title">Upload CSV</div>
        </div>
      </div>
      <div class="import-steps__item cursor-default"
           data-testid="import-step-3"
           :class="{
             'import-steps__item--active': currentStep === STEPS.SELECT_COLUMNS,
             'import-steps__item--done': done.includes(STEPS.SELECT_COLUMNS)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                'animated animate__bounceIn': currentStep === STEPS.SELECT_COLUMNS
              }">
            3
          </div>
          <div class="import-steps__item__title">Select Columns</div>
        </div>
      </div>
      <div class="import-steps__item cursor-default"
           data-testid="import-step-4"
           :class="{
             'import-steps__item--active': currentStep === STEPS.REVIEW_DATA,
             'import-steps__item--done': done.includes(STEPS.REVIEW_DATA)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                 'animated animate__bounceIn': currentStep === STEPS.REVIEW_DATA
               }">
            4
          </div>
          <div class="import-steps__item__title">Review Data</div>
        </div>
      </div>
      <div class="import-steps__item cursor-default"
           data-testid="import-step-5"
           :class="{
            'import-steps__item--active': currentStep === STEPS.SETTINGS,
             'import-steps__item--done': done.includes(STEPS.SETTINGS)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                 'animated animate__bounceIn': currentStep === STEPS.SETTINGS
                }">
            5
          </div>
          <div class="import-steps__item__title">Settings</div>
        </div>
      </div>
      <div class="import-steps__item cursor-default"
           data-testid="import-step-6"
           :class="{
             'import-steps__item--active': currentStep === STEPS.FINISHED,
             'import-steps__item--done': done.includes(STEPS.FINISHED)
           }">
        <div class="import-steps__item__inner">
          <div class="import-steps__item__number"
               :class="{
                 'animated animate__bounceIn': currentStep === STEPS.FINISHED
               }">
            6
          </div>
          <div class="import-steps__item__title">Finish</div>
        </div>
      </div>
    </div>
    <div class="import-content justify-content-start"
         data-testid="import-contacts-dnc-agreement"
         v-if="currentStep === STEPS.DNC_AGREEMENT">
      <div class="select-columns-alert select-columns-alert--success mb-5 d-flex align-items-center">
        <information-circle-icon class="cursor-pointer"
                                 width="33"
                                 height="33" />
        <div>
          <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                           size="sm"
                           v-model="isDncAgreed">
            <strong>DNC Agreement</strong> - You verify this list does not
            contain any phone numbers found in the United States DNC (Do Not
            Call) List or your own DNC records.
          </b-form-checkbox>
          <ul class="mt-1">
            <li>
              Organizations that contact phone numbers whose owners have
              requested DNC status may run the risk of legal action.
            </li>
            <li>To avoid compliance risks, we recommend reviewing your contact
              lists before importing them.
                <span v-if="!isSimpSocial">For more information, refer to our
                  <a href="https://support.aloware.com/en/articles/9032126-understanding-the-dnc-do-not-call-list" target="_blank">
                    DNC Knowledge Base article
                  </a>.
                </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="w-100 text-center">
        <h1>You must agree to the DNC Agreement above before importing.</h1>
        <p class="mt-3">
          Want to test, but don't have a clean list? Agree to the terms above,
          download, and then upload this example list to test import process.
        </p>
        <a class="import-dropzone-link mb-2"
           data-testid="download-contacts-template"
           target="_blank"
           :href="`${apiUrl}/templates/Contacts-Template.csv`">
          <i class="fa fa-download"></i> Download Contacts Template
        </a>
      </div>
    </div>

    <div class="import-content"
         v-if="currentStep === STEPS.CSV_UPLOAD">
      <div class="import-dropzone animated animate__fadeIn">
        <div class="import-dropzone-content">
          <div class="d-flex flex-column">
            <file-uploader accepted-file-types=".csv"
                           :upload-url="importParseCsvUrl"
                           @fileUploaded="renderColumnChooser">
              <template slot="description">
                <div class="text-center mt-2 notice">
                  <p class="mb-0">Supports CSV only.</p>
                </div>
              </template>
            </file-uploader>
            <div>
              <p class="mt-3">
                To get started with a file template, click link below.
              </p>
              <a class="import-dropzone-link mb-2"
                 data-testid="download-contacts-template"
                 target="_blank"
                 :href="`${apiUrl}/templates/Contacts-Template.csv`">
                <i class="fa fa-download"></i> Download Contacts Template
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="import-content pb-0"
         v-if="currentStep === STEPS.SELECT_COLUMNS">
      <div class="select-columns-alert select-columns-alert--success mb-3">
        <div class="font-weight-bold">
          2. First 10 Contacts in Your List look good
        </div>
        <div>
          We've fetched the first 10 rows in your file so you can assign each
          columns to its appropriate property. Take Note that at least one phone
          number (separated by comma if multiple) is required to move on to the
          next step.
        </div>
      </div>

      <div class="table-responsive mb-0 h-100">
        <table class="table table-csv table-striped table-hover">
          <thead>
            <tr>
              <th></th>
              <th :key="`th-${th}`"
                  v-for="(th, i) in tableHeader">
                <!-- <el-select
                    v-model="tableHeaderValue[i]"
                    placeholder="Select proper column type"
                    class="select-table-header"
                    filterable
                    clearable
                    :data-testid="'colum-type-selector-' + i"
                    @change="tableHeaderChange">
                    <template v-if="contactFields.length">
                      <el-option-group
                        v-for="cf in contactFields"
                        :key="cf.group_name"
                        :label="cf.group_name">
                        <el-option
                          v-for="field in cf.fields"
                          :key="field.value"
                          :label="field.label"
                          :value="field.value"
                          :disabled="checkHeaderMap(field.value)">
                        </el-option>
                      </el-option-group>
                    </template>
                  </el-select> -->

                <q-select class="import-column-selector"
                          color="primary"
                          map-options
                          use-input
                          emit-value
                          dense
                          outlined
                          clearable
                          :placeholder="tableHeaderValue[i] ? '' : 'Select proper column type'"
                          :options="formattedContactFields"
                          v-model="tableHeaderValue[i]"
                          @filter="filterFn" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr :key="`tdata-${index}`"
                v-for="(row, index) in tableData"
                v-show="!(noFirstColumn && index === 0)">
              <td>
                {{ index > 0 ? index + 1 : '' }}
                <b-button href="#"
                          variant="outline-danger"
                          size="sm"
                          v-b-tooltip.hover="`Remove this first row`"
                          v-if="index === 0"
                          @click="noFirstColumn = true">
                  <i class="fa fa-trash-alt"></i>
                </b-button>
              </td>
              <td
                :key="`row-col-${index}-${i}`"
                v-for="(col, i) in row">
                {{ col }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="import-content pb-0"
         v-if="currentStep === STEPS.REVIEW_DATA">
      <b-overlay :show="loading" class="w-100">
        <div class="select-columns-alert select-columns-alert--success mb-3">
          <div class="font-weight-bold">3. Review Data</div>
          <div>
            We've fetched and analyzed the first 10 rows in your file and merged
            all phone numbers found in one column. Warnings and errors will show
            at the right most columns in the table below. Please review the
            partial rows before going to the next step.
          </div>
        </div>
        <div class="table-responsive container-table-csv mb-0">
          <table class="table table-csv table-striped"
                 v-if="reviewData.length > 0">
            <thead>
              <tr>
                <th></th>
                <th :class="
                      (title === 'warnings' ? 'cell-warning' : ' ') +
                      (title === 'errors' ? 'cell-danger' : ' ')
                    "
                    :key="`review-th-${i}`"
                    v-for="(title, i) in Object.keys(reviewData[0])">
                  {{ title != 'unknown_columns' ? fieldName(title) : '' }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr :key="`review-tr-${index}`"
                  v-for="(contact, index) in reviewData">
                <td>{{ index + 1 }}</td>
                <td :key="`review-tr-${index}-td-${i}`"
                    v-for="(key, i) in Object.keys(contact)"
                    :class="
                      (key === 'warnings' && contact[key].length > 0
                        ? 'cell-warning'
                        : '') +
                      ' ' +
                      (key === 'errors' && contact[key].length > 0
                        ? 'cell-danger'
                        : '')
                    ">
                  <span v-if="key === 'phone_numbers'">
                    {{ contact[key].join(', ') }}
                  </span>
                  <span v-else>
                    {{ key != 'unknown_columns' ? contact[key] : '' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else style="height: 300px;"></div>
        </div>
      </b-overlay>
    </div>

    <div class="p-4"
         v-if="currentStep === STEPS.SETTINGS">
      <b-overlay :show="loading" class="w-100">
        <b-form ref="settingsForm"
                class="d-flex justify-center"
                @submit.prevent>
          <b-col class="settings-form-wrapper"
                 sm="12"
                 md="6">
            <b-form-row class="mt-4">
              <b-form-group label="List Name"
                            class="form-label w-100 mb-0"
                            ref="listName"
                            :state="validateState('listName')">
                <b-form-input type="text"
                              placeholder="Name of the new List"
                              v-model.trim="$v.settings.listName.$model"
                              @input="(eventPayload) => onUpdateFields(eventPayload, 'listName')" />
              </b-form-group>

              <b-form-invalid-feedback v-if="!$v.settings.listName.required">
                List Name is required
              </b-form-invalid-feedback>

              <b-form-invalid-feedback
                v-if="hasError('name')"
                class="d-block">
                {{ getFieldError('name') }}
              </b-form-invalid-feedback>
            </b-form-row>

            <b-form-row class="mt-4">
              <div>
                <h5 class="form-label">Update existing contacts</h5>
                <p class="form-helper-text">
                  Override the original existing contact data with what's in the
                  CSV file?
                </p>
              </div>

              <b-form-group label="">
                <b-form-checkbox switch
                                 v-model="settings.updateExisting">
                  Update existing contacts
                </b-form-checkbox>
              </b-form-group>
            </b-form-row>
            <b-form-row class="mt-3">
              <div>
                <h5 class="form-label">Save unknown columns</h5>
                <p class="form-helper-text">
                  Columns that are not set will be saved to the contact's notes
                </p>
              </div>

              <b-form-group label="">
                <b-form-checkbox switch
                                 v-model="$v.settings.saveUnknownColumnAsNotes">
                  Save unknown columns to notes
                </b-form-checkbox>
              </b-form-group>
            </b-form-row>

            <b-form-row class="mt-3">
              <div>
                <h5 class="form-label">
                  Multiple contacts for each phone number
                </h5>
                <p class="form-helper-text">
                  Creates a separate contact for each phone number found in the
                  file
                </p>
              </div>

              <b-form-group label="">
                <b-form-checkbox switch
                                 v-model="$v.settings.cascadeContacts">
                  Create a separate contact for each phone number
                </b-form-checkbox>
              </b-form-group>
            </b-form-row>
          </b-col>
        </b-form>
      </b-overlay>
    </div>

    <div class="import-content"
         v-if="currentStep === STEPS.FINISHED">
      <div class="d-flex flex-column justify-content-center w-100 h-100 text-center">
        <h1 class="d-flex justify-content-center mb-4">
          <i class="fa fa-check text-success mr-2"></i>
          Importing contacts...
        </h1>

        <i class="fas fa-file-import fa-4x text-grey-90 mb-4"></i>

        <p>
          This might take a moment, you can close this window.<br />We'll notify you when the import is complete.
        </p>
      </div>
    </div>

    <template slot="modal-footer">
      <div class="d-flex justify-between w-100 align-items-center">
        <button class="btn btn-outline-success btn-prev"
                data-testid="import-contacts-modal-cancel-button"
                :disabled="loading"
                v-if="backButtonVisible"
                @click="onClickPrev">
          <i class="fa fa-chevron-left"></i> Back
        </button>
        <div class="flex-grow-1"></div>

        <div>
          <button class="btn btn-success btn-next w-auto"
                  data-testid="import-contacts-modal-next-button"
                  :disabled="loading"
                  v-if="currentStep === STEPS.SETTINGS"
                  @click="startImport">
            Start Import <i class="fa fa-file-import"></i>
          </button>

          <button class="btn btn-success btn-next w-auto"
                  data-testid="import-contacts-modal-next-button"
                  v-else-if="currentStep === STEPS.FINISHED"
                  @click="handleCloseClick">
            Close
          </button>

          <button class="btn btn-success btn-next w-auto"
                  data-testid="import-contacts-modal-next-button"
                  :disabled="nextButtonDisabled"
                  v-else-if="nextButtonVisible"
                  @click="onNextStep(currentStep + 1)">
            Next Step <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import {
  aclMixin,
  simpsocialMixin,
  selectorMixin,
  classicMixin,
  formValidationMixin,
  settingsMixin
} from 'src/plugins/mixins'
import FileUploader from 'components/file-uploader'
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { required } from 'vuelidate/lib/validators'

const STEPS = {
  DNC_AGREEMENT: 1,
  CSV_UPLOAD: 2,
  SELECT_COLUMNS: 3,
  REVIEW_DATA: 4,
  SETTINGS: 5,
  FINISHED: 6
}

export default {
  mixins: [
    aclMixin,
    simpsocialMixin,
    selectorMixin,
    classicMixin,
    formValidationMixin,
    settingsMixin
  ],

  components: {
    FileUploader,
    InformationCircleIcon
  },

  props: {
    userId: {
      type: Number,
      required: false
    },

    folderId: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapGetters({
      attributeDictionaries: 'getAttributeDictionaries'
    }),

    ...mapFields('listsModule', [
      'listsImportedFromCsv'
    ]),

    importParseCsvUrl () {
      return talk2Api.V1.importWizard.parseUrl
    },

    formattedContactFields () {
      const commonFields = this.contactFields[0].fields.filter(
        (item) =>
          !this.filterBy || item.label.toLowerCase().indexOf(this.filterBy) > -1
      )
      if (commonFields.length > 0) {
        commonFields.unshift({
          label: 'Common Fields',
          disable: true
        })
      }

      const customFields = this.csfFields.filter(
        (item) =>
          !this.filterBy || item.label.toLowerCase().indexOf(this.filterBy) > -1
      )
      if (customFields.length > 0) {
        customFields.unshift({
          label: 'Custom Fields',
          disable: true
        })
      }

      return [...commonFields, ...customFields]
    },

    csfFields () {
      let fields = []
      if (this.attributeDictionaries && this.attributeDictionaries.length) {
        for (let index in this.attributeDictionaries) {
          fields.push({
            label: this.attributeDictionaries[index].name,
            value: this.attributeDictionaries[index].slug
          })
        }
      }

      return fields
    },

    backButtonVisible () {
      if (
        this.currentStep === STEPS.DNC_AGREEMENT ||
        this.currentStep === STEPS.FINISHED
      ) {
        return false
      }

      return true
    },

    nextButtonVisible () {
      if (
        this.currentStep === STEPS.CSV_UPLOAD ||
        this.currentStep === STEPS.FINISHED
      ) {
        return false
      }

      return true
    },

    nextButtonDisabled () {
      if (this.currentStep === STEPS.DNC_AGREEMENT && !this.isDncAgreed) {
        return true
      }

      return this.loading
    },

    apiUrl () {
      return this.getClassicURL(this.isSimpSocial)
    }
  },

  created () {
    //
  },

  data () {
    return {
      isOpen: false,
      isDncAgreed: false,
      done: [],
      currentStep: STEPS.DNC_AGREEMENT,
      STEPS,
      tableData: [],
      importModel: {},
      settings: {
        listName: ''
      },
      reviewData: [],
      tableHeader: [],
      tableHeaderValue: [],
      uploading: false,
      loading: false,
      uploadError: '',
      contacts: Array.from(new Array(100)),
      filterBy: '',
      noFirstColumn: false,
      fieldErrors: {},
      contactFields: [
        {
          group_name: 'Common Fields',
          fields: [
            {
              value: 'full_name',
              label: 'Full Name'
            },
            {
              value: 'first_name',
              label: 'First Name'
            },
            {
              value: 'last_name',
              label: 'Last Name'
            },
            {
              value: 'phone_number',
              label: 'Phone Number'
            },
            {
              value: 'email',
              label: 'Email'
            },
            {
              value: 'company_name',
              label: 'Company'
            },
            {
              value: 'address',
              label: 'Address'
            },
            {
              value: 'cnam_city',
              label: 'City'
            },
            {
              value: 'cnam_state',
              label: 'State'
            },
            {
              value: 'cnam_zipcode',
              label: 'Zip Code'
            },
            {
              value: 'cnam_country',
              label: 'Country'
            },
            {
              value: 'date_of_birth',
              label: 'Date of Birth'
            },
            {
              value: 'notes',
              label: 'Notes'
            },
            {
              value: 'website',
              label: 'Website'
            },
            {
              value: 'csf1',
              label: 'Custom Field 1'
            },
            {
              value: 'csf2',
              label: 'Custom Field 2'
            },
            {
              value: 'lead_source',
              label: 'Lead Source'
            },
            {
              value: 'disposition_status',
              label: 'Disposition Status'
            },
            {
              value: 'tag',
              label: 'Tag'
            }
          ]
        },
        {
          group_name: 'Custom Fields',
          fields: []
        }
      ]
    }
  },

  validations () {
    return {
      settings: {
        listName: {
          required
        }
      }
    }
  },

  methods: {
    open () {
      this.isOpen = true
    },

    close () {
      this.isOpen = false
    },

    validateState (input) {
      const { $dirty, $error } = this.$v.settings[input]
      return $dirty ? !$error : null
    },

    reset () {
      this.currentStep = STEPS.DNC_AGREEMENT
      this.isDncAgreed = false
      this.loading = false
      this.done = []
      this.settings.listName = ''
      this.settings.updateExisting = false
      this.settings.saveUnknownColumnAsNotes = false
      this.settings.cascadeContacts = false
      this.uploading = false
      this.$v.$reset()
    },

    onUpdateFields (value, prop) {
      this.settings[prop] = value

      // clear server errors if any
      if (prop === 'listName' && this.fieldErrors.name?.length > 0) {
        this.fieldErrors.name = []
      }

      this.updateFormValidity()
    },

    onClickPrev () {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    onNextStep (nextStep) {
      if (nextStep === STEPS.DNC_AGREEMENT) {
        this.done = []
      } else {
        this.done = [...new Set([...this.done, this.currentStep])]
      }

      this.currentStep = nextStep

      switch (this.currentStep) {
        case STEPS.SELECT_COLUMNS:
          // this.importDialogVisible = true
          this.uploading = false
          this.noFirstColumn = false
          break
        case STEPS.REVIEW_DATA:
          this.analyzeData()
          break
      }
    },

    renderColumnChooser (response) {
      this.onNextStep(STEPS.SELECT_COLUMNS)
      this.tableData = response.data
      this.tableHeader = response.columns
      this.importModel = response.import
      this.reviewData = []

      this.tableHeaderValue = []
      this.tableHeader.forEach((value, key) => {
        this.tableHeaderValue[key] = value
      })

      this.uploading = false
      this.loading = false
      this.uploadError = ''
    },

    checkHeaderMap (value) {
      if (value !== 'phone_number') {
        return this.tableHeaderValue.includes(value)
      }
      return false
    },

    tableHeaderChange (value) {
      if (value === 'full_name') {
        let firstNameIndex = this.tableHeaderValue.indexOf('first_name')
        this.tableHeaderValue[firstNameIndex] = null
        let lastNameIndex = this.tableHeaderValue.indexOf('last_name')
        this.tableHeaderValue[lastNameIndex] = null
      }
      if (value === 'first_name' || value === 'last_name') {
        let fullNameIndex = this.tableHeaderValue.indexOf('full_name')
        this.tableHeaderValue[fullNameIndex] = null
      }
    },

    filterFn (val, update) {
      this.filterBy = val.toLowerCase()

      update()
    },

    analyzeData () {
      this.loading = true
      talk2Api.V1.importWizard
        .analyze(this.tableHeaderValue, this.noFirstColumn, this.importModel.id)
        .then((res) => {
          let data = res.data
          this.importModel = data.import
          this.reviewData = data.data

          this.loading = false
        })
    },

    fieldName (field) {
      if (field.includes('phone_number')) {
        return 'Phone Numbers'
      } else if (field === 'warnings') {
        return 'Warnings'
      } else if (field === 'errors') {
        return 'Errors'
      } else {
        // collect all the contact fields.
        // index 1 - common contact fields
        // index 2 - custom contact fields
        let fields = [
          ...this.contactFields[0].fields,
          ...this.contactFields[1].fields
        ]

        // find the field's label
        let fieldData = _.find(fields, { value: field })

        if (fieldData != null) {
          return fieldData.label
        }

        return ''
      }
    },

    hasError (field) {
      return this.fieldErrors && this.fieldErrors[field]?.length
    },

    getFieldError (field) {
      return this.fieldErrors?.[field]?.[0]
    },

    startImport () {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      this.loading = true

      this.importModel.is_import_contact_list = true
      this.importModel.start_from_zero = this.noFirstColumn

      const data = {
        ...this.importModel,
        name: this.settings.listName,
        update_existing: this.settings.updateExisting,
        unknown_columns_to_notes: this.settings.saveUnknownColumnAsNotes,
        cascade_contacts: this.settings.cascadeContacts,
        show_in_public_folder: false
      }

      if (this.userId) {
        data.user_id = this.userId
      }

      if (this.folderId) {
        data.contact_folder_id = this.folderId
      }

      talk2Api.V1.importWizard
        .startImport(this.importModel.id, data)
        .then((res) => {
          this.importModel = res.data.import

          if (res.data.contact_list) {
            this.listsImportedFromCsv.push(res.data.contact_list)
          }

          this.onNextStep(STEPS.FINISHED)

          this.$emit('importStarted')

          this.loading = false
        })
        .catch((err) => {
          if (err.response.status === 422) {
            let message =
              err.response?.data?.message ??
              'Failed to Import CSV, please check the information and try again'
            this.$generalNotification(message, 'error')
            this.fieldErrors = err.response.data.errors
          }
          console.log(err)

          this.loading = false
        })
    },

    handleCloseClick () {
      this.close()
    }
  },

  watch: {
    isOpen () {
      if (!this.isOpen) {
        setTimeout(() => {
          this.reset()
        }, 300)
      }
    }
  }
}
</script>

<style>
.import-content .attachment-wrapper {
  height: auto;
}

.import-column-selector .q-field__native {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
}

.table-csv {
  white-space: nowrap;
  color: #232323;
}

.container-table-csv .cell-danger {
  color: #721c24;
  background-color: #f8d7da;
}

.container-table-csv .cell-warning {
  color: #856404;
  background-color: #fff3cd;
}
</style>
