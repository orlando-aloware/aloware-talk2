<template>
  <div class="t-menu1 border-top">
    <q-card class="h-100"
            flat>
      <div class="h-100 t-scroll-y">
        <div>
          <q-expansion-item class="t-expansion-panels px-0"
                            header-class="text-black"
                            default-opened>
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

        <div :key="key"
             v-for="(group, key) in filteredTasks">
          <q-expansion-item class="t-expansion-panels px-0"
                            header-class="text-black"
                            :default-opened="key === 'in_queue'">
            <template v-slot:header>
              <q-item-section class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
                <div class="text-13">
                  <span v-if="listFilters[key.toUpperCase()]">
                    {{ listFilters[key.toUpperCase()].name }}
                  </span>
                  <q-chip class="p-0"
                          size="xs"
                          square>
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
                    <span v-else>
                      {{ group.length }}
                    </span>
                  </q-chip>
                </div>
              </q-item-section>
            </template>

            <q-card class="t-cards"
                    :disabled="filterDisabled[key]">
              <q-list class="px-2 pb-2"
                      v-if="group.length > 0"
                      @mouseleave="onLeave">
                <template v-for="(taskItem, i) in group">
                  <q-item class="t-expansion-panel px-2"
                          :class="groupItemGetClass(key, taskItem)"
                          :key="`acc-item-${i}`"
                          v-if="taskItem">
                    <div class="py-2">
                      <q-avatar size="30px"
                                color="grey"
                                v-if="getInitials(taskItem.name)">
                        {{ getInitials(taskItem.name) }}
                      </q-avatar>
                      <q-avatar size="30px"
                                color="grey"
                                v-else>
                        <i class="fa fa-user"
                           aria-hidden="true">
                        </i>
                      </q-avatar>
                    </div>
                    <q-item-section class="pl-2">
                      <q-item-label>
                        {{ fetchName(taskItem) }}
                      </q-item-label>
                      <q-item-label lines="2"
                                    caption>
                        {{ taskItem.phone_number | fixPhone('NATIONAL', true) }}
                      </q-item-label>
                      <q-item-label lines="2"
                                    caption>
                        {{ taskItem.company_name }}
                      </q-item-label>
                      <q-item-label lines="2"
                                    caption>
                        <span>
                          <i class="fa fa-globe"></i>
                          {{ taskItem.timezone }}
                        </span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section class="t-item-icon"
                                    side
                                    top
                                    v-if="!taskItem.id === activeTaskId && listFilters[key.toUpperCase()].name === 'In Progress'">
                      <q-avatar color="red"
                                size="md">
                        <PhoneIcon color="white"/>
                      </q-avatar>
                    </q-item-section>
                    <b-dropdown ref="dropdown"
                                class="m-1 b-compact-dropdown-button text-bold contacts-options-dropdown t-btn-floater t-btn-floater__top"
                                right size="xs"
                                variant="white"
                                no-caret
                                :disabled="isMoving || isDeleting"
                                @mouseover="onOver"
                                @mouseleave="onLeave">

                      <template #button-content>
                        <i class="fa fa-ellipsis-h">
                        </i>
                      </template>

                      <template>
                        <b-dropdown-item href="#"
                                         v-if="key === 'in_queue'"
                                         @click="moveTask(taskItem, moveDirection.top)">
                          <ArrowUpIcon height="16px"
                                       width="16px" />
                          Move to Top
                        </b-dropdown-item>
                        <b-dropdown-item href="#"
                                         v-if="key === 'in_queue'"
                                         @click="moveTask(taskItem, moveDirection.bottom)">
                          <ArrowDownIcon height="15px"
                                         width="15px" />
                          Move to Bottom
                        </b-dropdown-item>
                        <b-dropdown-item href="#"
                                         v-if="key !== 'in_queue'"
                                         @click="addTask(taskItem, moveDirection.top)">
                          <ArrowUpIcon height="16px"
                                       width="16px"/>
                          Add to Top of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item href="#"
                                         v-if="key !== 'in_queue'"
                                         @click="addTask(taskItem, moveDirection.bottom)">
                          <ArrowDownIcon height="15px"
                                         width="15px" />
                          Add to Bottom of In Queue
                        </b-dropdown-item>
                        <b-dropdown-item href="#"
                                         v-if="key === 'in_queue'"
                                         @click="onDeleteTask(taskItem)">
                          <TrashIcon />
                          Remove from List
                        </b-dropdown-item>
                      </template>

                    </b-dropdown>

                    <div ref="returnToQueue"
                         class="dropdown t-btn-floater t-btn-floater__bottom"
                         v-if="key === 'in_queue'">
                      <q-btn size="xs"
                             flat
                             round
                             :disabled="isMoving || isDeleting"
                             @click="moveTask(taskItem, moveDirection.top)">
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
                <q-card class="bg-grey-50 p-2 mx-3 my-2"
                        flat>
                  <span class="px-2">
                    No task listed
                  </span>
                </q-card>
              </div>

              <div v-if="hasMoreItems(group, key)">
                <q-card class="px-1 m-0 p-0"
                        flat>
                  <q-card-actions align="center"
                                  class="pt-0"
                                  vertical>
                    <q-btn class="px-2"
                           size="sm"
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

