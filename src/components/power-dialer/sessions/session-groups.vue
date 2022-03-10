<template>
  <div class="t-menu1 border-top">
    <q-card flat :disabled="sessionLoader">
      <div
        v-if="false"
        class="t-menu__header d-flex align-items-center">
        <div class="header__header__title font-weight-bold p-3 flex-grow-1">

          <SearchList
            placeholder="Search"
            class="text-capitalize" />

        </div>
      </div>
      <div class="t-scroll-y">

        <div>
          <q-expansion-item
            default-opened
            class="t-expansion-panels px-0"
            header-class="text-black">
            <template v-slot:header>
              <q-item-section class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
                <div class="text-13">
                  In Progress
                </div>
              </q-item-section>
            </template>

            <InProgressContact
              :in-progress-contact="activeTask" />
            <!-- <InProgressContact
              :in-progress-contact="{}" /> -->

          </q-expansion-item>
          <q-separator />
        </div>

        <div v-for="(group, key) in filteredTasks" :key="key">
          <q-expansion-item
            :default-opened="key === 'in_queue'"
            class="t-expansion-panels px-0"
            header-class="text-black">
            <template v-slot:header>
              <q-item-section
                class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
                <div class="text-13">
                  {{ listFilters[key.toUpperCase()].name }}
                  <!-- - {{ key.toUpperCase() }} -->
                  <q-chip size="xs" square class="p-0">
                    {{ group.length || 0 }}
                    <!-- {{ totalCount(key) }} -->
                  </q-chip>
                </div>
              </q-item-section>
            </template>
            <q-card class="t-cards">
              <q-list
                v-if="group.length > 0"
                class="px-2 pb-2"
                @mouseleave="onLeave">
                <template v-for="(item, i) in group">
                  <q-item
                    :key="`acc-item-${i}`"
                    :class="{ active: item.id === activeTask.id && listFilters[key.toUpperCase()].name === 'In Progress' }"
                    class="t-expansion-panel px-2">
                    <div class="py-2">
                      <q-avatar size="30px" color="grey">
                        {{ avatarName(item.first_name, item.last_name) }}
                      </q-avatar>
                    </div>
                    <q-item-section class="pl-2">
                      <q-item-label>{{ item.first_name }} {{ item.last_name }}</q-item-label>
                      <q-item-label caption lines="2">{{ item.phone_number | fixPhone('NATIONAL', true) }}</q-item-label>
                      <q-item-label caption lines="2">{{ item.company_name }}</q-item-label>
                    </q-item-section>
                    <q-item-section
                      v-if="!item.id === activeTask.id && listFilters[key.toUpperCase()].name === 'In Progress'"
                      class="t-item-icon"
                      side top>
                      <q-avatar color="red" size="md">
                        <PhoneIcon color="white" />
                      </q-avatar>
                    </q-item-section>
                    <b-dropdown
                      @mouseover="onOver"
                      @mouseleave="onLeave"
                      no-caret
                      right size="xs"
                      variant="white"
                      ref="dropdown"
                      class="m-1 b-compact-dropdown-button text-bold contacts-options-dropdown t-btn-floater t-btn-floater__top">
                      <template #button-content>
                        <i class="fa fa-ellipsis-h"></i>
                      </template>
                      <template>
                        <b-dropdown-item
                          v-if="key === 'in_queue'"
                          @click="moveTask(item, moveDirection.top)"
                          href="#">
                          <ArrowUpIcon height="16px" width="16px" />
                          Move to Top
                        </b-dropdown-item>
                        <b-dropdown-item
                          v-if="key === 'in_queue'"
                          @click="moveTask(item, moveDirection.bottom)"
                          href="#">
                          <ArrowDownIcon height="15px" width="15px" />
                          Move to Bottom
                        </b-dropdown-item>
                        <b-dropdown-item
                          v-if="key !== 'in_queue'"
                          @click="addTask(item, moveDirection.top)"
                          href="#">
                          <ArrowUpIcon height="16px" width="16px" />
                          Add to Top of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item
                          v-if="key !== 'in_queue'"
                          @click="addTask(item, moveDirection.bottom)"
                          href="#">
                          <ArrowDownIcon height="15px" width="15px" />
                          Add to Bottom of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item
                          v-if="key === 'in_queue'"
                          @click="onDeleteTask(item)"
                          href="#">
                          <TrashIcon />
                          Remove from List
                        </b-dropdown-item>
                      </template>
                    </b-dropdown>
                    <div
                      class="dropdown t-btn-floater t-btn-floater__bottom"
                      ref="returnToQueue">
                      <q-btn
                        @click="moveToInQueue(item)"
                        size="xs" flat round>
                        <q-avatar size="15px">
                          <!-- <img src="icons/refresh-call.png"> -->
                          <ContactInQueue />
                        </q-avatar>
                      </q-btn>
                    </div>
                  </q-item>
                </template>
              </q-list>
              <div v-else class="px-0 pb-1 text-grey">
                <q-card flat class="bg-grey-50 p-2 mx-3 my-2">
                  <span class="px-2">No task listed</span>
                </q-card>
              </div>
            </q-card>
          </q-expansion-item>
          <q-separator />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import InProgressContact from './session-contact-in-progress'
