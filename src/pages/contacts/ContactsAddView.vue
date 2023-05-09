<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <router-link :to="linkToRoute"
                       v-slot="{ href, navigate }">
            <a class="btn btn-link p-0 text-muted pr-2"
               :href="href"
               @click="navigate">
              <i class="fa fa-chevron-left"></i>
            </a>
          </router-link>
          <span v-if="!openEdit">Add contacts to</span>
          <div class="text-grey-90"
               v-if="!openEdit">
            <span class="title-icon">
              <folder-static-icon/>
            </span>
            {{ contactList.name }}
          </div>
          <TextPopover :id="contactList.id"
                       :editable="!isMyQueue"
                       v-else-if="contactList"
                       v-model="contactListName"
                       @input="updateListName" />
        </div>
        <div class="text-muted small action-desc">
          {{ addContactsGuideText }}
        </div>
      </div>
    </template>

    <template slot="options">
      <div class="d-flex align-items-center">
        <div class="selected-contacts text-muted mr-2">
          {{ checkedItems.length }} Selected Contact
        </div>
        <compact-btn class="mr-2"
                     variant="primary"
                     :disabled="!checkedItems.length || clicked"
                     @clicked="addSelectedContacts">
          Add Selected Contacts
        </compact-btn>
        <compact-btn variant="outlined-light"
                     @clicked="onCancel">
          Cancel
        </compact-btn>
      </div>
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <search placeholder="Search All Contacts"
                limitSearchCharacters
                :disabled="isLoadingDisabled"
                @search="onSearch" />
        <div class="px-3">
          <b-form-checkbox name="check-button"
                           size="sm"
                           switch
                           v-model="myContacts"
                           @change="onFetchMyContacts">
            <span class="small text-muted text-uppercase">My Contacts</span>
          </b-form-checkbox>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center">
        <div class="flex-grow-1 text-right pr-2 d-flex align-items-center justify-content-end">
          <span class="small text-muted selected-contacts mr-2">{{ contactCount | numFormat }} Contacts</span>
          <div class="v-divider">
          </div>
          <div :class="['btn-filter-wrapper mr-2', hasAppliedFilters ? 'background' : '' ]">
            <compact-btn variant="outlined-light"
                         customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
                         borderless
                         @clicked="onFiltersClicked">
              <b-badge class="ml-2 mt-1"
                       pill
                       variant="primary"
                       v-if="hasAppliedFilters">
                {{ filtersCount }}
              </b-badge>
              <span class="pl-2  pr-2">Filters</span>
            </compact-btn>
            <compact-btn customClass="mr-2 pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
                         variant="outlined-light"
                         borderless
                         :disabled="!hasAppliedFilters"
                         v-if="hasAppliedFilters"
                         @clicked="resetFilters">
              <i class="fa fa-times" />
            </compact-btn>
          </div>
        </div>
      </div>
    </template>

    <template slot="table">
      <datatable scroll-area-class="pd-datatable"
                 :stickyHeaders="true"
                 :columns="validColumns"
                 :is-empty="isEmpty"
                 :is-loading-more="isLoadingMore"
                 :is-loading="isLoading"
                 :paginated="false"
                 :show-pagination="!isStartState"
                 :total-rows="fixedContactsData.total"
                 :current-page="fixedContactsData.current_page"
                 :last-page="fixedContactsData.last_page"
                 @onMouseMove="datatableOnMouseMove"
                 @onMouseLeave="datatableOnMouseMove"
                 @reordered="onColumnsReordered"
                 @checked="onCheckAllItems"
                 @sort="onSortByField"
                 @paginated="onPagination"
                 @more="onLoadMore">
        <template slot="tbody">
          <tr class="datatable-row"
              :key="`${index}`"
              v-for="(contact, index) in fixedContactsData.data">
            <template v-for="(column, key) in validColumns">
              <!-- change date added to date created -->
              <!-- COLUMN: Checkboxes -->
              <!-- <div :key="`key-${key}`">{{contact}}</div> -->
              <td class="text-left pull-left datatable-row__checkbox"
                  :key="`c-${key}`"
                  v-if="column.name === 'checkbox'">
                <label class="custom-checkbox-container">
                  <input type="checkbox"
                         class="checker"
                         :value="contact.id"
                         :checked="checkedItems.find(item => item.id === contact.id) || isAllContactsSelected"
                         @change="onCheckerClicked(contact)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <!-- COLUMN: Name  -->
              <td class="datatable-row__name"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'name'">
                <div class="d-flex align-items-center">
                  <div class="pr-2">
                    <div class="avatar"
                         :style="computedStyle">
                      <div class="avatar__inner">
                        <span v-if="!contact.name || !contact.name.length">
                          <i class="fa fa-user" />
                        </span>
                        <span v-else>
                          {{ getInitials(contact.name || 'No Name') }}
                        </span>
                      </div>
                      <slot></slot>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <router-link class="d-flex align-items-center item contact-name"
                                 :to="generateRoute(contact.id)">
                      <template v-if="contact.name">
                        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                          {{ contact.name | ucwords }}
                        </div>
                      </template>
                      <template v-if="!contact.name">
                        <div :class="`${column.draggable ? 'col-indented' : ''}`">
                          No Name
                        </div>
                      </template>
                    </router-link>

                    <b-badge variant="danger"
                             class="badge-phone-info"
                             v-if="contact.is_dnc">
                      DNC
                    </b-badge>
                  </div>
                </div>
              </td>
              <!-- COLUMN: Phone Number -->
              <td class="datatable-row__phone"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'phone_number'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                     v-if="contact.phone_number">
                  {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                </div>
                <div class="ml-1 text-grey-7 text-center "
                     :class="`${column.draggable ? 'col-indented' : ''}`"
                     v-else>
                  --
                </div>
              </td>
              <td :key="`c-${key}`"
                  v-else-if="column.name === 'last_engagement_text'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  <div>{{ contact.last_engagement_text }}</div>
                  <div class="small text-muted">
                    {{ moment(contact.last_engagement_at).format('LLL') }}
                  </div>
                </div>
              </td>
              <!-- COLUMN: Date Added/Created At -->
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'created_at'">
                <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
                  {{ contact.created_at | fixFullDateTime }}
                </div>
              </td>
              <!-- COLUMN: Tags -->
              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'tags'"
                  @mouseleave="onMouseLeavePopover($event)">
                <template v-if="!contact.tags || (contact.tags && !contact.tags.length)">
                  --
                </template>

                <template v-if="Array.isArray(contact.tags) && contact.tags.length">
                  <div class="d-flex align-items-center contact-tags-item popover-items"
                       :id="`pt-${index}-${key}`"
                       v-if="contact.id"
                       @mouseenter="onMouseOverPopover('Tags', `pt-${index}-${key}`, index, column.name, $event)">
                    <span>
                      <i class="fa fa-circle"
                        :style="`color: ${contact.tags[0].color};font-size:36%;position: relative; top: -3px;`" />
                      <span v-if="contact.tags.length > 1">
                        {{ contact.tags[0].name | truncate(17) }}
                      </span>
                      <span v-else>
                        {{ contact.tags[0].name | truncate(27) }}
                      </span>
                    </span>
                    <span class="ml-1 text-grey-7"
                          v-if="contact.tags.length > 1">
                      +{{ (contact.tags.length - 1) }} more
                    </span>
                  </div>
                </template>
              </td>
              <!-- COLUMN: Status -->
              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'task_status_name' || column.name === 'task_status'">
                <q-chip text-color="red"
                        size="12px"
                        class="p-0 m-0"
                        :outline="true"
                        :color="getStatusColor(getStatusName(contact.task_status))">
                  {{ getStatusName(contact.task_status) }}
                </q-chip>
              </td>
              <td class="datatable-row__name"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'contact_owner'">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <div v-if="contact.user_id">
                      <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                        {{ (getUserName(contact.user_id)) | ucwords }}
                      </div>
                    </div>
                    <div v-else>
                      <div :class="`${column.draggable ? 'col-indented' : ''}`">
                        No Name
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'text_authorized_at'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.text_authorized_at ? 'Yes' : 'No' }}
                </div>
              </td>
              <td class="text-left"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'initial_campaign_id'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getLineName(contact.initial_campaign_id) }}
                </div>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_missed_calls_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_missed_calls_count > 0">
                  {{ contact.unread_missed_calls_count }}
                </span>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_voicemails_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_voicemails_count > 0">
                  {{ contact.unread_voicemails_count }}
                </span>
              </td>
              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${key}`"
                  v-else-if="column.name === 'unread_texts_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_texts_count > 0">
                  {{ contact.unread_texts_count }}
                </span>
              </td>
              <td :key="`c-${key}`"
                  v-else
                  @mouseleave="onMouseLeavePopover($event)">
                <div class="text-left"
                     v-if="contact[column.name] === '' || contact[column.name] === null || contact[column.name] === 'NULL' || (contact[column.name] instanceof Array && !contact[column.name].length)">
                  <div :class="`${column.draggable ? 'col-indented' : ''}`">
                    -
                  </div>
                </div>

                <div class="text-left"
                     v-else-if="contact[column.name] && contact[column.name] instanceof Array && contact[column.name].length">
                  <div class="d-flex align-items-center popover-items"
                       :id="`ot-${index}-${key}`"
                       v-if="contact[column.name].length > 0"
                       @mouseenter="onMouseOverPopover(column.label, `ot-${index}-${key}`, index, column.name, $event)">
                    <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                         v-if="typeof contact[column.name][0].phone_number !== 'undefined'">
                      {{ contact[column.name][0].phone_number | fixPhone('NATIONAL', true) }}
                    </div>
                    <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                         v-else>
                      {{ contact[column.name][0].name }}
                    </div>
                    <span class="ml-1 text-grey-7"
                          v-if="contact[column.name].length > 1">
                      +{{ (contact[column.name].length - 1) }} more
                    </span>
                  </div>
                  <span v-if="contact[column.name].length === 0">
                    -
                  </span>
                </div>
                <div class="text-left"
                     v-else-if="contact[column.name] && contact[column.name] instanceof Object && Object.keys(contact[column.name]).length">
                  <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                       v-if="contact[column.name].id && typeof contact[column.name].name !== 'undefined'">
                    {{ contact[column.name].name }}
                  </div>
                </div>
                <span class="text-left"
                      v-else-if="contact[column.name] && contact[column.name] instanceof Object && !Object.keys(contact[column.name]).length">
                  - {{ contact[column.name] }}
                </span>
                <div class="text-left ellipse col-indented"
                     v-else-if="column.name.includes('_at')">
                  {{ contact[column.name] | fixFullDateTime }}
                </div>
                <div class="text-left ellipse col-indented"
                     v-else-if="column.name.includes('date_of_birth')">
                  {{ contact[column.name] | fixFullDate }}
                </div>
                <div class="ellipse"
                     :class="`${[isCountField(column.name) ? 'text-center' : 'text-left']} ${column.draggable ? 'col-indented' : ''}`"
                     v-else>
                  {{ getColumnValue(column.name) }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </datatable>

      <b-popover triggers="hover"
                 placement="topright"
                 boundary="window"
                 ref="popover"
                 :key="hoverPopover.key"
                 :show.sync="hoverPopover.show"
                 :target="hoverPopover.target"
                 v-if="hoverPopover.target">
        <template #title>
          <div class="contact-tags-title">{{ hoverPopover.title }}</div>
        </template>
        <template v-if="hoverPopover.title === 'Tags'">
          <span class="d-flex align-items-center contact-tags-item"
                v-for="(item, index) in hoverPopover.data"
                :key="`t-${index}`">
            <span>
              <i class="fa fa-circle"
                 :style="`color: ${item.color};font-size:50%;position: relative; top: -2px;`" />
              {{ item.name }}
            </span>
          </span>
        </template>
        <template v-if="hoverPopover.title !== 'Tags'">
          <div class="ml-1 w-100"
               :key="`ct-${index}`"
               v-for="(item, index) in hoverPopover.data">
            <i class="fa fa-circle text-black"
              :style="`font-size:36%;position: relative; top: -3px;`" />
            <span v-if="typeof item.phone_number !== 'undefined'">
              {{ item.phone_number | fixPhone('NATIONAL', true) }}
            </span>
            <span v-else>
              {{ item.name }}
            </span>
          </div>
        </template>
        <span class="ml-1 text-grey-7"
              v-if="hoverPopover.dataLength > 11">
          +{{ (hoverPopover.dataLength - 11) }} more
        </span>
      </b-popover>

    </template>

    <template slot="filters">
      <contacts-filters @filtersUpdated="updateFilterHasChanges"
                        @filtersCount="updateFiltersCount"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Search from 'src/components/search.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import TextPopover from 'components/popover/text-popover'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import ContactsFilters from 'components/contacts/contacts-filters'
import {
  aclMixin,
  visibilityMixin,
  viewMixin,
  avatarMixin,
  addViewMixin
} from 'src/plugins/mixins'
import { isEqual } from 'lodash'

export default {
  components: {
    ContactsFilters,
    CompactBtn,
    ContactsScreen,
    Search,
    Datatable,
    ImportContactsModal,
    TextPopover,
    FolderStaticIcon
  },

  props: {
    list: {
      type: Object,
      default: () => {}
    },

    isLoadingDisabled: {
      type: Boolean,
      default: false
    },

    isStartState: {
      type: Boolean,
      default: false
    },

    isEditable: {
      type: Boolean,
      default: false
    },

    search: {
      type: String,
      default: ''
    },

    isMyContactsView: {
      type: Boolean,
      default: false
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    columns: {
      type: Array,
      default: () => []
    },

    isEmpty: {
      type: Boolean,
      default: false
    },

    isLoadingMore: {
      type: Boolean,
      default: false
    },

    filtersCount: {
      type: Number,
      default: 0
    }
  },

  mixins: [
    aclMixin,
    visibilityMixin,
    viewMixin,
    avatarMixin,
    addViewMixin
  ],

  inject: [
    'contactsData'
  ],

  computed: {
    ...mapGetters('auth', ['profile']),

    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'lists',
      'listItems',
      'isFiltersOpen'
    ]),

    contactList () {
      return this.lists[String(this.$route.params.id)]
    },

    isLoaded () {
      return !!this.lists[String(this.$route.params.id)]
    },

    items () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].data
      }

      return []
    },

    currentPage () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].current_page
      }

      return 1
    },

    hasAppliedFilters () {
      return this.filtersCount > 0
    },

    isResetDisabled () {
      return !this.filterHasChanges
    },

    validColumns () {
      return this.columns.filter(column => column.label !== 'Actions')
    },

    urlRoutePath () {
      if (this.isContactModule) {
        return '/contacts/list/'
      }

      return '/power-dialer/list/'
    },

    addItemEndpoint () {
      return this.isContactModule ? 'api/v2/contact-list-items' : 'api/v2/power-dialer-list-items'
    },

    checkedItemIds () {
      const ids = []
      this.checkedItems.forEach(check => {
        ids.push(check.id)
      })

      return ids
    },

    contactListName () {
      return this.listName || this.contactList.name
    },

    linkToRoute () {
      return this.isMyQueue ? `/power-dialer` : `${this.urlRoutePath}${this.$route.params.id}`
    },

    isMyQueue () {
      return this.contactList && this.contactList.id === 'my-queue'
    },

    lastPage () {
      return this.listItems?.[this.id]?.last_page || 0
    },

    totalRows () {
      return this.listItems?.[this.id]?.total || 0
    },

    contactWithNoPrimaryNumbers () {
      return this.fixedContactsData.data.filter(contact => {
        return contact.phone_numbers[0].is_primary === false
      })
    },

    fixedContactsData () {
      if (isEqual(this.$parent.$data.contactsData, this.contactsData)) {
        return this.contactsData
      }

      return this.$parent.$data.contactsData
    }
  },

  data () {
    return {
      ContactListTypes,
      openEdit: true,
      isContactModule: true,
      checkedItems: [],
      filterHasChanges: false,
      listName: '',
      myContacts: false,
      clicked: false,
      contactCount: 0
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'foldersLoaded',
      'columnsReordered',
      'setShouldUpdateSelectedListContactCount',
      'setSearch',
      'resetSearch',
      'setShowMyContacts',
      'setAddViewShowMyContacts'
    ]),

    loadList (id) {
      if (!id) {
        id = 'all'
      }

      const stringId = String(id)

      this.$axios
        .get('/api/v2/contacts-list/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
        })
        .catch((error) => {
          const { message } = extractErrorMessage(error)
          this.$generalNotification(message, 'error')
          this.$router.replace('/contacts/')
        })
    },

    updateListName (data) {
      this.$axios
        .patch(`/api/v2/contacts-list/${this.$route.params.id}`, {
          name: data
        })
        .then((response) => response.data)
        .then((response) => {
          this.reloadFolders()
          this.$generalNotification(response.message, 'success')
          this.listName = data
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(`Error in renaming a list. ${message}`, 'error')
        })
    },

    reloadFolders () {
      return this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    addSelectedContacts () {
      this.clicked = true
      this.closeFilters()

      return this.$axios
        .post(this.addItemEndpoint, this.attachedParams())
        .then(() => {
          this.setShouldUpdateSelectedListContactCount(true)

          if (this.contactList.id === 'my-queue') {
            this.$router.push(`/power-dialer`)
          } else {
            this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
          }

          this.setSearch('')
          this.$generalNotification('Selected contacts were successfully added.')
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },

    attachedParams () {
      if (this.isContactModule) {
        return {
          contact_list_id: this.contactList.id,
          contacts: this.checkedItems
        }
      }

      if (this.contactList.id === 'my-queue') {
        return {
          // allow_international_phone_numbers: 1,
          // multiple_phone_numbers: 1,
          // future_scheduled_time: '2022-03-09T14:41:36.296Z',
          contact_ids: this.checkedItemIds
        }
      }

      return {
        // allow_international_phone_numbers: 1,
        // multiple_phone_numbers: 1,
        // future_scheduled_time: '2022-03-09T14:41:36.296Z',
        contact_list_id: this.contactList.id,
        contact_ids: this.checkedItemIds
      }
    },

    getSelectedContacts () {
      return this.listItems[this.id].data.filter((i) =>
        this.checkedItems.includes(i.id)
      )
    },

    onCancel () {
      this.closeFilters()

      if (this.contactList.name === 'My Queue') {
        this.$router.push(this.$router.history._startLocation)
        return
      }

      this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
    },

    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
    },

    onCheckAllItems (checked) {
      this.checkedItems = []

      document
        .querySelectorAll('.checker')
        .forEach((checkbox) => {
          if (checked && this.isContactModule) {
            this.checkedItems.push(this.fixedContactsData.data.find(item => item.id === Number(checkbox.value)))
            return
          }

          if (checked && !this.isContactModule) {
            let foundContact = this.fixedContactsData.data.find(item => item.id === Number(checkbox.value))

            if (!(foundContact.is_blocked || foundContact.is_dnc)) {
              this.checkedItems.push(foundContact)
            }

            return
          }

          this.checkedItems = this.checkedItems.filter(item => item.id !== Number(checkbox.value))
        })
    },

    onCheckedRows (checked) {
      this.checkedItems = checked
    },

    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
        return
      }

      this.openFilters()
    },

    resetFilters (resetSearch = false) {
      const defaultFilters = this.fixDefaultFilters()

      this.setCurrentListFilters(defaultFilters)

      if (resetSearch) {
        this.resetSearch()
      }

      this.$VueEvent.fire('filters-reset')
      this.filterHasChanges = false
    },

    hasFilterChanges () {
      return JSON.stringify(this.initialListFilters) !== JSON.stringify(this.currentListFilters)
    },

    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
    },

    updateFiltersCount (count) {
      this.filtersCount = count
    },

    onPagination (params) {
      this.checkedItems = []
      this.onPaginate(params)
    },

    onFetchMyContacts (checked) {
      this.setAddViewShowMyContacts(checked)
      this.$emit('checkboxChanged', checked)
    },

    onSearch (searchText) {
      this.setAddViewShowMyContacts(this.myContacts)
      this.$emit('search', searchText)
    },

    onSortByField (sorts) {
      this.$emit('sort', sorts)
    },

    onPaginate (params) {
      this.$emit('paginated', params)
    },

    onLoadMore () {
      this.$emit('loadMore')
    },

    onCheckerClicked (contact) {
      const items = { data: [] }
      const found = this.checkedItems.find(item => item.id === contact.id)

      if (found) {
        items.data = this.checkedItems.filter(item => item.id !== contact.id)
      } else {
        items.data = [...this.checkedItems]
        items.data.push(contact)
      }

      this.setAllContactsSelected(false)
      this.onCheckedRows(items.data)
    },

    getColumnValue (columnName) {
      if (typeof this.contact[columnName] === 'boolean') {
        return this.contact[columnName] ? 'Yes' : 'No'
      }

      if (typeof this.contact[columnName] !== 'undefined' && this.contact[columnName] !== 0) {
        return this.contact[columnName].toString()
      }

      return this.contact[columnName] === null
        ? '-'
        : this.contact[columnName]
    }
  },

  mounted () {
    this.loadList(this.$route.params.id)

    if (this.contactList && this.contactList.type === this.ContactListTypes.DYNAMIC) {
      this.openFilters()
    }

    this.setAddViewShowMyContacts(this.myContacts)
  },

  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'Contacts' && id) {
        this.loadList(id)
      }
    },

    checkedItemIds: function (value) {
      if (this.isContactModule) {
        document.querySelector('.data-table-check-all').checked = this.fixedContactsData.data.length > 0 && value.length === this.fixedContactsData.data.length
        return
      }

      const filteredContacts = this.fixedContactsData.data.filter(c => {
        return !c.is_dnc && !c.is_blocked
      })

      document.querySelector('.data-table-check-all').checked = this.fixedContactsData.data.length > 0 && value.length === filteredContacts.length
    },

    clicked: function (value) {
      if (value) {
        setTimeout(() => { this.clicked = false }, 2000)
      }
    }
  }
}
</script>
