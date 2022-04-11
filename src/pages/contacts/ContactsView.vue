<template>
  <contacts-screen v-if="list"
                   :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="pr-2 contacts__title d-flex align-items-center">
          <back-button class="p-0"
                       v-if="$q.screen.lt.md"
                       @click="toggleSidebar"/>
          <div class="d-flex align-items-center">
            <div v-for="(folderName, index) in folderPath"
                 :key="`f-${index}`"
                 class="d-flex align-items-center title-path">
              <div class="title-breadcrumb d-flex align-items-center">{{ folderName }}</div>
              <slash-icon class="title-slash d-flex align-items-center" />
            </div>
          </div>
          <folder-static-icon class="title-static-icon mr-3"
                              v-if="list.type === ContactListTypes.STATIC">
          </folder-static-icon>
          <folder-dynamic-icon class="mr-3"
                               v-if="list.type === ContactListTypes.DYNAMIC">
          </folder-dynamic-icon>
          <div class="d-flex align-items-center">
            <span
              :class="`list-name ${isUnsavedList ? 'text-grey-30' : ''}`">
              {{ list.name || (isUnsavedList ? unsavedList.name : '') }}
              <q-chip
                class="m-0 p-0"
                text-color="white"
                color="grey-80"
                style="margin-left:10px !important;"
                size="sm"
                v-if="isUnsavedList">
                Unsaved
              </q-chip>
            </span>
          </div>
        </div>
      </div>
    </template>
    <template slot="options" v-if="!isStartState">
      <compact-btn
        :class="`${isUnsavedList ? 'hidden' : ''}`"
        variant="primary"
        v-if="list.type === ContactListTypes.DYNAMIC && isEditable"
        :disabled="isFiltersOpen"
        @clicked="onFiltersClicked"
      >
        <i class="fa fa-plus mr-2"></i> Add Filters
      </compact-btn>
    </template>

    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <div class="d-flex justify-content-between align-items-center">
          <search
            class="width-250"
            :search="search"
            @search="onSearch"
            :disabled="isLoadingDisabled">
          </search>
          <div class="contacts-total mobile">
            <div class="small text-muted fs-13 text-right" v-if="selectedList.type === ContactListTypes.DYNAMIC">{{ listItemsTotalContacts }} Contacts</div>
            <div class="small text-muted fs-13 text-right" v-else> {{ listItemsTotalContacts }} of {{ selectedList.contactCount }} Contacts</div>
          </div>
        </div>
        <div class="px-3 d-inline-flex"
             v-if="!isMyContactsView && !isTabletOrMobile">
          <q-tooltip
            class="text-center"
            anchor="top middle"
            self="bottom middle"
            max-width="185px"
            v-if="$route.params.id === 'unassigned'">
            Unable to modify Filters. Duplicate this list if you want to modify
          </q-tooltip>
          <label class="text-primary mr-2 mt-2 cursor-pointer"
                 :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }">My Contacts</label>
          <b-form-checkbox
            id="my-contacts"
            class="mt-2 cursor-pointer"
            name="check-button"
            size="sm"
            switch
            :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }"
            :disabled="isLoading || $route.params.id === 'unassigned'"
            v-model="myContacts"
            @change="onFetchMyContacts"
          >
          </b-form-checkbox>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center pr-2">
        <div class="flex-grow-1"></div>
        <div class="px-3 d-inline-flex"
             v-if="!isMyContactsView && isTabletOrMobile">
          <q-tooltip
            class="text-center"
            anchor="top middle"
            self="bottom middle"
            max-width="185px"
            v-if="$route.params.id === 'unassigned'">
            Unable to modify Filters. Duplicate this list if you want to modify
          </q-tooltip>
          <label class="text-primary mr-2 mt-2 cursor-pointer"
                 :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }">My Contacts</label>
          <b-form-checkbox
            id="my-contacts"
            class="mt-2 cursor-pointer"
            name="check-button"
            size="sm"
            switch
            :class="{ disabled: (isLoading || $route.params.id === 'unassigned') }"
            :disabled="isLoading || $route.params.id === 'unassigned'"
            v-model="myContacts"
            @change="onFetchMyContacts"
          >
          </b-form-checkbox>
        </div>
        <div class="contacts-total desktop">
          <div
            class="small text-muted fs-13 text-right"
            v-if="selectedList.type === ContactListTypes.DYNAMIC">
            {{ selectedList.contactCount }} Contacts
          </div>
          <div
            class="small text-muted fs-13 text-right"
            v-else>
            {{ listItemsTotalContacts }} of {{ selectedList.contactCount }} Contacts
          </div>
        </div>
        <hr role="separator" aria-orientation="vertical" class="contacts-header-separator q-separator height-28margin-auto position-relative q-separator q-separator--vertical">
        <div class="d-flex align-items-center pr-2 pl-2"
             :class="['btn-filter-wrapper mr-2', isFiltersOpen ? 'background' : '' ]">
          <compact-btn borderless
                       customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       variant="outlined-light"
                       v-if="hasAppliedFilters"
                       :disabled="isResetDisabled"
                       @clicked="resetFilters">
            <close-icon width="14px"
                        height="14px"
                        icon-color="#62666E">
            </close-icon>
          </compact-btn>
          <compact-btn borderless
                       variant="outlined-light"
                       customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       :disabled="isStartState"
                       @clicked="onFiltersClicked">
            <span class="pl-2 pr-2 d-flex filter-toggle-button align-items-center">Filters</span>
            <b-badge v-if="hasAppliedFilters"
                     class="d-flex align-items-center contact-filter-count"
                     pill
                     variant="primary">
              {{ filtersCount }}
            </b-badge>
          </compact-btn>
        </div>

        <compact-btn
          variant="primary"
          v-if="selectedList.type !== ContactListTypes.STATIC && !['all', 'my-contacts', 'unassigned', 'unanswered', 'new-leads'].includes(selectedList.id)"
          :disabled="!filterHasChanges || defaultIds.includes(this.id) || isUpdatingList || list.show_in_public_folder"
          :customClass="saveFilterButtonCustomClass"
          @clicked="onUpdateContactList">
          <q-spinner-bars v-if="isUpdatingList"
                          color="white"
                          class="mr-1"/>
          {{ isUpdatingList ? ' Saving...' : 'Save' }}
        </compact-btn>
        <b-dropdown text="Add Contacts"
                    right
                    no-caret
                    variant="light"
                    class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                    toggle-class="filter-toggle-button py-0 my-0 d-flex align-items-center"
                    v-if="((list.type === ContactListTypes.STATIC && isEditable) || this.id === 'all') &&  !list.show_in_public_folder">
          <template #button-content class="filter-toggle-button">
            <div class="filter-toggle-button d-flex align-items-center">
              Add Contacts
            </div>
            <i class="fa fa-chevron-down fs-12 filter-toggle-button d-flex align-items-center ml-2 text-grey-90"
               style="margin-top: 2px;"></i>
          </template>
          <b-dropdown-item href="#"
                           :disabled="!(list.type === ContactListTypes.STATIC && isEditable)"
                           v-b-tooltip.hover="{ placement: 'top', title: (!(list.type === ContactListTypes.STATIC && isEditable) ? 'Unable to modify Filters. Duplicate this list if you want to modify' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }"
                           @click="onAddContactsToList">
            <search-icon color="#62666E">
            </search-icon>
            Select Existing Contacts & Add to List
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           @click="onShowCreateContact">
            <plus-icon color="#62666E"></plus-icon>
            Create New Contact {{ list.type === ContactListTypes.STATIC && !list.show_in_public_folder ? '& Add to List' : '' }}
          </b-dropdown-item>
        </b-dropdown>

        <contact-create-modal :id="createContactModalId"
                              @created="onContactCreated"></contact-create-modal>

        <b-dropdown text="..."
                    no-caret
                    right
                    variant="light"
                    class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <ellipse-icon></ellipse-icon>
          </template>
          <b-dropdown-item href="" @click="onEditColumnsClicked">
            <edit-hamburger-icon></edit-hamburger-icon>
            Edit Columns
          </b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true">
            <power-dialer-mobile-icon width="14" height="14" color="#62666E"></power-dialer-mobile-icon>
            Power Dialer
          </b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true">
            <export-icon></export-icon>
            Export as CSV
          </b-dropdown-item>
          <b-dropdown-item href=""
                           :disabled="isListDeletable"
                           v-b-tooltip.hover="{ placement: 'top', title: (isListDeletable ? 'Unable to modify Filters. Duplicate this list if you want to modify' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }"
                           @click="onRemoveList">
            <delete-red-icon></delete-red-icon>
            <span class="text-danger">
              Delete
            </span>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </template>
    <template slot="actions">
      <bulk-action-menu :id="id" v-if="checked.length > 0"></bulk-action-menu>
    </template>

    <template slot="table">
      <datatable
        :stickyHeaders="true"
        :columns="columns"
        :isEmpty="isEmpty || isStartState"
        :isLoadingMore="isLoadingMore"
        :is-loading="isLoading"
        :contact-list-id="id"
        :paginated="false"
        :show-pagination="!isStartState"
        :total-rows="this.fixedContactsData.total"
        :current-page="this.fixedContactsData.current_page"
        :last-page="this.fixedContactsData.last_page"
        v-if="listItemsHasData"
        @onMouseMove="datatableOnMouseMove"
        @onMouseLeave="datatableOnMouseMove"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @paginated="onPaginate"
        @more="onLoadMore">
        <template slot="tbody">
          <tr v-for="(contact, index) in this.fixedContactsData.data"
              :key="`${index}`"
              class="datatable-row">
            <template
              v-if="customRowContent">
              <slot name="custom-content" />
            </template>

            <template
              v-else
              v-for="(column, colIndx) in fixedColumns">
              <td
                v-if="column.name === 'checkbox'"
                :key="`c-${colIndx}`"
                class="text-left pull-left datatable-row__checkbox">

                <label class="custom-checkbox-container">
                  <input
                    type="checkbox"
                    class="checker"
                    :value="contact.id"
                    :checked="checked.find(item => item.id === contact.id)"
                    @change="onCheckerClicked(contact)" />
                  <span class="checkmark"></span>
                </label>
              </td>

              <td
                v-else-if="column.name === 'name'"
                class="datatable-row__name"
                :key="`c-${colIndx}`">
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
                    <a href=""
                       @click="onNavigate(contact.id, $event)"
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
                    </a>
                    <b-badge v-if="contact.is_dnc"
                                 variant="danger"
                                 class="badge-phone-info">
                    DNC
                  </b-badge>
                  </div>
                </div>
              </td>
              <td
                v-else-if="column.name === 'contact_owner'"
                class="datatable-row__name"
                :key="`c-${colIndx}`">
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
                v-else-if="column.name === 'phone_number'"
                class="datatable-row__phone"
                :key="`c-${colIndx}`">
                <div
                  v-if="contact.phone_number"
                  :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.phone_number | fixPhone('NATIONAL', true) }}
                </div>
                <div
                  v-else
                  class="ml-1 text-grey-7 text-center "
                  :class="`${column.draggable ? 'col-indented' : ''}`">
                  -
                </div>
              </td>

              <td
                v-else-if="column.name === 'contact_owner'"
                class="datatable-row__phone"
                :key="`c-${colIndx}`">
                <div
                  v-if="contact.user_id"
                  :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getOwnerName(contact.user_id) }}
                </div>
                <div
                  v-else
                  class="ml-1 text-grey-7 text-center "
                  :class="`${column.draggable ? 'col-indented' : ''}`">
                  -
                </div>
              </td>

              <td
                v-else-if="column.name === 'last_engagement_text'"
                :key="`c-${colIndx}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  <div>{{ contact.last_engagement_text }}</div>
                  <div class="small text-muted">
                    {{ moment(contact.last_engagement_at).format('LLL') }}
                  </div>
                </div>
              </td>

              <td
                v-else-if="column.name === 'tags'"
                :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${colIndx}`"
                @mouseleave="onMouseLeavePopover($event)">

                <template
                  v-if="!contact.tags || (contact.tags && !contact.tags.length)">
                  -
                </template>

                <template
                  v-if="Array.isArray(contact.tags) && contact.tags.length">
                  <div
                    class="d-flex align-items-center contact-tags-item popover-items"
                    :id="`pt-${index}-${colIndx}`"
                    v-if="contact.id"
                    @mouseenter="onMouseOverPopover('Tags', `pt-${index}-${colIndx}`, index, column.name, $event)">
                    <span :style="`color: ${contact.tags[0].color};`">
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

              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${colIndx}`"
                v-else-if="column.name === 'unread_texts_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_texts_count > 0">
                  {{ contact.unread_texts_count }}
                </span>
              </td>

              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${colIndx}`"
                v-else-if="column.name === 'unread_missed_calls_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_missed_calls_count > 0">
                  {{ contact.unread_missed_calls_count }}
                </span>
              </td>

              <td
                :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                :key="`c-${colIndx}`"
                v-else-if="column.name === 'unread_voicemails_count'">
                <span
                  class="badge badge-danger unread-text bg-red-80"
                  v-if="contact.unread_voicemails_count > 0">
                  {{ contact.unread_voicemails_count }}
                </span>
              </td>

              <td
                v-else-if="column.name === 'text_authorized_at'"
                class="text-left"
                :key="`c-${colIndx}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.text_authorized_at ? 'Yes' : 'No' }}
                </div>
              </td>

              <td
                v-else-if="column.name === 'initial_campaign_id'"
                class="text-left"
                :key="`c-${colIndx}`">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getLineName(contact.initial_campaign_id) }}
                </div>
              </td>

              <td
                v-else-if="column.name === 'created_at'"
                class="text-left"
                :key="`c-${colIndx}`">
                <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
                  {{ contact.created_at | fixDate }}
                </div>
              </td>

              <td
                v-else-if="column.name === 'actions'"
                class="text-left datatable-row__actions"
                :key="`c-${colIndx}`">
                <div>
                  <button class="btn btn-sm datatable-row__actions__action--call"
                          @click="onCall(contact)">
                    <!--call-o-icon color="#62666E"></call-o-icon-->
                    <span class="aloicons action-icons">@</span>
                  </button>
                  <button class="btn btn-sm datatable-row__actions__action--chat"
                          @click="onMessage(contact.id)">
                    <!--message-o-icon></message-o-icon-->
                    <span class="aloicons action-icons">A</span>
                  </button>
                  <button v-if="!list.show_in_public_folder"
                          class="btn btn-sm datatable-row__actions__action--trash"
                          @click="onRemove(contact, id)">
                    <span class="aloicons action-icons">B</span>
                  </button>
                </div>
              </td>

              <td
                v-else
                :key="`c-${colIndx}`"
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
                    :id="`ot-${index}-${colIndx}`"
                    class="d-flex align-items-center popover-items"
                    @mouseenter="onMouseOverPopover(column.label, `ot-${index}-${colIndx}`, index, column.name, $event)">
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
                  v-else-if="column.name.includes('_at') || column.name.includes('date')"
                  class="text-left ellipse">
                  {{ contact[column.name] | fixFullDateTime }}
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

        <template slot="empty"
                  v-if="showEmptySlot">
          <div class="start-state" @click="onNavigateToAdd($event)">
            <div
              class="p-4 bg-light w-100 text-center border-bottom text-primary"
            >
              <template v-if="list.type == ContactListTypes.STATIC">
                Add contacts <i class="fa fa-plus"></i>
              </template>
              <template v-else-if="list.type == ContactListTypes.DYNAMIC">
                Add Contacts through a Filter <i class="fa fa-plus"></i>
              </template>
            </div>
          </div>
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
      <contacts-filters @filtersUpdated="updateFilterHasChanges"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import moment from 'moment'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapGetters, mapState } from 'vuex'
