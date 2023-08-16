<template>
  <contacts-screen :loading="isLoadingDisabled"
                   v-if="list">
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
            <span :class="`list-name ${isUnsavedList ? 'text-grey-30' : ''}`">
              {{ list.name || (isUnsavedList ? unsavedList.name : '') }}
              <q-chip class="m-0 p-0"
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
    <template slot="options"
              v-if="!isStartState">
      <compact-btn variant="primary"
                   :class="`${isUnsavedList ? 'hidden' : ''}`"
                   :disabled="isDisabledAddFiltersButton"
                   v-if="list.type === ContactListTypes.DYNAMIC && isEditable"
                   @clicked="onFiltersClicked">
        <i class="fa fa-plus mr-2" /> Add Filters
      </compact-btn>
    </template>

    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <div class="d-flex justify-content-between align-items-center">
          <search class="width-260"
                  limitSearchCharacters
                  :search="search"
                  :disabled="isLoadingDisabled"
                  @search="onSearch">
          </search>
          <div class="contacts-total mobile">
            <div class="small text-muted fs-13 text-right"
                 v-if="selectedList.type === ContactListTypes.DYNAMIC">
              <template v-if="!isDatatableCountLoading">
                {{ selectedList.contactCount | numFormat }} {{ selectedList.contactCount == 1 ? 'Contact' : 'Contacts' }}
              </template>
              <q-skeleton type="text"
                          style="width: 80px;"
                          v-else/>
            </div>
            <div class="small text-muted fs-13 text-right"
                 v-else>
              <template v-if="!isDatatableCountLoading">
                {{ listItemsTotalContacts }} of {{ selectedList.contactCount }} {{ selectedList.contactCount == 1 ? 'Contact' : 'Contacts' }}
              </template>
              <q-skeleton type="text"
                          style="width: 80px;"
                          v-else/>
            </div>
          </div>
        </div>
        <div class="px-3 d-flex">
          <div class="d-inline-flex"
               v-if="!isMyContactsView && !isTabletOrMobile && $route.params.id !== 'unassigned'">
            <label class="text-primary mr-2 mt-2 cursor-pointer"
                   style="min-width: 84px;"
                   :class="{ disabled: isLoading }">
              My Contacts
            </label>
            <b-form-checkbox id="my-contacts"
                             class="mt-2 cursor-pointer"
                             name="check-button"
                             size="sm"
                             switch
                             :class="{ disabled: isLoading }"
                             :disabled="isLoading"
                             v-model="myContacts"
                             @change="onFetchMyContacts">
            </b-form-checkbox>
          </div>
          <div>
            <compact-btn borderless
                         variant="outlined-light"
                         customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                         v-if="isSimpsocial"
                         @clicked="onMessengerClick">
              <iframe id="ss-messenger-button"
                      frameborder="0"
                      style=""
                      :src="simpsocialMessengerIframeLink">
              </iframe>
            </compact-btn>
          </div>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center pr-2">
        <div class="flex-grow-1"></div>
        <div class="px-3 d-inline-flex"
             v-if="!isMyContactsView && isTabletOrMobile && $route.params.id !== 'unassigned'">
          <label class="text-primary mr-2 mt-2 cursor-pointer"
                 :class="{ disabled: isLoading }">My Contacts</label>
          <b-form-checkbox id="my-contacts"
                           class="mt-2 cursor-pointer"
                           name="check-button"
                           size="sm"
                           switch
                           :class="{ disabled: isLoading }"
                           :disabled="isLoading"
                           v-model="myContacts"
                           @change="onFetchMyContacts">
          </b-form-checkbox>
        </div>
        <div class="contacts-total desktop">
          <div class="small text-muted fs-13 text-right"
               v-if="selectedList.type === ContactListTypes.DYNAMIC">
            <template v-if="!isDatatableCountLoading">
              {{ selectedList.contactCount | numFormat }} {{ selectedList.contactCount == 1 ? 'Contact' : 'Contacts' }}
            </template>
            <q-skeleton type="text"
                        style="width: 80px;"
                        v-else/>
          </div>
          <div class="small text-muted fs-13 text-right"
               v-else>
            <template v-if="!isDatatableCountLoading">
              {{ listItemsTotalContacts }} of {{ selectedList.contactCount | numFormat }} {{ selectedList.contactCount == 1 ? 'Contact' : 'Contacts' }}
            </template>
            <q-skeleton type="text"
                        style="width: 80px;"
                        v-else/>
          </div>
        </div>
        <hr role="separator" aria-orientation="vertical" class="contacts-header-separator q-separator height-28margin-auto position-relative q-separator q-separator--vertical">
        <div class="d-flex align-items-center pr-2 pl-2"
             :class="['btn-filter-wrapper mr-2', isFiltersOpen ? 'background' : '' ]">
          <compact-btn customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       variant="outlined-light"
                       tooltip-text="Clear"
                       borderless
                       :disabled="defaultIds.includes(id)"
                       v-if="hasAppliedFilters && !isCurrentAndPreviousFiltersMismatch && listContactsLoaded"
                       @clicked="clearFilters">
            <close-icon width="14px"
                        height="14px"
                        icon-color="#62666E">
            </close-icon>
          </compact-btn>
          <compact-btn customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       variant="outlined-light"
                       tooltip-text="Reset"
                       borderless
                       v-if="isCurrentAndPreviousFiltersMismatch && listContactsLoaded"
                       @clicked="resetFilters(false, false)">
            <refresh-icon width="14px"
                          height="14px"
                          icon-color="grey-90">
            </refresh-icon>
          </compact-btn>
          <compact-btn variant="outlined-light"
                       customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                       borderless
                       :disabled="isDisabledFiltersButton"
                       @clicked="onFiltersClicked">
            <span class="pl-2 pr-2 d-flex filter-toggle-button align-items-center">Filters</span>
            <b-badge class="d-flex align-items-center contact-filter-count"
                     variant="primary"
                     pill
                     v-if="hasAppliedFilters">
              {{ filtersCount }}
            </b-badge>
          </compact-btn>
        </div>

        <compact-btn variant="primary"
                     :disabled="isDisabledSaveFilter"
                     :customClass="saveFilterButtonCustomClass"
                     v-if="selectedList.type !== ContactListTypes.STATIC && !['all', 'my-contacts', 'unassigned', 'unanswered', 'new-leads'].includes(selectedList.id)"
                     @clicked="onUpdateContactList">
          <q-spinner-bars color="white"
                          class="mr-1"
                          v-if="isUpdatingList" />
          {{ isUpdatingList ? ' Saving...' : 'Save' }}
        </compact-btn>
        <b-dropdown text="Add Contacts"
                    variant="light"
                    class="m-2 b-compact-dropdown-button text-bold text-black dropdown-white filter-toggle-button"
                    toggle-class="filter-toggle-button py-0 my-0 d-flex align-items-center"
                    right
                    no-caret
                    v-if="canSeeAddContacts">
          <template class="filter-toggle-button"
                    #button-content>
            <div class="filter-toggle-button d-flex align-items-center">
              Add Contacts
            </div>
            <i class="fa fa-chevron-down fs-12 filter-toggle-button d-flex align-items-center ml-2 text-grey-90"
               style="margin-top: 2px;" />
          </template>
          <b-dropdown-item href="#"
                           :disabled="!canAddContacts"
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

        <b-dropdown class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                    text="..."
                    variant="light"
                    no-caret
                    right>
          <template #button-content>
            <ellipse-icon />
          </template>
          <b-dropdown-item href=""
                           @click="onEditColumnsClicked">
            <edit-hamburger-icon />
            Edit Columns
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           :disabled="true">
            <power-dialer-mobile-icon width="14"
                                      height="14"
                                      color="#62666E" />
            Power Dialer
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           v-if="isAdmin"
                           @click="exportAsCsv">
            <export-icon />
            Export as CSV
          </b-dropdown-item>
          <b-dropdown-item href=""
                           :disabled="isListDeletable"
                           v-b-tooltip.hover="{ placement: 'top', title: (isListDeletable ? 'Unable to modify Filters. Duplicate this list if you want to modify' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }"
                           @click="onRemoveList">
            <delete-red-icon />
            <span class="text-danger">
              {{ unsavedList ? 'Discard' : 'Delete' }}
            </span>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </template>
    <template slot="actions">
      <bulk-action-menu :id="id"
                        :total-rows="totalRows"
                        :checked-count="selectedAllCount"
                        @onSelectedAll="onSelectedAll" />
    </template>

    <template slot="table">
      <datatable ref="contactsTable"
                 :stickyHeaders="true"
                 :columns="columns"
                 :isEmpty="isEmpty || isStartState"
                 :isLoadingMore="isLoadingMore"
                 :is-loading="isLoading"
                 :contact-list-id="id"
                 :paginated="false"
                 :show-pagination="!isStartState"
                 :current-page="fixedContactsData.current_page"
                 :last-page="fixedContactsData.last_page"
                 :useEmptySlot="canSeeAddContacts && canAddContacts && isEmpty"
                 :total-rows="totalRows"
                 v-if="listItemsHasData"
                 @onMouseMove="datatableOnMouseMove"
                 @onMouseLeave="datatableOnMouseMove"
                 @reordered="onColumnsReordered"
                 @checked="onCheckAllItems"
                 @sort="onSortByField"
                 @paginated="onPaginate"
                 @more="onLoadMore">
        <template slot="tbody">
          <tr class="datatable-row"
              :key="`${index}`"
              v-for="(contact, index) in fixedContactsData.data">
            <template v-for="(column, colIndx) in fixedColumns">
              <td class="text-left pull-left datatable-row__checkbox"
                  :key="`c-${colIndx}`"
                  v-if="column.name === 'checkbox'">
                <label class="custom-checkbox-container">
                  <input type="checkbox"
                         class="checker"
                         :value="contact.id"
                         :checked="checked.find(item => item.id === contact.id) || isAllContactsSelected"
                         @change="onCheckerClicked(contact)" />
                  <span class="checkmark" />
                </label>
              </td>
              <td class="datatable-row__name"
                  :key="`c-${colIndx}`"
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
              <td class="datatable-row__name"
                  :key="`c-${colIndx}`"
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

              <td class="datatable-row__phone"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'phone_number'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                     v-if="contact.phone_number">
                  {{ contact.phone_number | fixPhone('NATIONAL', true, false, true) }}
                </div>
                <div class="ml-1 text-grey-7 text-center "
                     :class="`${column.draggable ? 'col-indented' : ''}`"
                     v-else>
                  -
                </div>
              </td>

              <td :key="`c-${colIndx}`"
                  v-else-if="column.name === 'last_engagement_text'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  <div>{{ contact.last_engagement_text }}</div>
                  <div class="small text-muted">
                    {{ moment(contact.last_engagement_at).format('LLL') }}
                  </div>
                </div>
              </td>

              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'tags'"
                  @mouseleave="onMouseLeavePopover($event)">

                <template v-if="!contact.tags || (contact.tags && !contact.tags.length)">
                  -
                </template>

                <template v-if="Array.isArray(contact.tags) && contact.tags.length">
                  <div class="d-flex align-items-center contact-tags-item popover-items"
                       :id="`pt-${index}-${colIndx}`"
                       v-if="contact.id"
                       @mouseenter="onMouseOverPopover('Tags', `pt-${index}-${colIndx}`, index, column.name, $event)">
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

              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'unread_texts_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_texts_count > 0">
                  {{ contact.unread_texts_count }}
                </span>
              </td>

              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'unread_missed_calls_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_missed_calls_count > 0">
                  {{ contact.unread_missed_calls_count }}
                </span>
              </td>

              <td :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'unread_voicemails_count'">
                <span class="badge badge-danger unread-text bg-red-80"
                      v-if="contact.unread_voicemails_count > 0">
                  {{ contact.unread_voicemails_count }}
                </span>
              </td>

              <td class="text-left"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'text_authorized_at'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ contact.text_authorized_at ? 'Yes' : 'No' }}
                </div>
              </td>

              <td class="text-left"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'initial_campaign_id'">
                <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                  {{ getLineName(contact.initial_campaign_id) }}
                </div>
              </td>

              <td class="text-left"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'created_at'">
                <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
                  {{ contact.created_at | fixFullDateTime }}
                </div>
              </td>

              <td class="text-left datatable-row__actions"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'actions'">
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
                  <button class="btn btn-sm datatable-row__actions__action--trash"
                          v-if="!list.show_in_public_folder && hasPermissionTo('archive contact')"
                          @click="onRemove(contact, id)">
                    <span class="aloicons action-icons">B</span>
                  </button>
                </div>
              </td>

              <td :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
                  :key="`c-${colIndx}`"
                  v-else-if="column.name === 'task_status_name' || column.name === 'task_status'">
                <q-chip text-color="red"
                        size="12px"
                        class="p-0 m-0"
                        :outline="true"
                        :color="getStatusColor(getStatusName(contact.task_status, 'contacts'), 'contacts')">
                  {{ getStatusName(contact.task_status, 'contacts') }}
                </q-chip>
              </td>

              <td :key="`c-${colIndx}`"
                  v-else
                  @mouseleave="onMouseLeavePopover($event)">

                <div class="text-left"
                     v-if="isColumnArrayValueEmpty(contact[column.name])">
                  <div :class="`${column.draggable ? 'col-indented' : ''}`">
                    -
                  </div>
                </div>

                <div class="text-left"
                     v-else-if="isColumnArrayValueNotEmpty(contact[column.name])">
                  <div class="d-flex align-items-center popover-items"
                       :id="`ot-${index}-${colIndx}`"
                       v-if="contact[column.name].length > 0"
                       @mouseenter="onMouseOverPopover(column.label, `ot-${index}-${colIndx}`, index, column.name, $event)">
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
                     v-else-if="isColumnObjectValueNotEmpty(contact[column.name])">
                  <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`"
                       v-if="contact[column.name].id && typeof contact[column.name].name !== 'undefined'">
                    {{ contact[column.name].name }}
                  </div>
                </div>
                <span class="text-left"
                      v-else-if="isColumnObjectValueEmpty(contact[column.name])">
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
                     :class="getColumnClass(column.name, column.draggable)"
                     v-else>
                  {{ getColumnValue(contact[column.name]) }}
                </div>
              </td>
            </template>
          </tr>
        </template>

        <template slot="empty">
          <div class="start-state"
               @click="onNavigateToAdd($event)">
            <div class="p-4 bg-light w-100 text-center border-bottom text-primary">
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
      <contacts-filters @filtersUpdated="updateFilterHasChanges"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import _ from 'lodash'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapGetters, mapState } from 'vuex'
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
import {
  avatarMixin,
  timezoneCheckMixin,
  aclMixin,
  viewMixin,
  contactsListFiltersMixin,
  simpsocialMixin
} from 'src/plugins/mixins'
import RefreshIcon from 'components/icons/contacts/refresh-icon'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export default {
  name: 'contacts-view',

  mixins: [
    avatarMixin,
    timezoneCheckMixin,
    aclMixin,
    viewMixin,
    contactsListFiltersMixin,
    simpsocialMixin
  ],

  components: {
    RefreshIcon,
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
    onFetch: Function,

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

  data () {
    return {
      filterHasChanges: false,
      defaultContactLists: DEFAULT_PINNED_LIST,
      isUpdatingList: false,
      folderPath: [],
      createContactModalId: 'contacts-list-create-contact-modal',
      myContacts: false,
      hasNextPage: false,
      viewListeners: {},
      ContactListTypes
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState('contacts', [
      'folders',
      'showContactsListSidebar',
      'shouldUpdateSelectedListContactCount',
      'showMyContacts',
      'pinnedCounts',
      'previousListFilters',
      'previouslySavedListId',
      'previousListId',
      'listContactsLoaded'
    ]),

    ...mapGetters('contacts', [
      'lists',
      'listItems',
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

    saveFilterButtonClass () {
      return {
        'disabledButton': this.selectedList.type === this.ContactListTypes.STATIC ||
          (this.selectedList.type === this.ContactListTypes.DYNAMIC &&
            !this.isFilterHasChanges) ||
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

    filterButtonVariant () {
      return this.isFiltersOpen ? 'primary' : 'outlined-light'
    },

    filterBadgeVariant () {
      return this.isFiltersOpen ? 'light' : 'primary'
    },

    resetButtonVariant () {
      return this.isFilterHasChanges ? 'primary' : 'outlined-light'
    },

    saveFilterButtonVariant () {
      return this.isFilterHasChanges ? 'primary' : 'secondary'
    },

    saveFilterButtonCustomClass () {
      return this.isDisabledSaveFilter ? 'button-disabled' : ''
    },

    isResetDisabled () {
      return !this.isFilterHasChanges
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

    canSeeAddContacts () {
      return ((this.list.type === ContactListTypes.STATIC && this.isEditable) || this.id === 'all') && !this.list.show_in_public_folder
    },

    canAddContacts () {
      return this.list.type === ContactListTypes.STATIC && this.isEditable
    },

    fixedColumns () {
      const newItems = this.$jsonClone(this.columns)

      // now, check if columns have order, label, maxWidth or minWidth property, or
      // check if column is required then update sortable.
      for (let index in newItems) {
        let column = ALL_COLUMNS.find(col => col.name === newItems[index].name)

        if (column && column.required) {
          newItems[index].sortable = column.sortable
        }

        if (column) {
          newItems[index].label = column.label
          newItems[index].maxWidth = column.maxWidth
          newItems[index].minWidth = column.minWidth
        }
      }

      return newItems
    },

    isCurrentAndPreviousFiltersMismatch () {
      if (_.isEmpty(this.previousListFilters)) {
        return false
      }

      const previousListFilters = this.$jsonClone(this.previousListFilters)

      if (this.cleanedCurrentListFilters?.search && !previousListFilters?.search) {
        previousListFilters.search = this.cleanedCurrentListFilters.search
      }

      return JSON.stringify(this.cleanedCurrentListFilters) !== JSON.stringify(previousListFilters)
    },

    isFilterHasChanges () {
      return this.filterHasChanges || this.isCurrentAndPreviousFiltersMismatch
    },

    isDisabledAddFiltersButton () {
      return this.isFiltersOpen || !this.listContactsLoaded
    },

    isDisabledFiltersButton () {
      return this.isStartState || !this.listContactsLoaded
    },

    isDisabledSaveFilter () {
      return !this.isFilterHasChanges ||
        this.defaultIds.includes(this.id) ||
        this.isUpdatingList ||
        !this.listContactsLoaded ||
        this.list.show_in_public_folder
    },

    simpsocialMessengerIframeLink () {
      return `https://dealer.simpsocial.com/${this.currentCompany.id}/messenger/unread/count`
    },

    cleanedCurrentListFilters () {
      const currentFilters = _.isEmpty(this.currentListFilters)
        ? {}
        : this.$jsonClone(this.currentListFilters)

      return currentFilters
    }
  },

  mounted () {
    // clear the selected contacts
    this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: [] })

    // an  actual list is loaded (contact/list URL)
    if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
      this.loadList(this.$route.params.id)
    }

    // index page or default list is loaded
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

    this.myContacts = this.showMyContacts

    this.$VueEvent.listen('shouldUpdateListCount', () => {
      if (this.list.type === this.ContactListTypes.DYNAMIC) {
        this.setDataCount(
          !_.isEmpty(this.currentListFilters)
            ? this.currentListFilters
            : this.list.filters
        )

        return
      }

      this.setDataCount({
        filters: {
          contact_lists: [
            {
              operator: OPERATORS.IS_ANY_OF,
              value: [this.list.id]
            }
          ]
        },
        is_conjunction: true
      })
    })

    this.viewListeners.setDataCount = _.debounce((data) => {
      const event = data.event
      const filters = data.filters
      const clear = data?.clear ?? false
      this.setDataCount(filters, event, false, clear)
    }, 100)

    this.viewListeners.updateHasFilterChanges = () => {
      this.filterHasChanges = false
    }

    this.$VueEvent.listen('shouldUpdateListCountOnSearch', this.viewListeners.setDataCount)
    this.$VueEvent.listen('updateHasFilterChanges', this.viewListeners.updateHasFilterChanges)
  },

  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'setSelectedList',
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'columnsReordered',
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
      'setMessageComposerMode',
      'updateContactsList',
      'updateContactsListFilter',
      'setListContactsLoaded',
      'setPreviouslySavedListId'
    ]),

    onSearch (searchText) {
      this.$emit('search', searchText.trim())
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
        contact_lists: [
          {
            operator: OPERATORS.IS_ANY_OF,
            value: [stringId]
          }
        ]
      }

      this.setCurrentListFilters(filters)
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
      let checkedItems = []

      if (!checked) {
        this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: checkedItems })
        return
      }

      document
        .querySelectorAll('.checker')
        .forEach((checkbox) => {
          if (checked) {
            checkedItems.push(this.fixedContactsData.data.find(item => item.id === Number(checkbox.value)))
          } else {
            checkedItems = checkedItems.filter(item => item.id !== Number(checkbox.value))
          }
        })

      this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: checkedItems })
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
        return
      }

      this.openFilters()
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
      // not applicable for static lists and default lists
      if (this.selectedList.type === this.ContactListTypes.STATIC || this.defaultIds.includes(this.id)) {
        return
      }

      // don't allow filters to be saved empty for dynamic list
      const hasGroupFilters = Object.keys(this.currentListFilters).filter(key => this.currentListFilters[key]?.filters)

      if (_.isEmpty(hasGroupFilters) && this.selectedList.type === this.ContactListTypes.DYNAMIC) {
        this.$generalNotification('Filters not saved. Dynamic list must have filters.', 'error')
        return
      }

      this.isUpdatingList = true

      if (_.isEmpty(this.unsavedList)) {
        console.log('Updating existing dynamic list...')

        const params = {
          filters: _.pickBy(this.currentListFilters)
        }

        return this.$axios
          .put('/api/v2/contacts-list/' + this.selectedList.id, params)
          .then((res) => {
            this.setPreviouslySavedListId(this.selectedList.id)
            this.updateContactsList(res.data.data)
            this.initialListFilters = this.currentListFilters
            this.updateFilterHasChanges()
            this.isUpdatingList = false
            this.$generalNotification('Changes to contact list has been saved.')

            if (this.listItems[this.selectedList.id] && this.listItems[this.selectedList.id].total) {
              this.pinnedCountLoaded({
                id: this.selectedList.id,
                count: this.listItems[this.selectedList.id].total
              })

              return
            }

            if (this.list.type === this.ContactListTypes.DYNAMIC) {
              this.setDataCount({
                filter_groups: this.currentListFilters
              }, null, true)
              return
            }

            this.setDataCount({
              filter_groups: [
                {
                  filters: {
                    contact_lists: [
                      {
                        operator: OPERATORS.IS_ANY_OF,
                        value: [this.list.id]
                      }
                    ]
                  },
                  is_conjunction: true
                }
              ]
            }, null, true)
          })
          .catch((_err) => {
            console.log(_err)
            this.$generalNotification('Unable to update contact list.', 'error')
          })
      }

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

    discardList () {
      this.$bvModal.msgBoxConfirm('Are you sure you want to discard your contact list?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'No',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.setUnsavedList(null)
          this.$router.push(`/contacts`)
        }
      })
    },

    onRemoveList () {
      if (this.unsavedList) {
        this.discardList()
        return
      }

      this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name })
    },

    hasFilterChanges () {
      const initialFilters = _.isEmpty(this.initialListFilters)
        ? {}
        : this.initialListFilters

      return JSON.stringify(initialFilters) !== JSON.stringify(this.cleanedCurrentListFilters)
    },

    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
    },

    clearFilters () {
      this.setCurrentListFilters({})
      this.setListContactsLoaded(false)
      this.updateContactsListFilter({
        id: this.selectedList.id,
        filters: {}
      })
      this.$VueEvent.fire('filters-reset')
      this.setShowMyContacts(false)
      this.$VueEvent.fire('filteredFetchContacts', { clear: true })
    },

    resetFilters (resetSearch = false, skipPreviouslySavedListId = true) {
      // don't reset currently selected list's filter to
      // its previous filter if list's id is equal to
      // previously saved list id.
      if (skipPreviouslySavedListId &&
        this.selectedList.id === this.previouslySavedListId) {
        return
      }

      this.setListContactsLoaded(false)

      if (this.selectedList.id === this.previousListId) {
        this.setCurrentListFilters(this.previousListFilters)
        this.updateContactsListFilter({
          id: this.selectedList.id,
          filters: this.previousListFilters
        })
      } else {
        const list = this.getfixedDefaultList()
        this.setCurrentListFilters(list.filters)
        this.updateContactsListFilter(list)
      }

      if (resetSearch) {
        this.resetSearch()
      }

      this.$VueEvent.fire('filters-reset')

      this.$VueEvent.fire('filteredFetchContacts', { clear: true })
      this.filterHasChanges = false
    },

    getfixedDefaultList () {
      if (_.isEmpty(this.list)) {
        return []
      }

      let id = this.list.id
      let defaultFilters = !_.isEmpty(this.list.filters) ? this.$jsonClone(this.list.filters) : {}

      if (this.$route.params.id === 'my-contacts') {
        const filter = _.get(defaultFilters, '[0].filters.contact_owner', null)
        const profileId = _.get(this.profile, 'id', null)

        if (filter && profileId) {
          defaultFilters[0].filters.contact_owner[0].value = [profileId]
        }
      }

      if (typeof defaultFilters === 'string') {
        defaultFilters = JSON.parse(defaultFilters)
      }

      return {
        id: id,
        filters: defaultFilters
      }
    },

    onContactCreated (contact) {
      if (this.list.type === this.ContactListTypes.STATIC && !this.list.show_in_public_folder) {
        talk2Api.V2.contactListItem.addContact(this.id, [contact]).then(res => {
          this.$VueEvent.fire('shouldUpdateListCount')
          this.$VueEvent.fire('fetchContacts')
        })

        return
      }

      this.$VueEvent.fire('shouldUpdateListCount')
      this.$VueEvent.fire('fetchContacts', {
        params: {
          page: this.fixedContactsData.current_page
        }
      })
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
      this.checkContactTimezone(contact, () => { this.makeCall(contact) })
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

    setDataCount (data, event = null, updatePinned = false, clear = false) {
      const fireData = {
        data: {
          filters: this.$jsonClone(data)
        },
        id: this.id,
        event: event,
        clear: clear,
        thenFunctions: {
          setSelectedListContactCount: 'response.data.count'
        }
      }

      if (updatePinned) {
        fireData.thenEventFires = {
          listCountUpdated: {
            list: this.list,
            count: 'response.data.count'
          }
        }
      }

      this.$VueEvent.fire('get-list-count', fireData)
    },

    getOwnerName (userId) {
      if (!userId) {
        return ''
      }

      const owner = this.users.find(user => user.id === userId)
      return owner ? owner.name : ''
    },

    onMessengerClick () {
      this.$router.push({
        name: 'Messenger'
      })
    }
  },

  watch: {
    '$route.params.id': function () {
      if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
        // this.loadList(this.id)
        this.setCurrentListFilters({})
      }

      if (this.id && this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
        this.setData(this.id)
      }

      this.initiateUpdateContactsListFilter()

      if (this.$route.params.id === 'unsaved') {
        this.$VueEvent.fire('get-list-count', {
          data: { filters: JSON.stringify(this.list.filters) },
          clear: true,
          thenFunctions: {
            'setSelectedListContactCount': {
              count: 'response.data.count'
            }
          }
        })
      }

      this.setAllContactsSelected(false)
    },

    selectedList: function (value) {
      if (this.selectedContacts[value.id]) {
        this.$VueEvent.fire('setListSelectedContacts', { id: value.id, contacts: [] })
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
      this.updateFilterHasChanges()
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

    'fixedContactsData.next_page_url': function (value) {
      this.hasNextPage = !_.isEmpty(value)
    },

    showMyContacts (value) {
      if (this.myContacts !== value) {
        this.myContacts = value
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('shouldUpdateListCount')
    this.$VueEvent.stop('shouldUpdateListCountOnSearch', this.viewListeners.setDataCount)
    this.$VueEvent.stop('updateHasFilterChanges', this.viewListeners.updateHasFilterChanges)
  }
}
</script>
