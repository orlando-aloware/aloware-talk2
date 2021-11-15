<template>
  <PowerDialerViewScreen
    :loading="datatableLoader">

    <template slot="title">
      <Breadcrumbs
        :directory-list="powerDialerListOfObjects"
        :history-mode="true" />
    </template>

    <template slot="options">
      <div class="d-flex align-items-center">
        <div class="selected-contacts text-muted mr-2">
          {{ checked.length }} Selected Contact
        </div>
        <CompactBtn
          class="mr-2"
          variant="primary"
          :disabled="!checked.length"
          @clicked="addSelectedContacts">
          Add Selected Contacts
        </CompactBtn>
        <CompactBtn
          variant="outlined-light"
          @clicked="onCancel">
          Cancel
        </CompactBtn>
      </div>
    </template>

    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <search
          placeholder="Search All Contacts"
          @search="onSearch"
          :disabled="isLoadingDisabled"
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
          <span class="small text-muted selected-contacts mr-2">{{ totalCount }} Contacts</span>

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
      <div>
        <div class="pr-2">

          <Datatable
            :stickyHeaders="true"
            :columns="validColumns"
            :has-more="true"
            :is-empty="!hasContacts"
            :is-loading-more="true"
            :paginated="true"
            scroll-area-class="static-list-add-item"
            :total-rows="totalList"
            @reordered="onColumnsReordered"
            @sort="onSortByField"
            @more="onLoadMore">
            <template slot="tbody">
              <TableRow
                v-for="(contact, nkey) in currentContacts"
                :key="`power-dialer-${contact.id}-${nkey}`"
                :contact="contact"
                :columns="validColumns"
                :checked="checked"
                :contactListId="id"
                :custom-row-content="true"
                @checked="onCheckedRows">
                <template slot="custom-content">
                  <template v-for="(column, key) in validColumns">
                    <!-- change date added to date created -->
                    <!-- COLUMN: Checkboxes -->
                    <td
                      v-if="column.name === 'checkbox'"
                      :key="key"
                      class="p-0">
                      <CheckBox
                        :resource="contact"
                        :checked-items="checked"
                        @checked="onCheckboxCheck" />
                    </td>
                    <!-- COLUMN: Name  -->
                    <td
                      v-else-if="column.name === 'name'"
                      :key="column.name"
                      class="datatable-row__name">
                      <NameWrapper
                        :resource="contact"
                        link-path="/power-dialer/" />
                    </td>
                    <!-- COLUMN: Phone Number -->
                    <td
                      v-else-if="column.name === 'phone_number'"
                      :key="column.name"
                      class="datatable-row__phone">
                      <div
                        v-if="contact.phone_number"
                        :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                        {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                      </div>
                      <span v-else class="ml-1 text-grey-7 text-center">--</span>
                    </td>
                    <!-- COLUMN: Date Added/Created At -->
                    <td
                      class="text-left"
                      :key="column.name"
                      v-else-if="column.name === 'created_at'">
                      <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                        {{ contact.created_at | fixDate }}
                      </div>
                    </td>
                    <!-- COLUMN: Tags -->
                    <td
                      v-else-if="column.name === 'tags'"
                      :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                      :key="column.name">
                      <TagPopover
                        :resource="contact" />
                    </td>
                    <!-- COLUMN: Status -->
                    <td
                      v-else-if="column.name === 'status'"
                      :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                      :key="key">
                      <StatusChip
                        :status="contact.status"
                        size="12px"
                        :outline="true" />
                    </td>
                    <!-- <td
                      v-else-if="column.name === 'actions'"
                      :key="key">
                      <button
                        @click="onRemove(contact)"
                        class="btn btn-sm btn-link datatable-row__actions__action--trash">
                        <TrashOIcon />
                      </button>
                    </td> -->
                    <!-- <td
                      v-else
                      :key="key">
                      -> {{ column.name }}
                    </td> -->
                  </template>
                </template>
              </TableRow>
            </template>
          </Datatable>

        </div>
      </div>
      <ConfirmDialog
        v-model="isOpen"
        @close="closeModal"
        :id="dialogName"
        :is-open="isOpen"
        :hide-header="true"
        :hide-footer="true"
        title="Are you really really sure?"
        size="sm">
        <div slot="content">
          <div class="text-center text-h6 pb-4">
            <TrashOIcon height="20" width="20" />
            Remove Contact?
          </div>
          <div class="text-center py-3">
            <div class="text-dark">
              <div v-html="`Do you want to remove the contact: ${selectedItem.name}?`"></div>
            </div>
          </div>
          <div class="row text-center pt-3 pb-0">
            <div class="col-6 p-1">
              <b-button
                variant="dark-grey"
                class="f-btn--cancel"
                size="sm"
                block
                @click="closeModal">
                Cancel
              </b-button>
            </div>
            <div class="col-6 p-1">
              <b-button
                variant="danger"
                size="sm"
                block
                @click="{}">
                Remove
              </b-button>
            </div>
          </div>
        </div>
      </ConfirmDialog>
    </template>

  </PowerDialerViewScreen>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerViewScreen from './power-dialer-view-screen'
import Breadcrumbs from 'src/components/breadcrumbs'
// import BulkActionMenu from 'src/components/bulk-action-menu-2'
import Datatable from 'src/components/datatable'
import TableRow from 'src/components/table-row'
import Search from 'components/search'
import CheckBox from '../checkbox-interactive'
import NameWrapper from '../name-wrapper'
import TagPopover from '../tag-popover'
import StatusChip from '../status-chip'
import ConfirmDialog from 'components/confirm-dialog'
import powermixin from 'src/plugins/mixins/power-dialer'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import CompactBtn from 'src/components/compact-btn'

export default {
  name: 'PowerDialerAddListItems',
  props: {
    powerDialerList: {
      type: Object,
      required: true
    }
  },
  mixins: [powermixin, contactsMixins],
  components: {
    PowerDialerViewScreen,
    Breadcrumbs,
    // BulkActionMenu,
    Search,
    Datatable,
    TableRow,
    CheckBox,
    NameWrapper,
    StatusChip,
    TagPopover,
    CompactBtn,
    ConfirmDialog
  },
  computed: {
    ...mapGetters('powerDialer', [
      'datatableLoader',
      'selectedContacts',
      'powerDialerDirectoryList',
      'powerDialerListItems'
    ]),
    totalCount () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].total
      }
      return 0
    },
    hasAppliedFilters () {
      return this.filtersCount > 0
    },
    validColumns () {
      return this.columns2.filter(column => column.label !== 'Actions')
    }
  },
  data () {
    return {
      id: 'all'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'contactsLoaded',
      'columnsReordered',
      'setShouldUpdateSelectedListContactCount'
    ]),
    addSelectedContacts () {
      this.isLoading = true
      this.closeFilters()
      return this.$axios
        .post('api/v2/contact-list-items', {
          contact_list_id: this.contactList.id,
          contacts: this.checked
        })
        .then(() => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.$router.push('/contacts/list/' + this.contactList.id)
          this.$generalNotification('Selected contacts were successfully added')
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
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
    },
    onCancel () {
      this.closeFilters()
      this.$router.push('/power-dialer/list/' + this.contactList.id)
    },
    onColumnsReordered (nextColumns) {
      console.log('Re-ordered columns...', nextColumns)
    }
  }
}
</script>
