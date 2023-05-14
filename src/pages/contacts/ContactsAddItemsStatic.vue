<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <router-link
            :to="linkToRoute"
            v-slot="{ href, navigate }"
          >
            <a
              class="btn btn-link p-0 text-muted pr-2"
              :href="href"
              @click="navigate"
            >
              <i class="fa fa-chevron-left"></i>
            </a>
          </router-link>
          <span v-if="!openEdit">Add contacts to</span>
          <div
            v-if="!openEdit"
            class="text-grey-90">
            <span class="title-icon">
              <folder-static-icon/>
            </span>
            {{ contactList.name }}
          </div>
          <TextPopover
            :id="contactList.id"
            :editable="!isMyQueue"
            v-else
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
          {{ checked.length }} Selected Contact
        </div>
        <compact-btn
          class="mr-2"
          variant="primary"
          :disabled="!checked.length || clicked"
          @clicked="addSelectedContacts"
        >
          Add Selected Contacts
        </compact-btn>
        <compact-btn variant="outlined-light"
                     @clicked="onCancel"
        >
          Cancel
        </compact-btn
        >
      </div>
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <search
          placeholder="Search All Contacts"
          limitSearchCharacters
          :disabled="isLoadingDisabled"
          @search="onSearch"
        ></search>
        <div class="px-3">
          <b-form-checkbox
            v-model="myContacts"
            name="check-button"
            size="sm"
            switch
            @change="onFetchMyContacts"
          >
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
            <compact-btn
              borderless
              variant="outlined-light"
              customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
              @clicked="onFiltersClicked"
            >
              <b-badge v-if="hasAppliedFilters"
                       class="ml-2 mt-1"
                       pill
                       variant="primary">
                {{ filtersCount }}
              </b-badge>
              <span class="pl-2  pr-2">Filters</span>

            </compact-btn>
            <compact-btn
              borderless
              customClass="mr-2 pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
              variant="outlined-light"
              v-if="hasAppliedFilters"
              :disabled="!hasAppliedFilters"
              @clicked="resetFilters">
              <i class="fa fa-times"></i>
            </compact-btn>
          </div>
        </div>
      </div>
    </template>

    <template slot="table">
      <datatable
        :stickyHeaders="true"
        :columns="validColumns"
        :is-empty="isEmpty"
        :is-loading-more="isLoadingMore"
        :paginated="false"
        :show-pagination="!isStartState"
        scroll-area-class="pd-datatable"
        :total-rows="contactsData.total"
        :current-page="contactsData.current_page"
        :last-page="contactsData.last_page"
        @onMouseMove="datatableOnMouseMove"
        @onMouseLeave="datatableOnMouseMove"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @paginated="onPagination"
        @more="onLoadMore">
        <template slot="tbody">
          <tr v-for="(contact, index) in contactsData.data"
              :key="`${index}`"
              class="datatable-row">
            <template v-for="(column, key) in validColumns">
              <!-- change date added to date created -->
              <!-- COLUMN: Checkboxes -->
              <!-- <div :key="`key-${key}`">{{contact}}</div> -->
              <td
                v-if="column.name === 'checkbox'"
                :key="`c-${key}`"
                class="text-left pull-left datatable-row__checkbox">

                <label class="custom-checkbox-container">
                  <input
                    type="checkbox"
                    class="checker"
                    :value="contact.id"
                    :checked="checked.find(item => item.id === contact.id) || isAllContactsSelected"
                    @change="onCheckerClicked(contact)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <!-- COLUMN: Name  -->
              <td
                v-else-if="column.name === 'name'"
                class="datatable-row__name"
                :key="`c-${key}`">
                <div class="d-flex align-items-center">
                  <div class="pr-2">
                    <div
                      class="avatar"
                      :style="computedStyle">
                      <div
                        class="avatar__inner">
                        <span v-if="!contact.name || !contact.name.length">
                          <i class="fa fa-user"></i>
                        </span>
                        <span v-else>
                          {{ getInitials(contact.name || 'No Name') }}
                        </span>
                      </div>
                      <slot></slot>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <router-link :to="generateRoute(contact.id)"
                                 class="d-flex align-items-center item contact-name">
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

                    <b-badge v-if="contact.is_dnc"
                             variant="danger"
                             class="badge-phone-info">
                      DNC
                    </b-badge>
                  </div>
                </div>
              </td>
              <!-- COLUMN: Phone Number -->
              <td
                v-else-if="column.name === 'phone_number'"
                class="datatable-row__phone"
                :key="`c-${key}`">
                <div
                  v-if="contact.phone_number"
                  :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                </div>
                <div
                  v-else
                  class="ml-1 text-grey-7 text-center "
                  :class="`${column.draggable ? 'col-indented' : ''}`">
                  --
                </div>
              </td>
              <td
                v-else-if="column.name === 'last_engagement_text'"
                :key="`c-${key}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  <div>{{ contact.last_engagement_text }}</div>
                  <div class="small text-muted">
                    {{ moment(contact.last_engagement_at).format('LLL') }}
                  </div>
                </div>
              </td>
              <!-- COLUMN: Date Added/Created At -->
              <td
                v-else-if="column.name === 'created_at'"
                class="text-left"
                :key="`c-${key}`">
                <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
                  {{ contact.created_at | fixFullDateTime }}
                </div>
              </td>
              <!-- COLUMN: Tags -->
              <td
                v-else-if="column.name === 'tags'"
                :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${key}`"
                @mouseleave="onMouseLeavePopover($event)">

                <template
                  v-if="!contact.tags || (contact.tags && !contact.tags.length)">
                  --
                </template>

                <template
                  v-if="Array.isArray(contact.tags) && contact.tags.length">
                  <div
                    class="d-flex align-items-center contact-tags-item popover-items"
                    :id="`pt-${index}-${key}`"
                    v-if="contact.id"
                    @mouseenter="onMouseOverPopover('Tags', `pt-${index}-${key}`, index, column.name, $event)">
                    <span>
                      <i
                        class="fa fa-circle"
                        :style="`color: ${contact.tags[0].color};font-size:36%;position: relative; top: -3px;`"></i>
                      <span v-if="contact.tags.length > 1">
                        {{ contact.tags[0].name | truncate(17) }}
                      </span>
                      <span
                        v-else>
                        {{ contact.tags[0].name | truncate(27) }}
                      </span>
                    </span>
                    <span
                      v-if="contact.tags.length > 1"
                      class="ml-1 text-grey-7">
                      +{{ (contact.tags.length - 1) }} more
                    </span>
                  </div>
                </template>
              </td>
              <!-- COLUMN: Status -->
              <td
                v-else-if="column.name === 'task_status_name' || column.name === 'task_status'"
                :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${key}`">
                <q-chip
                  :outline="true"
                  :color="getStatusColor(getStatusName(contact.task_status))"
                  text-color="red"
                  size="12px"
                  class="p-0 m-0">
                  {{ getStatusName(contact.task_status) }}
                </q-chip>
              </td>
              <td
                v-else-if="column.name === 'contact_owner'"
                class="datatable-row__name"
                :key="`c-${key}`">
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
              <td
                v-else-if="column.name === 'text_authorized_at'"
                class="text-left"
                :key="`c-${key}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.text_authorized_at ? 'Yes' : 'No' }}
                </div>
              </td>
              <td
                v-else-if="column.name === 'initial_campaign_id'"
                class="text-left"
                :key="`c-${key}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getLineName(contact.initial_campaign_id) }}
                </div>
              </td>
              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${key}`"
                v-else-if="column.name === 'unread_missed_calls_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_missed_calls_count > 0">
                  {{ contact.unread_missed_calls_count }}
                </span>
              </td>
              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${key}`"
                v-else-if="column.name === 'unread_voicemails_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_voicemails_count > 0">
                  {{ contact.unread_voicemails_count }}
                </span>
              </td>
              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${key}`"
                v-else-if="column.name === 'unread_texts_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_texts_count > 0">
                  {{ contact.unread_texts_count }}
                </span>
              </td>
              <td
                v-else
                :key="`c-${key}`"
                @mouseleave="onMouseLeavePopover($event)">

                <div
                  v-if="contact[column.name] === '' || contact[column.name] === null || contact[column.name] === 'NULL' || (contact[column.name] instanceof Array && !contact[column.name].length)"
                  class="text-left">
                  <div :class="`${column.draggable ? 'col-indented' : ''}`">
                    -
                  </div>
                </div>

                <div
                  v-else-if="contact[column.name] && contact[column.name] instanceof Array && contact[column.name].length"
                  class="text-left">
                  <div
                    v-if="contact[column.name].length > 0"
                    :id="`ot-${index}-${key}`"
                    class="d-flex align-items-center popover-items"
                    @mouseenter="onMouseOverPopover(column.label, `ot-${index}-${key}`, index, column.name, $event)">
                    <div
                      v-if="typeof contact[column.name][0].phone_number !== 'undefined'"
                      :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                      {{ contact[column.name][0].phone_number | fixPhone('NATIONAL', true) }}
                    </div>
                    <div
                      v-else
                      :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                      {{ contact[column.name][0].name }}
                    </div>
                    <span
                      v-if="contact[column.name].length > 1"
                      class="ml-1 text-grey-7">
                      +{{ (contact[column.name].length - 1) }} more
                    </span>
                  </div>
                  <span
                    v-if="contact[column.name].length === 0">
                    -
                  </span>
                </div>
                <div
                  v-else-if="contact[column.name] && contact[column.name] instanceof Object && Object.keys(contact[column.name]).length"
                  class="text-left">
                  <div
                    v-if="contact[column.name].id && typeof contact[column.name].name !== 'undefined'"
                    :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                    {{ contact[column.name].name }}
                  </div>
                </div>
                <span
                  v-else-if="contact[column.name] && contact[column.name] instanceof Object && !Object.keys(contact[column.name]).length"
                  class="text-left">
                  - {{ contact[column.name] }}
                </span>
                <div
                  v-else-if="column.name.includes('_at')"
                  class="text-left ellipse col-indented">
                  {{ contact[column.name] | fixFullDateTime }}
                </div>
                <div
                  v-else-if="column.name.includes('date_of_birth')"
                  class="text-left ellipse col-indented" >
                  {{ contact[column.name] | fixFullDate }}
                </div>
                <div
                  v-else
                  class="ellipse"
                  :class="`${[isCountField(column.name) ? 'text-center' : 'text-left']} ${column.draggable ? 'col-indented' : ''}`">
                  {{ typeof contact[column.name] === 'boolean' ? (contact[column.name] ? 'Yes' : 'No') :
                  (typeof contact[column.name] !== 'undefined' && contact[column.name] !== 0 ? contact[column.name].toString() : ( contact[column.name] === null ? '-' : contact[column.name] ) ) }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </datatable>

      <b-popover
        v-if="hoverPopover.target"
        triggers="hover"
        placement="topright"
        boundary="window"
        ref="popover"
        :key="hoverPopover.key"
        :show.sync="hoverPopover.show"
        :target="hoverPopover.target">
        <template #title>
          <div class="contact-tags-title">{{ hoverPopover.title }}</div>
        </template>
        <template v-if="hoverPopover.title === 'Tags'">
          <span class="d-flex align-items-center contact-tags-item"
                v-for="(item, index) in hoverPopover.data"
                :key="`t-${index}`">
            <span :style="`color: ${item.color};`">
              <i class="fa fa-circle" :style="`color: ${item.color};font-size:50%;position: relative; top: -2px;`"></i>
              {{ item.name }}
            </span>
          </span>
        </template>
        <template v-if="hoverPopover.title !== 'Tags'">
          <div
            class="ml-1 w-100"
            v-for="(item, index) in hoverPopover.data"
            :key="`ct-${index}`">
            <i
              class="fa fa-circle text-black"
              :style="`font-size:36%;position: relative; top: -3px;`"></i>
            <span v-if="typeof item.phone_number !== 'undefined'">
              {{ item.phone_number | fixPhone('NATIONAL', true) }}
            </span>
            <span v-else>
              {{ item.name }}
            </span>
          </div>
        </template>
        <span
          v-if="hoverPopover.dataLength > 11"
          class="ml-1 text-grey-7">
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
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Search from 'src/components/search.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import TextPopover from 'components/popover/text-popover'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import {
  aclMixin,
  visibilityMixin,
  viewMixin,
  avatarMixin,
  addViewMixin
} from 'src/plugins/mixins'
import ContactsFilters from 'components/contacts/contacts-filters'
import { isEqual } from 'lodash'

export default {
  mixins: [
    aclMixin,
    visibilityMixin,
    viewMixin,
    avatarMixin,
    addViewMixin
  ],
  inject: [
    'pdContactsData'
  ],

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
    contactList: {
      type: Object,
      required: true
    },
    isContactModule: {
      type: Boolean,
      default: true
    },
    openEdit: {
      type: Boolean,
      default: false
    },
    isLoadingDisabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      checkedItems: [],
      filterHasChanges: false,
      listName: '',
      myContacts: false,
      clicked: false,
      contactCount: 0
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('contacts', ['lists', 'listItems', 'isFiltersOpen']),
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
      return this.$attrs?.id === 'my-queue'
    },
    lastPage () {
      return this.listItems?.[this.id]?.last_page || 0
    },
    totalRows () {
      return this.listItems?.[this.id]?.total || 0
    },
    contactWithNoPrimaryNumbers () {
      return this.contactsData.data.filter(contact => {
        return contact.phone_numbers[0].is_primary === false
      })
    },
    fixedContactsData () {
      if (isEqual(this.$parent.$data.contactsData, this.pdContactsData)) {
        return this.pdContactsData
      }

      return this.$parent.$data.contactsData
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'foldersLoaded',
      'columnsReordered',
      'setShouldUpdateSelectedListContactCount',
      'setSearch',
      'setShowMyContacts'
    ]),
    updateListName (data) {
      const id = this.$attrs.id === 'my-queue' ? this.selectedList.id : this.$attrs.id
      this.$axios
        .patch(`/api/v2/power-dialer-lists/${id}`, {
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
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    addSelectedContacts () {
      this.clicked = true
      this.isLoading = true
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
        .finally(() => {
          this.isLoading = false
        })
    },
    attachedParams () {
      if (this.isContactModule) {
        return {
          contact_list_id: this.contactList.id,
          contacts: this.checkedItems
        }
      } else {
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
      } else {
        this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
      }
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
          if (checked) {
            if (this.isContactModule) {
              this.checkedItems.push(this.contactsData.data.find(item => item.id === Number(checkbox.value)))
            } else {
              let foundContact = this.contactsData.data.find(item => item.id === Number(checkbox.value))
              if (!(foundContact.is_blocked || foundContact.is_dnc)) {
                this.checkedItems.push(foundContact)
              }
            }
          } else {
            this.checkedItems = this.checkedItems.filter(item => item.id !== Number(checkbox.value))
          }
        })
    },
    onCheckedRows (checked) {
      this.checkedItems = checked
    },
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
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
      this.setShowMyContacts(checked)
      this.$emit('checkboxChanged', checked)
    },
    onSearch (searchText) {
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
    }
  },
  mounted () {
    if (!this.isAdmin && this.currentCompany.disable_power_dialer_add && this.$route.name === 'Power Dialer') {
      this.$generalNotification('Adding task to Power Dialer list is currently disabled. Redirecting...', 'info', 2000)
      setTimeout(() => {
        if (this.contactList.id === 'my-queue') {
          this.$router.push(`/power-dialer`)
        } else {
          this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
        }
      }, 3000)
      return
    }

    this.listName = ''
    this.fetch()
  },
  watch: {
    '$route.params.id': function () {
      this.fetch()
    },
    checkedItemIds: function (value) {
      if (this.isContactModule) {
        document.querySelector('.data-table-check-all').checked = this.contactsData.data.length > 0 && value.length === this.contactsData.data.length
      } else {
        const filteredContacts = this.contactsData.data.filter(c => {
          return !c.is_dnc && !c.is_blocked
        })
        document.querySelector('.data-table-check-all').checked = this.contactsData.data.length > 0 && value.length === filteredContacts.length
      }
    },
    clicked: function (value) {
      if (value) {
        setTimeout(() => { this.clicked = false }, 2000)
      }
    }
  }
}
</script>
