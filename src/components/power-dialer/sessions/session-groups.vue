<template>
  <div class="t-menu1 border-top">
    <q-card flat>
      <div
        class="t-menu__header d-flex align-items-center"
        v-if="false">
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

            <session-contact-in-progress />

          </q-expansion-item>
          <q-separator />
        </div>

        <div v-for="(group, key) in filteredTasks"
             :key="key">
          <q-expansion-item
            class="t-expansion-panels px-0"
            :default-opened="key === 'in_queue'"
            header-class="text-black">
            <template v-slot:header>
              <q-item-section
                class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
                <div class="text-13">
                  <span v-if="listFilters[key.toUpperCase()]">
                    {{ listFilters[key.toUpperCase()].name }}
                  </span>
                  <q-chip size="xs"
                          square
                          class="p-0">
                    <span v-if="key === 'in_queue'">
                      {{ totalQueued }}
                    </span>
                    <span v-else-if="key === 'called'">
                      {{ totalCalled }}
                    </span>
                    <span v-else-if="key === 'failed'">
                      {{ totalFailed }}
                    </span>
                    <span v-else-if="key === 'scheduled'">
                      {{ totalScheduled }}
                    </span>
                    <span v-else-if="key === 'all'">
                      {{ getTotalItems('all') }}
                    </span>
                  </q-chip>
                </div>
              </q-item-section>
            </template>

            <q-card
              class="t-cards"
              :disabled="filterDisabled[key]">
              <q-list
                class="px-2 pb-2"
                v-if="group.length > 0"
                @mouseleave="onLeave">
                <template v-for="(itm, i) in group">
                  <q-item
                    class="t-expansion-panel px-2"
                    :key="`acc-item-${i}`"
                    v-if="itm"
                    :class="groupItemGetClass(key, itm)">
                    <div class="py-2">
                      <q-avatar
                        size="30px"
                        color="grey"
                        v-if="avatarName(itm.first_name, itm.last_name)">
                        {{ avatarName(itm.first_name, itm.last_name) }}
                      </q-avatar>
                      <q-avatar
                        size="30px"
                        color="grey"
                        v-else>
                        <i class="fa fa-user"
                           aria-hidden="true">
                        </i>
                      </q-avatar>
                    </div>
                    <q-item-section class="pl-2">
                      <q-item-label>
                        {{ fetchName(itm) }}
                      </q-item-label>
                      <q-item-label caption
                                    lines="2">
                        {{ itm.phone_number | fixPhone('NATIONAL', true) }}
                      </q-item-label>
                      <q-item-label caption
                                    lines="2">
                        {{ itm.company_name }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section
                      class="t-item-icon"
                      v-if="!itm.id === activeTaskId && listFilters[key.toUpperCase()].name === 'In Progress'"
                      side top>
                      <q-avatar color="red"
                                size="md">
                        <PhoneIcon color="white" />
                      </q-avatar>
                    </q-item-section>
                    <b-dropdown
                      class="m-1 b-compact-dropdown-button text-bold contacts-options-dropdown t-btn-floater t-btn-floater__top"
                      no-caret
                      right size="xs"
                      variant="white"
                      ref="dropdown"
                      :disabled="isMoving || isDeleting"
                      @mouseover="onOver"
                      @mouseleave="onLeave">

                      <template #button-content>
                        <i class="fa fa-ellipsis-h">
                        </i>
                      </template>

                      <template>
                        <b-dropdown-item
                          href="#"
                          v-if="key === 'in_queue'"
                          @click="moveTask(itm, moveDirection.top)">
                          <ArrowUpIcon height="16px"
                                       width="16px" />
                          Move to Top
                        </b-dropdown-item>
                        <b-dropdown-item
                          href="#"
                          v-if="key === 'in_queue'"
                          @click="moveTask(itm, moveDirection.bottom)">
                          <ArrowDownIcon height="15px" width="15px" />
                          Move to Bottom
                        </b-dropdown-item>
                        <b-dropdown-item
                          href="#"
                          v-if="key !== 'in_queue'"
                          @click="addTask(itm, moveDirection.top)">
                          <ArrowUpIcon height="16px" width="16px" />
                          Add to Top of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item
                          href="#"
                          v-if="key !== 'in_queue'"
                          @click="addTask(itm, moveDirection.bottom)">
                          <ArrowDownIcon height="15px" width="15px" />
                          Add to Bottom of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item
                          href="#"
                          v-if="key === 'in_queue'"
                          @click="onDeleteTask(itm)">
                          <TrashIcon />
                          Remove from List
                        </b-dropdown-item>
                      </template>

                    </b-dropdown>

                    <div
                      class="dropdown t-btn-floater t-btn-floater__bottom"
                      v-if="key === 'in_queue'"
                      ref="returnToQueue">
                      <q-btn
                        size="xs"
                        flat
                        round
                        :disabled="isMoving || isDeleting"
                        @click="moveTask(itm, moveDirection.top)">
                        <q-avatar size="15px">
                          <ContactInQueueIcon />
                        </q-avatar>
                      </q-btn>
                    </div>
                  </q-item>
                </template>
              </q-list>

              <div class="px-0 pb-1 text-grey"
                   v-else>
                <q-card flat
                        class="bg-grey-50 p-2 mx-3 my-2">
                  <span class="px-2">
                    No task listed
                  </span>
                </q-card>
              </div>

              <div v-if="hasMoreItems(group, key)">
                <q-card flat
                        class="px-1 m-0 p-0">
                  <q-card-actions
                    vertical
                    align="center"
                    class="pt-0">
                    <q-btn
                      size="sm"
                      class="px-2"
                      color="primary"
                      flat
                      @click="loadMore(key)">
                      Load More
                    </q-btn>
                  </q-card-actions>
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

import { get, isEmpty } from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionContactInProgress from './session-contact-in-progress'
import SearchList from 'src/components/search'
import PhoneIcon from 'components/icons/call-drop-icon'
import ArrowDownIcon from 'components/icons/arrow-down-icon'
import ArrowUpIcon from 'components/icons/arrow-up-icon'
import TrashIcon from 'components/icons/trash-o-icon'
import ContactInQueueIcon from 'components/icons/contact-in-queue-icon'
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
    SessionContactInProgress,
    SearchList,
    ContactInQueueIcon,
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
    ...mapState('powerDialer', [
      'powerDialerTasks',
      'activeTask',
      'hasActiveTask'
    ]),
    ...mapGetters('powerDialer', [
      // 'powerDialerListItems',
      // 'currentList',
      'sessionLoader'
    ]),
    ...mapGetters('contacts', [
      'contact',
      'selectedList',
      'listItems'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTaskFilters',
      'activeTask',
      'taskToCall',
      'myQueue'
    ]),
    moveDirection () {
      return DIRECTION
    },
    activeTaskId () {
      return this.activeTask?.id
    },
    filteredTasks () {
      /**
       * Filter and exclude the in-progress task
       * everytime items are displayed
       */

      if (!this.activeTask) {
        return {
          ...this.powerDialerTasks,
          in_queue: this.powerDialerTasks.in_queue
        }
      }

      const inQueue = this.powerDialerTasks.in_queue.filter(task => {
        return task && task.contact_list_item_id !== this.activeTask.contact_list_item_id
      })
      return {
        ...this.powerDialerTasks,
        in_queue: inQueue
      }
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    status () {
      return AutoDialTaskStatus.STATUSES
    },
    isMyQueue () {
      return this.selectedList.id === this.myQueue.id
    },
    totalAll () {
      return this.totalQueued + this.totalCalled + this.totalFailed + this.totalScheduled
    },
    totalQueued () {
      // let queued = this.powerDialerTasks.in_queue
      // let total = queued.length < this.itemsPerPage
      //   ? queued.length
      //   : queued.length >= this.getTotalItem('in_queue')
      //     ? queued.length + this.itemsPerPage
      //     : queued.length + this.getTotalItem('in_queue')
      // return total <= this.itemsPerPage ? total : total - this.itemsPerPage

      return this.getTotalItem('in_queue')
    },
    totalCalled () {
      // let { called } = this.powerDialerTasks
      // let total = called.length < this.itemsPerPage
      //   ? called.length
      //   : called.length >= this.getTotalItem('called')
      //     ? called.length + this.itemsPerPage
      //     : called.length + this.getTotalItem('called')
      // return total <= this.itemsPerPage ? total : total - this.itemsPerPage

      return this.getTotalItem('called')
    },
    totalFailed () {
      // let { failed } = this.powerDialerTasks
      // let total = failed.length < this.itemsPerPage
      //   ? failed.length
      //   : failed.length >= this.getTotalItem('failed')
      //     ? failed.length + this.itemsPerPage
      //     : failed.length + this.getTotalItem('failed')
      // return total <= this.itemsPerPage ? total : total - this.itemsPerPage

      return this.getTotalItem('failed')
    },
    totalScheduled () {
      // let { scheduled } = this.powerDialerTasks
      // let total = scheduled.length < this.itemsPerPage
      //   ? scheduled.length
      //   : scheduled.length >= this.getTotalItem('scheduled')
      //     ? scheduled.length + this.itemsPerPage
      //     : scheduled.length + this.getTotalItem('scheduled')
      // return total <= this.itemsPerPage ? total : total - this.itemsPerPage
      return this.getTotalItem('scheduled')
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getContact',
      'moveContactItems',
      'getSessionTaskByFilter'
    ]),
    groupItemGetClass (key, item) {
      return {
        active: item.id === this.activeTaskId &&
          this.listFilters[key.toUpperCase()] &&
          this.listFilters[key.toUpperCase()].name === 'In Progress'
      }
    },
    addTask (item = {}, direction = this.moveDirection.top) {
      const params = {
        contact_ids: [item?.id],
        direction: direction
      }
      if (!this.isMyQueue) {
        params.contact_list_id = this.selectedList.id
      }
      return this.$axios
        .post('api/v2/power-dialer-list-items', params)
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
      this.isMoving = true
      const res = await this.moveContactItems({
        id: this.selectedList.id,
        params: {
          // contact_ids: this.selectedContactIds,
          contact_list_item_ids: [item.contact_list_item_id],
          direction: direction
        }
      })
      if (res.status === 200) {
        const res = await this.getSessionTaskByFilter({
          id: this.selectedList.id,
          task_status: 1
        })
        this.powerDialerTasks['in_queue'] = res.data.data
        this.$generalNotification(`Task has been successfully moved to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'success')
        this.isMoving = false
      } else {
        this.$generalNotification(`Unable to move item to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'error')
        this.isMoving = false
      }
    },
    async onDeleteTask (data) {
      this.isDeleting = true
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
          this.isDeleting = false
        })
        .catch(() => {
          this.$generalNotification('Unable to delete the selected contact. Please contact system administrator.', 'error')
          this.isDeleting = false
        })
    },
    async loadMore (key) {
      this.filterDisabled[key] = true
      this.groupPageFilters[key]++
      const res = await this.getSessionTaskByFilter({
        id: this.selectedList.id,
        task_status: AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[key]].status],
        per_page: this.itemsPerPage,
        page: this.groupPageFilters[key]
      })
      if (res.status === 200) {
        this.powerDialerTasks[key] = this.powerDialerTasks[key].concat(res.data.data)
        this.powerDialerTaskFilters[key] = res.data
      }
      this.filterDisabled[key] = false
    },
    chipped (data) {
      return data.length || 0
    },
    avatarName (fname, lname) {
      let fixedFname = fname.trim()
      let fixedLname = lname.trim()
      fixedFname = isEmpty(fixedFname) ? 'N' : fixedFname?.[0]
      fixedLname = isEmpty(fixedLname) ? 'N' : fixedLname?.[0]
      return `${fixedFname}${fixedLname}`
    },
    onOver () {
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
      if (!key) {
        return ''
      }

      switch (key.toUpperCase()) {
        case AutoDialTaskStatus.STATUSES.called:
          return this.listItems[this.selectedList.id].total_called
        case AutoDialTaskStatus.STATUSES.failed:
          return this.listItems[this.selectedList.id].total_failed
        case AutoDialTaskStatus.STATUSES.in_queue:
          return this.listItems[this.selectedList.id].total_queued
        case AutoDialTaskStatus.STATUSES.scheduled:
          return this.listItems[this.selectedList.id].total_scheduled
        default:
          return this.listItems[this.selectedList.id].total
      }
    },
    hasMoreItems (group = [], key) {
      if (group.length < this.itemsPerPage) {
        return false
      }
      return group.length < this.getTotalItem(key)
    },
    getTotalItem (key) {
      switch (key) {
        case 'in_queue':
          const inQueue = get(this.powerDialerTasks, 'in_queue', null)
          return inQueue ? inQueue.filter(task => task.contact_list_item_id !== this.taskToCall.contact_list_item_id).length : 0
        case 'called':
          return this.powerDialerTaskFilters[key] ? this.powerDialerTaskFilters[key].total_called : 0
        case 'failed':
          return this.powerDialerTaskFilters[key] ? this.powerDialerTaskFilters[key].total_failed : 0
        case 'scheduled':
          return this.powerDialerTaskFilters[key] ? this.powerDialerTaskFilters[key].total_scheduled : 0
        default:
          return this.powerDialerTaskFilters[key] ? this.powerDialerTaskFilters[key].total_items : 0
      }
    },
    fetchName (item) {
      if ((item.first_name === null || item.first_name === '') && (item.last_name === null || item.last_name === '')) {
        return `No Name`
      }

      return `${item?.first_name || ''} ${item?.last_name || ''}`
    },
    getTotalItems (group) {
      return get(this.powerDialerTaskFilters[group], 'total_items', 0)
    }
  },
  data () {
    return {
      flagged: false,
      groupPageFilters: {
        in_queue: 1,
        called: 1,
        failed: 1,
        scheduled: 1,
        all: 1
      },
      filterDisabled: {
        in_queue: false,
        called: false,
        failed: false,
        scheduled: false,
        all: false
      },
      itemsPerPage: 20,
      isMoving: false,
      isDeleting: false
    }
  }
}
</script>