import { get } from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionContactInProgress from './session-contact-in-progress'
import PhoneIcon from 'components/icons/call-drop-icon'
import ArrowDownIcon from 'components/icons/arrow-down-icon'
import ArrowUpIcon from 'components/icons/arrow-up-icon'
import TrashIcon from 'components/icons/trash-o-icon'
import ContactInQueueIcon from 'components/icons/contact-in-queue-icon'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as TaskType from 'src/constants/task-types'
import { avatarMixin, powerDialerMixin, sessionCallStatusMixin } from 'src/plugins/mixins'

const DIRECTION = {
  top: 1,
  bottom: 2
}

export default {
  name: 'SessionGroups',

  mixins: [
    avatarMixin,
    sessionCallStatusMixin,
    powerDialerMixin
  ],

  components: {
    SessionContactInProgress,
    ContactInQueueIcon,
    PhoneIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    TrashIcon
  },

  data: () => {
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
      itemsPerPage: 50,
      isMoving: false,
      isDeleting: false
    }
  },

  computed: {
    ...mapState(['dialer']),

    ...mapState('powerDialer', [
      'powerDialerTasks',
      'activeTask',
      'hasActiveTask'
    ]),

    ...mapGetters('powerDialer', [
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

      const pdTasks = this.$jsonClone(this.powerDialerTasks)

      // remove redialed if it exists
      if ('redialed' in pdTasks) {
        delete pdTasks.redialed
      }

      if (!this.activeTask) {
        return {
          ...pdTasks,
          in_queue: this.$jsonClone(this.powerDialerTasks.in_queue)
        }
      }

      const inQueue = this.powerDialerTasks.in_queue.filter(task => {
        return task && task.contact_list_item_id !== this.activeTask.contact_list_item_id
      })

      return {
        ...pdTasks,
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
      return this.getTotalItem('in_queue')
    },

    totalCalled () {
      return this.getTotalItem('called')
    },

    totalFailed () {
      return this.getTotalItem('failed')
    },

    totalScheduled () {
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
        const totalInQueue = this.powerDialerTasks.in_queue.length

        // find in this.powerDialerTasks['in_queue'] the element with the same id as the item
        const index = this.powerDialerTasks.in_queue.findIndex(element => element.id === item.id)
        // remove it from the array
        this.powerDialerTasks.in_queue.splice(index, 1)

        // add it to the top of the array
        if (direction === this.moveDirection.top) {
          this.powerDialerTasks.in_queue.unshift(item)
        }

        if (direction === this.moveDirection.bottom) {
          // add it to the bottom of the array
          if (totalInQueue === this.powerDialerTaskFilters.in_queue.total_queued) {
            this.powerDialerTasks.in_queue.push(item)
          }

          // if the total of items in current queue (UI) is less than the actual total of items queued
          // then we need to fetch again the first 50 items from the API
          if (totalInQueue < this.powerDialerTaskFilters.in_queue.total_queued) {
            this.inQueueFetchTasks.currentPage = 1
            const res = await this.getSessionTaskByFilter(this.prepareFilters({
              id: this.selectedList.id,
              task_status: 1,
              per_page: 50,
              page: this.inQueueFetchTasks.currentPage
            }))

            this.powerDialerTasks['in_queue'] = res.data.data
          }
        }

        this.$generalNotification(`Task has been successfully moved to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'success')
        this.isMoving = false

        return
      }

      this.$generalNotification(`Unable to move item to ${direction === this.moveDirection.top ? 'top' : 'bottom'}.`, 'error')
      this.isMoving = false
    },

    async onDeleteTask (data) {
      this.isDeleting = true

      return this.$axios
        .delete(
          `/api/v2/power-dialer-lists/${this.selectedList.id}/items/${data.contact_list_item_id}`
        )
        .then(async (res) => {
          this.inQueueFetchTasks.currentPage = 1
          let response = await this.getSessionTaskByFilter(this.prepareFilters({
            id: this.selectedList.id,
            task_status: 1,
            per_page: 50,
            page: this.inQueueFetchTasks.currentPage
          }))

          this.powerDialerTasks['in_queue'] = response.data.data
          this.$generalNotification(res.data.message)
          this.isDeleting = false
        })
        .catch(() => {
          this.$generalNotification('Unable to delete the selected contact. Please contact system administrator.', 'error')
          this.isDeleting = false
        })
    },

    async loadMore (taskType) {
      this.filterDisabled[taskType] = true

      // If there is a next page, increment the page number
      if (this.powerDialerTaskFilters[taskType].next_page_url) {
        this.groupPageFilters[taskType]++
      }

      // Set the page properly
      const inQueueTaskType = taskType === TaskType.IN_QUEUE
      let page = inQueueTaskType && this.inQueueFetchTasks ? this.inQueueFetchTasks.currentPage + 1 : this.groupPageFilters[taskType]

      // Fetch the next page of tasks
      const res = await this.getSessionTaskByFilter({
        id: this.selectedList.id,
        task_status: AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[taskType]].status],
        per_page: this.itemsPerPage,
        page: page
      })

      if (res.status === 200) {
        this.powerDialerTaskFilters[taskType] = this.$jsonClone(res.data)
        delete this.powerDialerTaskFilters[taskType].data

        if (inQueueTaskType) {
          // Total of skipped tasks in the current PD session plus the active task
          const currSkippedAndInProgress = [...this.powerDialerTasks.skipped, this.activeTask]

          // The new set of IN QUEUE tasks that are retrieved by the API
          const currInQueue = [...res.data.data]
          // if the current page is the same as the last page, then we keep the total of fetched tasks the same
          if (this.powerDialerTaskFilters[taskType].current_page === this.inQueueFetchTasks.currentPage) {
            this.inQueueFetchTasks.fetchedTasks = currInQueue.length
          }

          // if the current page is greater than the last page, then we increment the total of fetched tasks
          if (this.powerDialerTaskFilters[taskType].current_page > this.inQueueFetchTasks.currentPage) {
            this.inQueueFetchTasks.fetchedTasks += currInQueue.length
          }

          this.inQueueFetchTasks.currentPage = this.powerDialerTaskFilters[taskType].current_page

          // We compare the new set of IN QUEUE tasks retrieved by the API according to pagination
          // but discarding the ones have been skipped so we don't list them again
          let newInQueue = currInQueue.filter(element => !currSkippedAndInProgress.some(item => item.id === element.id))
          if (newInQueue.length) {
            this.powerDialerTasks[taskType] = [...this.powerDialerTasks[taskType], ...newInQueue]
          }
        } else {
          // Add the list of retrieved tasks to the current list, this is for all but IN QUEUE tasks
          let tempSet = new Set([...this.powerDialerTasks[taskType], ...res.data.data].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
          this.powerDialerTasks[taskType] = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
        }
      }
      this.filterDisabled[taskType] = false
    },

    chipped (data) {
      return data.length || 0
    },

    onOver () {
      this.$refs.dropdown.visible = true
      this.$refs.returnToQueue.visible = true
    },

    onLeave () {
      this.$refs.dropdown.visible = false
      this.$refs.returnToQueue.visible = false
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
          return this.listItems[this.selectedList.id].total_found || this.listItems[this.selectedList.id].total_queued
        case AutoDialTaskStatus.STATUSES.scheduled:
          return this.listItems[this.selectedList.id].total_scheduled
        default:
          return this.listItems[this.selectedList.id].total
      }
    },

    hasMoreItems (group = [], taskType) {
      if (taskType !== TaskType.IN_QUEUE && group.length < this.itemsPerPage) {
        return false
      }

      // If the task type is IN QUEUE, we check if the total of items in queue plus the total of skipped tasks
      // is greater than or equal to the total of items in queue that are allowed to be queued
      if (taskType === TaskType.IN_QUEUE) {
        const totalInQueue = group.length + 1 // items in current queue + the one in progress
        const totalSkipped = this.powerDialerTasks.skipped.length
        if (this.powerDialerTaskFilters?.in_queue?.total_queued && (totalInQueue + totalSkipped) >= this.powerDialerTaskFilters.in_queue.total_queued) {
          return false
        }
      }

      return group.length < this.getTotalItem(taskType)
    },

    getTotalItem (key) {
      // Sanity check: if the key is not in the powerDialerTaskFilters, return 0
      // here we are getting the total of items for each group
      // to be displayed during the PD session: In Queue, Called, Failed, Scheduled.
      if (!this.powerDialerTaskFilters[key]) {
        return 0
      }

      switch (key) {
        case 'in_queue':
          return this.powerDialerTaskFilters[key] ? this.powerDialerTaskFilters[key].total_queued - 1 : 0 // Get the actual number of tasks in queue -1 (for the one in progress)
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
  }
}
</script>
