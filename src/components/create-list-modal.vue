<template>
  <b-modal modal-class="create-list-modal"
           title="Create A List"
           size="lg"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           v-model="isOpen">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               rounded="sm"
               spinner-smal
               :show="isLoading">
      <div class="d-flex flex-column create-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 create-list-modal__title">{{ getTitle }}</div>
          <button class="btn btn-link small text-muted create-list-modal__close"
                  @click="onClose">
            <i class="fa fa-times"/>
          </button>
        </div>

        <div class="pt-3">
          <input class="form-control"
                 type="text"
                 placeholder="Untitled List"
                 autofocus
                 :disabled="disableNameInput"
                 v-model="createList.name"/>
          <small v-if="isIntegrationListType" class="text-dark">List name will be obtained from the selected integration List</small>
        </div>

        <div :class="['flex-grow-1', isCreateListModeFromBulkMenuOrFilters ? 'py-4' : 'pt-4 pb-2']"
             v-if="![CreateListMode.FROM_FILTERS, CreateListMode.FROM_BULK_MENU].includes(createList.mode) && isDefault">
          <div class="form-check mb-2"
               @click="onListTypeSelected(ContactListTypes.DYNAMIC)">
            <input class="form-check-input"
                   type="radio"
                   id="dynamicList"
                   :checked="createList.type === ContactListTypes.DYNAMIC"/>
            <label for="dynamicList">
              <div class="create-list-modal__list-title">Dynamic List</div>
              <div class="create-list-modal__list-desc">
                Automatically updates based off a filter; contacts join or leave
                as their properties change
              </div>
            </label>
          </div>
          <div class="form-check"
               @click="onListTypeSelected(ContactListTypes.STATIC)">
            <input class="form-check-input"
                   type="radio"
                   id="staticList"
                   :checked="createList.type === ContactListTypes.STATIC"/>
            <label for="staticList">
              <div class="create-list-modal__list-title">Static List</div>
              <div class="create-list-modal__list-desc">
                Does not Automatically update; able to manually select and
                adjust order of contacts
              </div>
            </label>
          </div>
          <div class="form-check mt-2"
               @click="onListTypeSelected(IMPORT_FROM_INTEGRATION_TYPE)">
            <input class="form-check-input"
                   type="radio"
                   id="staticListFromIntegration"
                   :checked="isIntegrationListType"/>
            <label for="staticListFromIntegration">
              <div class="create-list-modal__list-title">List from Integration</div>
              <div class="create-list-modal__list-desc">
                It will be initially populated by the selected integration list; able to manually select and
                adjust order of contacts
              </div>
            </label>
          </div>
        </div>

        <div v-if="showIntegrationSelector">
          <hr class="w-100 my-2" />
          <div class="mb-3"
               v-if="integrationsEnabled.length > 1">
              <div class="row">
                  <div class="col-6 d-flex align-items-center pl-0">
                      <span>Select from available integrations: </span>
                  </div>
                  <div class="col-6 pr-0">
                      <q-select class="break-words"
                                color="primary"
                                use-input
                                emit-value
                                map-options
                                dense
                                hide-bottom-space
                                :options="integrationsEnabled"
                                v-model="selectedIntegration"/>
                  </div>
              </div>
          </div>
          <p class="mb-2"
             v-else>
              Currently enabled integration: <span class="text-bold"> {{ integrationsEnabled[0] }} </span>
          </p>
          <integration-list-selector ref="list-selector"
                                     :use-chips="false"
                                     :multiple="false"
                                     :clearable="true"
                                     :generic-styling="false"
                                     :disable="shouldDisableListSelector"
                                     :integration="selectedIntegration ?? ''"
                                     @change="onListSelectorChange"/>

          <div v-if="getIntegration === HUBSPOT_INTEGRATION">
            <b-form-group class="checkbox-wrapper">
              <b-form-checkbox :value="true"
                               :unchecked-value="false"
                               v-model="hubspotDynamicImport">
                <span>Keep list in sync with HubSpot</span>
                <span class="ml-2">
                  <information-circle-icon class="cursor-pointer"/>
                  <q-tooltip>
                    <p><b>Activate this option to automatically sync your HubSpot lists with Aloware.</b></p>
                    <p>HubSpot's Active lists will be updated hourly, reflecting the addition and removal of contacts based on specific HubSpot criteria.</p>
                    <p>Static lists in HubSpot will remain unchanged until manual updates are made in the CRM, which will also be reflected in Aloware during periodic synchronization.</p>
                  </q-tooltip>
                </span>
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>

        <template v-else-if="userCanAddPublicList">
          <hr class="w-100 my-2"
              v-if="!isCreateListModeFromBulkMenuOrFilters"/>
          <div :class="['flex-grow-1', isCreateListModeFromBulkMenuOrFilters ? 'py-4' : 'pt-2 pb-4']">
            <div class="form-check mb-2"
                 @click="createList.show_in_public_folder = false">
              <input class="form-check-input"
                     type="radio"
                     id="isPublicListFalse"
                     name="isPublicList"
                     :checked="createList.show_in_public_folder === false" />
              <label for="isPublicListFalse">
                <div class="create-list-modal__list-title">Private List</div>
                <div class="create-list-modal__list-desc">
                  Designed for individual use. It is only accessible to the user who created it.
                </div>
              </label>
            </div>
            <div class="form-check"
                 @click="createList.show_in_public_folder = true">
              <input class="form-check-input"
                     type="radio"
                     id="isPublicListTrue"
                     :checked="createList.show_in_public_folder === true" />
              <label for="isPublicListTrue">
                <div class="create-list-modal__list-title">Public List</div>
                <div class="create-list-modal__list-desc">
                  Designed for broader access. It can be seen by all agents in the organization. Supervisors and Admins
                  can also add contacts to the list.
                </div>
              </label>
            </div>
          </div>
        </template>

        <div class="text-red">
          {{ errorMsg }}
        </div>

        <div class="d-flex align-items-center pt-3">
          <button class="btn btn-block btn-light mt-0 mr-2"
                  :disabled="isLoading"
                  @click="onClose">
            Cancel
          </button>
          <button class="btn btn-block btn-primary mt-0"
                  :disabled="disableSubmit"
                  @click="onSubmit">
            {{ submitText }}
          </button>
        </div>
      </div>
    </b-overlay>

    <b-modal modal-class="confirm-dialog"
             title="List Already Exists"
             centered
             v-model="showIntegrationImportConfirmDialog"
             @close="onConfirmIntegrationImportClose">
      <div class="text-left">
        <div class="text-dark">
          {{ integrationImportConfirmMessage }}
        </div>
      </div>
      <template slot="modal-footer">
        <div class="d-flex w-100">
          <div class="flex-grow-1"></div>
          <button class="btn btn-sm btn-primary mr-2"
                  @click="onConfirmIntegrationImport">
            Continue
          </button>
        </div>
      </template>
    </b-modal>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import {
  DEFAULT_COLUMNS,
  POWER_DIALER_DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import {
  DEFAULT_DYNAMIC_LIST_TEMPLATE_REQUEST,
  DEFAULT_DYNAMIC_LIST_TEMPLATE_RESPONSE
} from 'src/constants/default-lists'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import {
  FROM_FILTERS,
  FROM_FOLDERS,
  FROM_BULK_MENU
} from 'src/constants/contacts-list-create-mode'
import { chunk, isEmpty } from 'lodash'
import {
  aclMixin,
  contactLists,
  integrationMixin
} from 'src/plugins/mixins'
import IntegrationListSelector from 'components/generic-selectors/integration-list-selector'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import talk2Api from 'src/plugins/api/api'
import { HUBSPOT_INTEGRATION, PIPEDRIVE_INTEGRATION, ZOHO_INTEGRATION } from 'src/constants/integrations'

export default {
  components: {
    IntegrationListSelector,
    InformationCircleIcon
  },

  mixins: [
    aclMixin,
    contactLists,
    integrationMixin
  ],

  inject: [
    'selectedContacts'
  ],

  props: {
    isDefault: {
      type: Boolean,
      default: true
    },
    userId: {
      type: Number
    }
  },

  mounted () {
    this.loadFolders()
    this.loadPublicLists()
    if (this.integrationsEnabled.length === 1) {
      this.selectedIntegration = this.integrationsEnabled[0]
      this.loadSelectionOptions()
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'createList',
      'currentListFilters',
      'selectedList',
      'unsavedList',
      'isAllContactsSelected',
      'search'
    ]),

    ...mapState(['isDatatableSelectedAll']),

    getTitle () {
      if ([this.CreateListMode.FROM_FILTERS, this.CreateListMode.FROM_BULK_MENU].includes(this.createList.mode)) {
        const typeText = (this.createList.type === this.ContactListTypes.STATIC) ? 'Static' : 'Dynamic'
        return `New ${typeText} List`
      }

      return 'New List'
    },

    isCreateListModeFromBulkMenuOrFilters () {
      return [this.CreateListMode.FROM_FILTERS, this.CreateListMode.FROM_BULK_MENU].includes(this.createList.mode)
    },

    userCanAddPublicList () {
      return !this.isPowerDialer && this.isBillingAdminOrAdminOrSupervisor
    },

    isNameValid () {
      return this.createList.name && this.createList.name.length > 0
    },

    listsEndpoint () {
      return this.isDefault ? '/api/v2/contacts-list' : '/api/v2/power-dialer-lists'
    },

    foldersEndpoint () {
      return this.isDefault ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    },

    redirectPath () {
      return this.isDefault ? `/contacts/list` : `/power-dialer/list`
    },

    defaultTemplateRequest () {
      return DEFAULT_DYNAMIC_LIST_TEMPLATE_REQUEST
    },

    defaultTemplateResponse () {
      return DEFAULT_DYNAMIC_LIST_TEMPLATE_RESPONSE
    },

    isPowerDialer () {
      return this.$route.name.includes('Power Dialer')
    },

    submitText () {
      if (this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE) {
        return 'Import'
      }
      return 'Create'
    },

    shouldDisableListSelector () {
      return this.selectedIntegration === null
    },

    disableSubmit () {
      if (this.isLoading) {
        return true
      }

      if (this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE) {
        return !this.integrationList
      }

      return !this.isNameValid
    },

    integrationListId () {
      return this.integrationList?.listId ?? this.integrationList?.id
    },

    getIntegration () {
      return (this.selectedIntegration ?? this.integrationsEnabled[0])?.toLowerCase()
    },

    showIntegrationSelector () {
      return this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE && this.integrationsEnabled?.length > 0
    },

    isIntegrationListType () {
      return this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE
    },

    disableNameInput () {
      return this.isLoading || this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE
    }
  },

  methods: {
    ...mapActions('contacts', [
      'createListClose',
      'foldersLoaded',
      'setUnsavedList',
      'setCurrentListFilters'
    ]),

    onClose () {
      if (!this.isLoading) {
        this.createListClose()
      }
    },

    getParams () {
      let headers = DEFAULT_COLUMNS

      if (this.isPowerDialer) {
        headers = POWER_DIALER_DEFAULT_COLUMNS
      }

      let params = {
        contact_folder_id: this.createList.contact_folder_id,
        name: this.createList.name,
        type: this.createList.type,
        headers: headers,
        mode: this.createList.mode,
        order: 0,
        show_in_public_folder: this.createList.show_in_public_folder,
        include_all_contacts: this.isAllContactsSelected
      }

      const clonedCurrentListFilters = this.$jsonClone(this.currentListFilters)

      // remove contact_lists filter since we are creating dynamic one
      if (clonedCurrentListFilters?.contact_lists) {
        delete clonedCurrentListFilters.contact_lists
      }

      if (!this.isDatatableSelectedAll) {
        switch (true) {
          case this.createList.mode === FROM_FILTERS:
            params = {
              ...params,
              filters: clonedCurrentListFilters
            }

            break
          case this.createList.mode === FROM_BULK_MENU:
            let contacts = []

            if (this.selectedContacts[this.selectedList.id]) {
              contacts = this.selectedContacts[this.selectedList.id]
            }

            params = {
              ...params,
              contact_ids: contacts.map(contact => contact.id)
            }

            break
          case this.createList.mode === FROM_FOLDERS:
          default:
        }
      } else {
        params.selected_all = true
      }

      const allFilters = this.$jsonClone(this.currentListFilters)

      // delete attributes that wont be considered as filter
      delete allFilters.order
      delete allFilters.relations
      delete allFilters.sort
      delete allFilters.search

      // we have to use the dynamic list's filters if the source list
      // is of type DYNAMIC
      if (this.isDefault && this.selectedList.type === this.ContactListTypes.DYNAMIC &&
        !isEmpty(this.currentListFilters)) {
        Object.keys(allFilters).forEach(index => {
          // include all other filters
          if (!this.$isNumeric(index)) {
            params[index] = allFilters[index]
            delete allFilters[index]
          }
        })

        if (!isEmpty(allFilters)) {
          // include the filter groups
          params.filter_groups = allFilters
        }
      } else if (!isEmpty(allFilters) && this.selectedList.type === this.ContactListTypes.STATIC) {
        // just pass the filters when not empty, if list is STATIC
        params.filter_groups = allFilters
      }

      if (ContactListTypes.CONTACTS_STRING_KEYS.indexOf(this.selectedList.id) === -1) {
        // else, list is of type STATIC. Just pass the contacts list id filter
        const contactListFilter = [
          {
            value: [this.selectedList.id],
            operator: 1
          }
        ]

        // Verify if filter_groups is already set and merge it with the contact_lists filter
        if (Array.isArray(params.filter_groups)) {
          params.filter_groups[0].filters.contact_lists = contactListFilter
        } else {
          params.filter_groups = [
            {
              filters: {
                contact_lists: contactListFilter
              }
            }
          ]
        }

        params.filter_groups[0].is_conjunction = true
      }

      if (this.search) {
        params.search = this.search
      }

      return params
    },

    processRequest (url = null, params, isChunked = false, chunkedContactIds = [], listId = null, message = null, skipListLoading = false) {
      const apiUrl = !url ? this.listsEndpoint : url

      if (chunkedContactIds.length > 0) {
        params.contact_ids = chunkedContactIds[0]
      }

      this.$axios
        .post(apiUrl, params)
        .then((response) => {
          let message = null
          let id = null

          if (!url) {
            message = response?.data?.message
            id = response?.data?.id || response?.data?.data?.id
          }

          // recover the id for bulk add contacts with chunked contacts
          id = !id && this.$isNumeric(listId) ? listId : id

          if (isChunked && this.isDefault) {
            // remove the used set of contact ids
            chunkedContactIds.splice(0, 1)
            const hasMoreChunks = chunkedContactIds.length > 1

            // process the next set of contact ids
            if (chunkedContactIds.length > 0) {
              this.processRequest(`/api/v2/contacts-list/${id}/items`, params, hasMoreChunks, chunkedContactIds, id, message, skipListLoading)

              return
            } else {
              isChunked = false
            }
          }

          const newStaticListWithContacts = isEmpty(params.contact_folder_id) &&
            !isEmpty(params.contact_ids)

          // skip list's loading view too if we're sending contact ids
          if (this.isDefault && !skipListLoading && !newStaticListWithContacts) {
            this.$VueEvent.fire('addContactsProgress', {
              id: id,
              loading: true
            })
          }

          if (this.createList.mode === FROM_BULK_MENU) {
            this.$router.push(`${this.redirectPath}/${id}`)
          } else {
            this.$router.push(`${this.redirectPath}/${id}?start=1`)
          }

          this.createListClose()

          this.$generalNotification(message)

          this.loadFolders()
          this.loadPublicLists()
        })
        .catch((error) => {
          if (!isChunked) {
            this.$VueEvent.fire('addContactsProgress', {
              id: null,
              loading: false
            })

            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.errorMsg = message
            this.$generalNotification(message, 'error')
          }
        })
        .finally(() => {
          if (!isChunked) {
            this.isLoading = false
          }
        })
    },

    processSubmit (skipListLoading = false) {
      this.isLoading = true
      const params = this.getParams()
      let ids = params?.contact_ids ?? []
      ids = chunk(ids, 50)

      const isChunked = !params?.selected_all && ids.length > 0
      this.processRequest(null, params, isChunked, ids, null, null, skipListLoading)
    },

    onSubmit () {
      if (this.createList.type === this.IMPORT_FROM_INTEGRATION_TYPE) {
        this.processIntegrationListSubmit()
        return
      }

      // should skip list's loading view after creating the list
      if (this.createList.type === this.ContactListTypes.STATIC &&
        !this.isDatatableSelectedAll &&
        isEmpty(this.selectedContacts[this.selectedList.id])) {
        this.processSubmit(true)
        return
      }

      if (this.createList.type === this.ContactListTypes.STATIC) {
        this.processSubmit()
      } else {
        if (this.unsavedList) {
          this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action will overwrite any unsaved data. Do you wish to continue?', {
            buttonSize: 'sm',
            okTitle: 'Yes',
            cancelTitle: 'No',
            centered: true
          }).then(confirm => {
            if (confirm) {
              this.handleDynamicListCreation()
            }
          })
        } else {
          this.handleDynamicListCreation()
        }

        this.isLoading = false
      }
    },

    handleDynamicListCreation () {
      this.isLoading = true

      const data = {
        ...this.defaultTemplateResponse,
        name: this.getParams().name,
        contact_folder_id: this.getParams().contact_folder_id,
        params: this.getParams(),
        filters: []
      }

      this.setUnsavedList(data)
      this.isLoading = false
      this.createListClose()

      if (this.$route.path !== '/contacts/list/unsaved') {
        this.$router.push(`${this.redirectPath}/unsaved`)
      }

      this.$VueEvent.fire('resetContactsListFilter')

      this.setCurrentListFilters({
        sort: this.currentListFilters.sort,
        order: this.currentListFilters.order,
        search: this.currentListFilters.search,
        relations: this.currentListFilters.relations
      })
    },

    loadFolders () {
      const params = {}
      if (this.userId) {
        params.user_id = this.userId
      }

      this.$axios
        .get(this.foldersEndpoint, { params })
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    loadSelectionOptions () {
      if (this.$refs['list-selector'] === undefined) {
        return
      }

      this.$refs['list-selector'].selectedId = null
      this.$refs['list-selector'].getListsOfEnabledIntegration()
    },

    onListSelectorChange (payload) {
      this.integrationList = payload.list
    },

    async processIntegrationListSubmit () {
      this.isLoading = true
      await this.checkIntegrationImport()

      if (this.showIntegrationImportConfirmDialog) {
        this.isLoading = false
        return
      }

      this.importFromIntegration()
    },

    importFromIntegration () {
      if (!this.isLoading) {
        this.isLoading = true
      }

      switch (this.getIntegration) {
        case HUBSPOT_INTEGRATION:
          return this.importFromHubspot()
        case PIPEDRIVE_INTEGRATION:
          return this.addPipedriveFilter()
        case ZOHO_INTEGRATION:
          return this.addZohoView()
      }
    },

    importFromHubspot () {
      return talk2Api.V2.integrations.hubspot.importList(this.integrationListId, { dynamic_import: this.hubspotDynamicImport })
        .then(response => response.data)
        .then(data => {
          this.$generalNotification("Your HubSpot contact list is being imported. It can take a couple of minutes if it's a large list.")
          this.createListClose()
          this.loadFolders()
          this.loadPublicLists()
        })
        .catch(_err => {
          this.isLoading = false
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    addZohoView () {
      return talk2Api.V2.integrations.zoho.importView(this.integrationListId)
        .then(response => response.data)
        .then(data => {
          this.$generalNotification('Your Zoho view is being imported. It can take a couple of minutes depending on the view.')
          this.createListClose()
          this.loadFolders()
          this.loadPublicLists()
        })
        .catch(_err => {
          this.isLoading = false
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    addPipedriveFilter () {
      return talk2Api.V2.integrations.pipedrive.importFilter(this.integrationListId)
        .then(response => response.data)
        .then(data => {
          this.$generalNotification('Your Pipedrive filter is being imported. It can take a couple of minutes depending on the filter.')
          this.createListClose()
          this.loadFolders()
          this.loadPublicLists()
        })
        .catch(_err => {
          this.isLoading = false
          this.$generalNotification('Unable to import contacts from list, please try again.', 'error')
        })
    },

    onConfirmIntegrationImport () {
      this.showIntegrationImportConfirmDialog = false
      this.importFromIntegration()
    },

    async checkIntegrationImport () {
      switch (this.getIntegration) {
        case HUBSPOT_INTEGRATION:
          return this.checkHubspotList()
        case PIPEDRIVE_INTEGRATION:
          return this.checkPipedriveFilter()
        case ZOHO_INTEGRATION:
          return this.checkZohoView()
      }
    },

    async checkHubspotList () {
      const res = await talk2Api.V2.integrations.hubspot.listExists(this.integrationListId)

      if (res.data.exists) {
        this.integrationImportConfirmMessage = 'The HubSpot list you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.showIntegrationImportConfirmDialog = true
      }
    },

    async checkZohoView () {
      const res = await talk2Api.V2.integrations.zoho.viewExists(this.integrationListId)

      if (res.data.exists) {
        this.integrationImportConfirmMessage = 'The Zoho view you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.showIntegrationImportConfirmDialog = true
      }
    },

    async checkPipedriveFilter () {
      const res = await talk2Api.V2.integrations.pipedrive.filterExists(this.integrationListId)

      if (res.data.exists) {
        this.integrationImportConfirmMessage = 'The Pipedrive filter you are trying to import shares the name of a list that already exists, and will update that list once the import is complete. Would you like to proceed?'
        this.showIntegrationImportConfirmDialog = true
      }
    },

    onConfirmIntegrationImportClose () {
      this.showIntegrationImportConfirmDialog = false
    },

    onListTypeSelected (listType) {
      this.createList.type = listType
    }
  },

  data () {
    return {
      isOpen: false,
      name: null,
      type: ContactListTypes.DYNAMIC,
      isLoading: false,
      CreateListMode: {
        FROM_FILTERS,
        FROM_FOLDERS,
        FROM_BULK_MENU
      },
      errorMsg: '',
      ContactListTypes,
      // Static type to choose for importing from integration
      IMPORT_FROM_INTEGRATION_TYPE: 99,
      selectedIntegration: null,
      integrationList: null,
      hubspotDynamicImport: false,
      showIntegrationImportConfirmDialog: false,
      integrationImportConfirmMessage: '',
      HUBSPOT_INTEGRATION,
      PIPEDRIVE_INTEGRATION,
      ZOHO_INTEGRATION
    }
  },

  watch: {
    createList ({ open }) {
      this.isOpen = open
      this.name = null
      this.type = this.ContactListTypes.DYNAMIC
    }
  }
}
</script>

<style scoped>
.break-words {
  word-break: break-all;
}
</style>