import SearchList from 'src/components/search'
import PhoneIcon from 'components/icons/call-drop-icon'
import ArrowDownIcon from 'components/icons/arrow-down-icon'
import ArrowUpIcon from 'components/icons/arrow-up-icon'
import TrashIcon from 'components/icons/trash-o-icon'
import ContactInQueue from 'components/icons/contact-in-queue'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

const DIRECTION = {
  top: 1,
  bottom: 2
}

export default {
  name: 'SessionGroups',
  components: {
    InProgressContact,
    SearchList,
    ContactInQueue,
    PhoneIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    TrashIcon
  },
  mounted () {
    // this.NEXT_CONTACT_IN_PROGRESS(this.activeTask)
    // console.log('this.activeTask :>> ', this.activeTask)
    // let { powerDialerTasks } = this
    // this.powerDialerTasks.in_queue.shift()
  },
  computed: {
    ...mapState(['dialer']),
    ...mapGetters('powerDialer', [
      'powerDialerListItems',
      // 'currentList',
      'sessionLoader'
    ]),
    ...mapGetters('contacts', [
      'contact',
      'selectedList',
      'listItems'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks',
      'activeTask'
    ]),
    moveDirection () {
      return DIRECTION
    },
    filteredTasks () {
      let { powerDialerTasks, activeTask } = this
      let inQueue = this.powerDialerTasks.in_queue.filter(task => {
        return task.id !== activeTask.id
      })
      return {
        ...powerDialerTasks,
        in_queue: inQueue
      }
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    status () {
      return AutoDialTaskStatus.STATUSES
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getContact',
      'moveContactItems',
      'getSessionTaskByFilter'
    ]),
    addTask (item = {}, direction = this.moveDirection.top) {
      return this.$axios
        .post('api/v2/power-dialer-list-items', {
          contact_ids: [item.id],
          direction: direction
        })
        .then(async () => {
          this.$generalNotification('Task has been successfully moved to In Queue.', 'success')
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    async moveTask (item = {}, direction = this.moveDirection.top) {
      const res = await this.moveContactItems({
        id: this.selectedList.id,
        params: {
          // contact_ids: this.selectedContactIds,
          contact_list_item_ids: [item.contact_list_item_id],
          direction: direction
        }
      })
      if (res.status === 200) {
        let res = await this.getSessionTaskByFilter({
          id: this.selectedList.id,
          task_status: 1
        })
        this.powerDialerTasks['in_queue'] = res.data.data
        this.$generalNotification(`Task has been successfully moved to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'success')
      } else {
        this.$generalNotification(`Unable to move item to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'error')
      }
    },
    async onDeleteTask (data) {
      return this.$axios
        .delete(
          `/api/v2/power-dialer-lists/${this.selectedList.id}/items/${data.contact_list_item_id}`
        )
        .then(async (res) => {
          let response = await this.getSessionTaskByFilter({
            id: this.selectedList.id,
            task_status: 1
          })
          this.powerDialerTasks['in_queue'] = response.data.data
          this.$generalNotification(res.data.message)
        })
        .catch(() => {
          this.$generalNotification('Unable to delete the selected contact. Please contact system administrator.', 'error')
        })
    },
    chipped (data) {
      return data.length || 0
    },
    avatarName (fname, lname) {
      return `${fname?.[0]}${lname?.[0]}`
    },
    onOver () {
      console.log('this.$refs.dropdown.visible :>> ', this.$refs.dropdown.visible)
      this.$refs.dropdown.visible = true
      this.$refs.returnToQueue.visible = true
    },
    onLeave () {
      this.$refs.dropdown.visible = false
      this.$refs.returnToQueue.visible = false
    },
    moveToInQueue (contact) {
      console.log('This contact should move to IN-QUEUE : ', contact)
      // https://app.alodev.org/api/v2/power-dialer-list-items
      // contact_ids:
    },
    totalCount (key = '') {
      if (!key) return ''
      let detail = this.listItems[this.selectedList.id]
      switch (key.toUpperCase()) {
        case AutoDialTaskStatus.STATUSES.called:
          return detail.total_called
        case AutoDialTaskStatus.STATUSES.failed:
          return detail.total_failed
        case AutoDialTaskStatus.STATUSES.in_queue:
          return detail.total_queued
        case AutoDialTaskStatus.STATUSES.scheduled:
          return detail.total_scheduled
        default:
          return detail.total
      }
    },
    taskGroupMenu (group) {
      switch (group) {
        case 'called':
          return [
            'Add to Top of In Queue',
            'Add to Bottom of In Queue',
            'Remove from List'
          ]
        default:
          return [
            'Remove from List'
          ]
      }
    }
    // makeACall () {
    //   let data = {
    //     currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.activeTask?.id}`), // we know this already based on the list (Required)
    //     outboundCampaignId: '535', // this.session.campaignId, // ID of the line that you are calling from (Required)
    //     contactName: `${this.activeTask.first_name} ${this.activeTask.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
    //     companyName: this.activeTask.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
    //     contactId: this.activeTask.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
    //   }
    //   console.log('data :>> ', data)
    //   // this.$VueEvent.fire('makeCall', data)
    // }
  },
  data () {
    return {
      flagged: false
    }
  }
}
</script>
