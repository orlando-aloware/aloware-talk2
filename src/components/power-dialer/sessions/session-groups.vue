<template>
  <div class="t-menu1">
    <q-card flat :disabled="sessionLoader">
      <div class="t-menu__header d-flex align-items-center">
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
              v-if="list"
              :in-progress-contact="activeList" />

          </q-expansion-item>
          <q-separator />
        </div>

        <div v-for="(group, key) in listFilters"
          :key="`session-expanded-${key}`">

          <q-expansion-item
            :default-opened="key === 'IN_QUEUE' ? true : false"
            class="t-expansion-panels px-0"
            header-class="text-black">

            <template v-slot:header>
              <q-item-section class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
                <div class="text-13">
                  {{ group.name }}
                  <q-chip size="xs" square class="p-0">
                    {{ totalCount(key) }}
                  </q-chip>
                </div>
              </q-item-section>
            </template>

            <q-card class="t-cards">
              <q-list class="px-2 pb-2">
                <template
                  v-for="(item, i) in filteredList(group.status)">
                  <q-item
                    :key="`acc-item-${i}`"
                    :class="{ active: item.id === activeList.id && group.name === 'In Progress' }"
                    class="t-expansion-panel px-2">

                    <div class="py-2">
                      <q-avatar size="30px" color="grey">
                        {{ avatarName(item.first_name) }}
                      </q-avatar>
                    </div>

                    <q-item-section class="pl-2">
                      <q-item-label>{{ item.first_name }} {{ item.last_name }}</q-item-label>
                      <q-item-label caption lines="2">{{ item.phone_number | fixPhone('NATIONAL', true) }}</q-item-label>
                      <q-item-label caption lines="2">{{ item.company_name }}</q-item-label>
                    </q-item-section>

                    <q-item-section
                      v-if=" item.id === activeList.id && group.name === 'In Progress'"
                      class="t-item-icon"
                      side top>
                      <q-avatar color="red" size="md">
                        <PhoneIcon color="white" />
                      </q-avatar>
                    </q-item-section>
                    <b-dropdown
                      @mouseover="onOver"
                      @mouseleave="onLeave"
                      v-else
                      text="..."
                      no-caret
                      right size="xs"
                      variant="white"
                      ref="dropdown"
                      class="m-1 b-compact-dropdown-button text-bold contacts-options-dropdown t-btn-floater t-btn-floater__top">
                      <template #button-content>
                        <i class="fa fa-ellipsis-h"></i>
                      </template>
                      <b-dropdown-item href="#">
                        Option 1
                      </b-dropdown-item>
                      <b-dropdown-item href="#">
                        Option 2
                      </b-dropdown-item>
                      <b-dropdown-item href="#">
                        Option 3
                      </b-dropdown-item>
                    </b-dropdown>
                    <div class="dropdown t-btn-floater t-btn-floater__bottom">
                      <q-btn size="xs" flat round>
                        <q-avatar size="15px">
                          <img src="icons/refresh-call.png">
                        </q-avatar>
                      </q-btn>
                    </div>

                  </q-item>
                  <!-- <q-separator :key="`acc-item-line-${i}`" spaced inset /> -->
                </template>
              </q-list>
            </q-card>
            <!-- <q-separator /> -->

          </q-expansion-item>

          <q-separator />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import InProgressContact from './session-contact-in-progress'
import SearchList from 'src/components/search'
import PhoneIcon from 'components/icons/call-drop-icon'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'

export default {
  name: 'SessionGroups',
  components: {
    InProgressContact,
    SearchList,
    PhoneIcon
  },
  async mounted () {
    // this.NEXT_CONTACT_IN_PROGRESS(this.activeList)
    await this.getContact({ id: this.activeList.id })
  },
  computed: {
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
    list () {
      return this.listItems[this.selectedList.id].data || []
    },
    activeList () {
      return this.list[0]
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getContact'
    ]),
    chipped (data) {
      return data.length || 0
    },
    avatarName (name) {
      return name[0]
    },
    onOver () {
      this.$refs.dropdown.visible = true
    },
    onLeave () {
      this.$refs.dropdown.visible = false
    },
    filteredList (key = '') {
      if (!key) {
        return this.list
      }
      return this.list.filter(lst => {
        return lst.task_status === AutoDialTaskStatus[key]
      })
    },
    totalCount (key = '') {
      if (!key) return ''
      let detail = this.listItems[this.selectedList.id]
      switch (key) {
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
    }
  },
  watch: {
    async list () {
      this.flagged = false
      await this.getContact({ id: this.activeList.id })
      this.flagged = true
    },
    contact (obj) {
      if (obj.id) {
        this.flagged = true
      } else {
        this.flagged = false
      }
    }
  },
  data () {
    return {
      flagged: false
    }
  }
}
</script>
