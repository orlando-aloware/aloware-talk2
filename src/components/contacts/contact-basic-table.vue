<template lang="">
    <datatable ref="contactsTable"
              :stickyHeaders="true"
              :columns="columns"
              :isEmpty="isEmpty || isStartState"
              :isLoadingMore="isLoadingMore"
              :is-loading="isLoading"
              :contact-list-id="id"
              :paginated="false"
              :show-pagination="!isStartState"
              :total-rows="fixedContactsData.total"
              :current-page="fixedContactsData.current_page"
              :last-page="fixedContactsData.last_page"
              :useEmptySlot="canSeeAddContacts && canAddContacts && isEmpty"
              v-if="listItemsHasData"
              @onMouseMove="datatableOnMouseMove"
              @onMouseLeave="datatableOnMouseMove"
              @reordered="onColumnsReordered"
              @checked="onCheckAllItems"
              @sort="onSortByField"
              @paginated="onPaginate"
              @more="onLoadMore">
    <template slot="tbody">
      <tr v-for="(contact, index) in fixedContactsData.data"
          :key="`${index}`"
          class="datatable-row">
        <template
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
                :checked="checked.find(item => item.id === contact.id) || isAllContactsSelected"
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
                <router-link :to="generateRoute(contact.id)" class="d-flex align-items-center item contact-name">
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
              {{ contact.created_at | fixFullDateTime }}
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
              <button v-if="!list.show_in_public_folder && hasPermissionTo('archive contact')"
                      class="btn btn-sm datatable-row__actions__action--trash"
                      @click="onRemove(contact, id)">
                <span class="aloicons action-icons">B</span>
              </button>
            </div>
          </td>

          <td
            v-else-if="column.name === 'task_status_name' || column.name === 'task_status'"
            :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
            :key="`c-${colIndx}`">
            <q-chip
              :outline="true"
              :color="getStatusColor(getStatusName(contact.task_status, 'contacts'), 'contacts')"
              text-color="red"
              size="12px"
              class="p-0 m-0">
              {{ getStatusName(contact.task_status, 'contacts') }}
            </q-chip>
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
</template>
<script>
export default {
  props: {
    
  }
}
</script>