import _ from 'lodash'
import BulkActionMenu from 'src/components/bulk-action-menu'
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import ContactsFilters from 'src/components/contacts/contacts-filters'
import { FROM_FILTERS } from 'src/constants/contacts-list-create-mode'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import talk2Api from 'src/plugins/api/api'
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import CloseIcon from 'components/icons/close-icon'
import SlashIcon from 'components/icons/slash-icon'
import EllipseIcon from 'components/icons/ellipse-icon'
import SearchIcon from 'components/icons/search-icon'
import PlusIcon from 'components/icons/plus-icon'
import Search from 'components/search'
import EditHamburgerIcon from 'components/icons/edit-hamburger-icon'
import PowerDialerMobileIcon from 'components/icons/mobile-menu/power-dialer-mobile-icon'
import ExportIcon from 'components/icons/export-icon'
import DeleteRedIcon from 'components/icons/delete-red-icon'
import BackButton from 'components/back-button'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import { avatarMixin, contactListCountMixin } from 'src/plugins/mixins'

export default {
  name: 'contacts-view',

  mixins: [
    avatarMixin,
    contactListCountMixin
  ],

  inject: [
    'contactsData'
  ],

  components: {
    BackButton,
    DeleteRedIcon,
    ExportIcon,
    PowerDialerMobileIcon,
    EditHamburgerIcon,
    Search,
    PlusIcon,
    SearchIcon,
    EllipseIcon,
    SlashIcon,
    CloseIcon,
    FolderDynamicIcon,
    FolderStaticIcon,
    ContactCreateModal,
    ContactsFilters,
    BulkActionMenu,
    CompactBtn,
    ContactsScreen,
    Datatable,
    ImportContactsModal
  },

  props: {
    // contactsData: {
    //   type: Object,
    //   default: () => {}
    // },
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
    },
    customRowContent: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      filterHasChanges: false,
      defaultContactLists: DEFAULT_PINNED_LIST,
      isUpdatingList: false,
      folderPath: [],
      createContactModalId: 'contacts-list-create-contact-modal',
      myContacts: false,
      moment,
      hoverPopover: {
        key: 0,
        title: '',
        target: '',
        show: false,
        data: [],
        dataLength: 0
      },
      datatableTarget: null,
      countFields: [
        'unread_texts_count',
        'unread_missed_calls_count',
        'unread_voicemails_count',
        'inbound_calls_count',
        'inbound_texts_count',
        'inbound_communications_count',
        'outbound_calls_count',
        'outbound_texts_count',
        'outbound_communications_count',
        'communications_count'
      ],
      hasNextPage: false,
      ContactListTypes
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'setSelectedList',
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'columnsReordered',
      'setListSelectedContacts',
      'createListOpen',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch',
      'setShouldUpdateSelectedListContactCount',
      'setSelectedListContactCount',
      'pinnedCountLoaded',
      'setShowMyContacts',
      'setShowContactsListSidebar',
      'createListClose',
      'foldersLoaded',
      'setUnsavedList',
      'removeContactOpen',
      'setBulkDelete',
      'setMessageComposerMode'
    ]),
    onSearch (searchText) {
      this.$emit('search', searchText)
    },
    onFetchMyContacts (checked) {
      this.setShowMyContacts(checked)
      this.$emit('checkboxChanged', checked)
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
    getListData (id) {
      return this.$axios
        .get('/api/v2/contacts-list/' + id + (this.$route.query.type && this.$route.query.type === 'public' ? '?is_public_list=true' : ''))
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: id })
          this.setSelectedList({ id: response.id, name: response.name, type: response.type })
        }).catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.$router.replace('/contacts')
        })
    },
    loadList (id) {
      if (!id) {
        id = 'all'
      }

      const stringId = String(id)

      this.name = this.list.name
      this.type = this.list.type

      const listFilter = typeof this.list.filters === 'string' ? JSON.parse(this.list.filters) : this.list.filters

      const filters = this.list.type === this.ContactListTypes.DYNAMIC ? listFilter : {
        contact_lists: {
          operator: 1,
          value: [stringId]
        }
      }
      this.setCurrentListFilters(filters)

      this.setDataCount(
        this.list.type === this.ContactListTypes.DYNAMIC ? listFilter : {
          0: {
            filters: {
              contact_lists: {
                operator: 1,
                value: [stringId]
              }
            },
            is_conjunction: true
          }
        }
      )
    },
    setData (id) {
      const list = this.lists[id] || {}
      if (Object.values(list).length > 0) {
        this.name = list.name
        this.type = list.type
        this.setSelectedList({ id: this.id, name: this.name, type: this.type })
      }
    },
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
    },
    onCheckAllItems (checked) {
      const items = { data: [] }
      document
        .querySelectorAll('.checker')
        .forEach((checkbox) => {
          if (checked) {
            items.data.push(this.fixedContactsData.data.find(item => item.id === Number(checkbox.value)))
          } else {
            items.data = items.data.filter(item => item.id !== Number(checkbox.value))
          }
        })

      this.setListSelectedContacts({ id: this.id, contacts: items.data })
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.id, contacts: checked })
    },
    onEditColumnsClicked () {
      this.columnsOpen({
        id: this.id,
        headers: this.columns,
        name: this.list.name
      })
    },
    onImportContactsClicked () {
      this.$refs.importContacts.open()
    },
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
    },
    onCreateStaticList () {
      this.createListOpen({
        type: 1,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onCreateDynamicList () {
      this.createListOpen({
        type: 2,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onUpdateContactList () {
      if (this.selectedList.type === this.ContactListTypes.STATIC || this.defaultIds.includes(this.id)) {
        return
      }
      this.isUpdatingList = true
      if (_.isEmpty(this.unsavedList)) {
        console.log('Updating existing dynamic list...')
        return this.$axios
          .put('/api/v2/contacts-list/' + this.selectedList.id, { filters: this.currentListFilters })
          .then(() => {
            this.initialListFilters = this.currentListFilters
            this.updateFilterHasChanges()
            this.isUpdatingList = false
            this.$generalNotification('Changes to contact list has been saved.')

            if (this.listItems[this.selectedList.id] && this.listItems[this.selectedList.id].total) {
              this.pinnedCountLoaded({
                id: this.selectedList.id,
                count: this.listItems[this.selectedList.id].total
              })
            }
          })
          .catch((_err) => {
            console.log(_err)
            this.$generalNotification('Unable to update contact list.', 'error')
          })
      } else {
        console.log('Creating new dynamic list...')
        // debugger
        const params = this.unsavedList.params
        params.filters = this.currentListFilters
        return this.$axios
          .post('/api/v2/contacts-list', params)
          .then((response) => {
            const data = response.data.data
            const message = response.data.message

            this.createListClose()

            this.$generalNotification(message)

            this.loadFolders()
            this.setUnsavedList(null)
            this.$router.push(`/contacts/list/${data.id}`)
          })
          .catch((error) => {
            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.errorMsg = message
            this.$generalNotification(message, 'error')
          })
          .finally(() => {
            this.isUpdatingList = false
          })
      }
    },
    loadFolders () {
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onShowCreateContact (e) {
      this.$root.$emit('bv::show::modal', this.createContactModalId, e.target)
      e.stopImmediatePropagation()
    },
    onAddContactsToList () {
      this.$router.push(`/contacts/list/${this.$route.params.id}/add`)
    },
    onRemoveList () {
      this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name })
    },
    hasFilterChanges () {
      return JSON.stringify(this.initialListFilters) !== JSON.stringify(this.currentListFilters)
    },
    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
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
    fixDefaultFilters () {
      if (_.isEmpty(this.list)) {
        return []
      }
      const defaultFilters = !_.isEmpty(this.list.filters) ? JSON.parse(JSON.stringify(this.list.filters)) : {}
      if (this.$route.params.id === 'my-contacts') {
        const filter = _.get(defaultFilters, '[0].filters.contact_owner', null)
        const profileId = _.get(this.profile, 'id', null)
        if (filter && profileId) {
          defaultFilters[0].filters.contact_owner.value = [profileId]
        }
      }
      return typeof defaultFilters === 'string' ? JSON.parse(defaultFilters) : defaultFilters
    },

    onContactCreated (contact) {
      if (this.list.type === this.ContactListTypes.STATIC && !this.list.show_in_public_folder) {
        talk2Api.V2.contactListItem.addContact(this.id, [contact]).then(res => {
          this.$VueEvent.fire('shouldUpdateListCount')
          this.$VueEvent.fire('fetchContacts')
        })
      } else {
        this.$VueEvent.fire('shouldUpdateListCount')
        this.$VueEvent.fire('fetchContacts', {
          params: {
            page: this.fixedContactsData.current_page
          }
        })
      }
    },
    generateFolderPath (folders = [], folderNames = [], level = 0) {
      const tempFolderNames = { data: _.clone(folderNames) }

      if (!folders.length && level > 0) {
        return [tempFolderNames.data, false]
      }

      const item = { data: null }
      const list = { data: null }
      for (item.data of folders) {
        if (level > 0) {
          tempFolderNames.data.push(item.data.name)
        } else {
          tempFolderNames.data = []
        }

        const found = { data: false }

        if (item.data.lists.length) {
          for (list.data of item.data.lists) {
            const isNotNumber = isNaN(this.id / 1)

            if (isNotNumber || (!isNotNumber && list.data.id !== parseInt(this.id))) {
              continue
            }

            if (level === 0) {
              return []
            }

            return [tempFolderNames.data, true]
          }
        }

        const childFolders = _.get(item.data, 'child_folders', [])

        if (childFolders.length === 0 && !found.data) {
          tempFolderNames.data.pop()
        }

        if (childFolders.length === 0 && found.data) {
          return [tempFolderNames.data, found.data]
        }

        [tempFolderNames.data, found.data] = this.generateFolderPath(item.data.child_folders, tempFolderNames.data, (level + 1))

        if (found.data && level > 0) {
          return [tempFolderNames.data, found.data]
        }

        if (found.data && level === 0) {
          return tempFolderNames.data
        }

        tempFolderNames.data.pop()
      }

      if (level > 0) {
        return [tempFolderNames.data, false]
      }

      return []
    },
    toggleSidebar () {
      this.setShowContactsListSidebar(!this.showContactsListSidebar)
    },
    reRouteToBase () {
      if (this.id === 'unsaved' && _.isEmpty(this.unsavedList)) {
        this.$router.push(`/contacts`)
      }
    },
    getLineName (id) {
      const found = this.campaigns.find(campaign => campaign.id === id)
      return found ? found.name : '-'
    },
    getUserName (userId) {
      const user = this.users.find(item => item.id === userId)

      return user ? user.name : '-'
    },
    onCheckerClicked (contact) {
      const items = { data: [] }
      const found = this.checked.find(item => item.id === contact.id)
      if (found) {
        items.data = this.checked.filter(item => item.id !== contact.id)
      } else {
        items.data = [...this.checked]
        items.data.push(contact)
      }

      this.onCheckedRows(items.data)
    },
    isCountField (columnName) {
      return this.countFields.includes(columnName)
    },
    onRemove (contact, contactListId) {
      this.setShouldUpdateSelectedListContactCount(false)
      this.setBulkDelete(false)
      this.removeContactOpen({
        ...contact,
        contactListId: contactListId
      })
      // this.$emit('on-action-remove', true)
    },
    onMessage (contactId) {
      this.setMessageComposerMode('sms')
      this.$router.push(`/contacts/${contactId}`)
    },
    onCall (contact) {
      // check contact has timezone or not
      if (contact.timezone) {
        // if have timezone check is it day time?
        const startDay = moment()
          .tz(contact.timezone)
          .hour(8)
          .minute(0)
          .second(0)
        const endDay = moment()
          .tz(contact.timezone)
          .hour(18)
          .minute(0)
          .second(0)
        const contactLocalTime = moment().tz(contact.timezone)
        if (!contactLocalTime.isBetween(startDay, endDay)) {
          return this.$confirm(
            `This is outside the lead's day time. Do you want to make a call? It's ${contactLocalTime.format(
              'hh:mm A'
            )} for ${contact.name}.`,
            'Call Lead',
            {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              customClass: 'width-500 fixed',
              type: 'warning'
            }
          ).then(() => {
            this.makeCall(contact)
          }).catch(() => {
          })
        }
      }

      this.makeCall(contact)
    },
    makeCall (contact) {
      if (this.profile.enabled_two_legged_outbound) {
        const message = { data: 'We will call your secondary phone' }
        message.data += ` on ${this.profile.secondary_phone_number}`
        message.data += ` and connect you with ${contact.name}. Proceed?`

        return this.$confirm(message.data, 'Going old school?', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          customClass: 'width-500 fixed',
          type: 'warning'
        }).then(() => {
          this.makeTwoLeggedCall(contact.id, contact.phone_number)
        }).catch(() => {
        })
      }

      const data = {
        currentNumber: contact.phone_number,
        contactName: contact.name,
        companyName: contact.company_name,
        contactId: contact.id,
        contactTimezone: contact.timezone
      }
      this.$VueEvent.fire('callContact', data)
    },
    makeTwoLeggedCall (id, phoneNumber) {
      this.$axios
        .post('/api/v1/contacts/' + id + '/make-two-legged-call', {
          phone_number: phoneNumber
        })
        .then(() => {
        })
        .catch(() => {
        })
    },
    generateRoute (contactId) {
      const routeData = {
        path: `/contacts/${contactId}`
      }

      if (this.$route.name !== 'Power Dialer') {
        routeData.query = {
          previousPage: this.$route.name
        }
      }

      return routeData
    },
    datatableOnMouseMove (e) {
      if (e.target.closest('.popover-items') !== null) {
        this.datatableTarget = e.target.closest('.popover-items').getAttribute('id')
      } else {
        this.datatableTarget = null
      }

      if (this.hoverPopover.target !== this.datatableTarget) {
        this.hoverPopover.target = null
        this.hoverPopover.show = false
        return false
      }
    },
    showPopover: _.debounce(function (title, id, index, colName, e) {
      if (this.datatableTarget !== id) {
        this.hoverPopover.target = null
        this.hoverPopover.show = false
        return
      }

      if (this.datatableTarget !== e.target.id) {
        return
      }

      this.hoverPopover.key = (this.hoverPopover.key + 1)
      this.hoverPopover.title = title
      this.hoverPopover.target = id
      this.hoverPopover.data = this.fixedContactsData.data[index][colName].slice(0, 10)
      this.hoverPopover.dataLength = this.fixedContactsData.data[index][colName].length
      this.hoverPopover.show = true
    }, 200),
    onMouseOverPopover (title, id, index, colName, e) {
      this.showPopover(title, id, index, colName, e)
    },
    onMouseLeavePopover (e) {
      this.hoverPopover.target = null
      this.hoverPopover.title = ''
      this.hoverPopover.show = false
      this.hoverPopover.data = []
      this.hoverPopover.dataLength = 0
    },
    onNavigate (contactId, e) {
      e.preventDefault()
      this.$router.push(this.generateRoute(contactId))
    },
    onNavigateToAdd (e) {
      e.preventDefault()
      this.$router.push({
        path: `/contacts/list/${this.$route.params.id}/add`
      })
    },
    setDataCount (data) {
      this.getListDataCount({ filters: data }).then(response => {
        const count = response.data.count
        this.setSelectedListContactCount(count)
        this.$VueEvent.fire('listCountUpdated', { list: this.list, count: count })
      })
    },
    getOwnerName (userId) {
      if (!userId) {
        return ''
      }

      const owner = this.users.find(user => user.id === userId)
      return owner ? owner.name : ''
    }
  },

  computed: {
    ...mapState('contacts', [
      'folders',
      'showContactsListSidebar',
      'shouldUpdateSelectedListContactCount',
      'showMyContacts',
      'pinnedCounts'
    ]),
    ...mapGetters('contacts', [
      'lists',
      'listItems',
      'selectedContacts',
      'isFiltersOpen',
      'selectedList',
      'currentListFilters',
      'unsavedList'
    ]),
    ...mapState([
      'isTabletOrMobile',
      'campaigns',
      'users'
    ]),
    ...mapState('auth', [
      'profile'
    ]),
    fixedContactsData () {
      if (!_.isEqual(this.$parent.$data.contactsData, this.contactsData)) {
        return this.$parent.$data.contactsData
      }

      return this.contactsData
    },
    id () {
      if (['Contacts List', 'Public Contacts List', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      }

      return 'all'
    },
    defaultIds () {
      return Object.keys(DEFAULT_PINNED_LIST)
        .map((k) => DEFAULT_PINNED_LIST[k].id)
        .concat(['static'])
    },
    contactList () {
      return this.lists[this.id]
    },
    isLoaded () {
      if (this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return true
      }

      return !!(this.listItems[String(this.id)] &&
        this.lists[String(this.id)])
    },
    checked () {
      return this.selectedContacts[this.id] || []
    },
    saveFilterButtonClass () {
      return {
        'disabledButton': this.selectedList.type === this.ContactListTypes.STATIC ||
          (this.selectedList.type === this.ContactListTypes.DYNAMIC &&
            !this.filterHasChanges) ||
          this.defaultIds.includes(this.id)
      }
    },
    listItemsHasData () {
      return !_.isEmpty(this.fixedContactsData)
    },
    listItemsDataCount () {
      const total = _.get(this.fixedContactsData, 'data.length', null)
      return total !== null ? total : 0
    },
    listItemsTotalContacts () {
      const data = _.get(this.fixedContactsData, `data`, null)
      return data.length || 0
    },
    filterButtonVariant () {
      return this.isFiltersOpen ? 'primary' : 'outlined-light'
    },
    filterBadgeVariant () {
      return this.isFiltersOpen ? 'light' : 'primary'
    },
    resetButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'outlined-light'
    },
    saveFilterButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'secondary'
    },
    saveFilterButtonCustomClass () {
      return !this.filterHasChanges ? 'button-disabled' : ''
    },
    isResetDisabled () {
      return !this.filterHasChanges
    },
    isListDeletable () {
      // eslint-disable-next-line no-unused-vars
      for (const [key, list] of Object.entries(this.defaultContactLists)) {
        if (list.id === this.selectedList.id) {
          return true
        }
      }

      return false
    },
    hasAppliedFilters () {
      return this.filtersCount > 0
    },
    isUnsavedList () {
      return this.id === 'unsaved' && !_.isEmpty(this.unsavedList)
    },
    showEmptySlot () {
      return this.isStartState || (!this.isStartState && this.isEmpty && this.list.type === this.ContactListTypes.STATIC)
    },
    fixedColumns () {
      const newItems = JSON.parse(JSON.stringify(this.columns))
      // now, check if columns have order, label, maxWidth or minWidth property, or
      // check if column is required then update sortable.
      const index = { data: null }
      const found = { data: null }
      for (index.data in newItems) {
        found.data = ALL_COLUMNS.find(col => col.name === newItems[index.data].name)
        if (found.data && found.required) {
          newItems[index.data].sortable = found.sortable
        }
        if (found.data) {
          newItems[index.data].label = found.data.label
          newItems[index.data].maxWidth = found.data.maxWidth
          newItems[index.data].minWidth = found.data.minWidth
        }
      }
      return newItems
    },
    computedStyle () {
      return { width: `${this.width}px`, height: `${this.height}px`, ...this.avatarStyle() }
    },
    hasMore () {
      return (this.hasNextPage &&
          !this.isLoadingMore &&
          !this.isLoading) ||
        false
    }
  },

  mounted () {
    if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
      this.loadList(this.$route.params.id)
    }

    if (this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
      this.setData(this.id)
      this.setSelectedList({ id: this.id, name: this.name, type: this.type })
    }

    this.reRouteToBase()
    this.setShouldUpdateSelectedListContactCount(true)
    // this.$VueEvent.fire('fetchContacts')
    // force close filter
    this.closeFilters()
    this.folderPath = this.generateFolderPath(this.folders)
    const _this = this

    this.myContacts = this.showMyContacts

    this.$VueEvent.listen('shouldUpdateListCount', function () {
      if (_this.list.type === _this.ContactListTypes.DYNAMIC) {
        _this.setDataCount(!_.isEmpty(_this.currentListFilters) ? _this.currentListFilters : _this.list.filters)
      } else {
        _this.setDataCount({
          filters: {
            contact_lists: {
              operator: 1,
              value: [_this.list.id]
            }
          },
          is_conjunction: true
        })
      }
    })
  },

  watch: {
    '$route.params.id': function () {
      if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
        this.loadList(this.id)
        this.setCurrentListFilters({})
      }

      if (this.id && this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
        this.setData(this.id)
      }

      if (this.$route.name === 'Contacts') {
        this.resetFilters()
        this.initialListFilters = this.currentListFilters
        this.myContacts = this.showMyContacts
        this.setShouldUpdateSelectedListContactCount(true)
      }

      if (this.$route.params.id === 'unsaved') {
        this.getListDataCount({ filters: JSON.stringify(this.list.filters) }).then(response => {
          const count = response.data.count
          this.setSelectedListContactCount(count)
        })
      }
    },
    selectedList: function (value) {
      if (this.selectedContacts[value.id]) {
        this.setListSelectedContacts({ id: value.id, contacts: [] })
      }
      this.folderPath = this.generateFolderPath(this.folders)
    },
    shouldUpdateSelectedListContactCount (val) {
      if (val) {
        this.setShouldUpdateSelectedListContactCount(true)
        // this.$VueEvent.fire('fetchContacts')
      }
    },
    id (value) {
      this.reRouteToBase()
      if (this.pinnedCounts.hasOwnProperty(value)) {
        this.setSelectedListContactCount(this.pinnedCounts[value])
      }
    },
    checked: function (value) {
      const elem = document.querySelector('.data-table-check-all')
      if (elem) {
        elem.checked = this.listItemsDataCount > 0 && value.length === this.listItemsDataCount
      }
    },
    'pinnedCounts': {
      deep: true,
      handler (value) {
        if (value.hasOwnProperty(this.id)) {
          this.setSelectedListContactCount(value[this.id])
        }
      }
    },
    'fixedContactsData': {
      deep: true,
      handler: function () {
        this.hasNextPage = !_.isEmpty(this.fixedContactsData.next_page_url)
      }
    },
    list: {
      deep: true,
      handler: function () {
        this.loadList(this.$route.params.id)
      }
    },
    showMyContacts (value) {
      if (this.myContacts !== value) {
        this.myContacts = value
      }
    }
  }
}
</script>
