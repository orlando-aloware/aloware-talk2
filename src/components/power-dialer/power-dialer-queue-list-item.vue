<template>
  <div class="item item__no-cursor d-flex py-2">
    <div class="pl-3 pr-2 py-2 icon">
      <ListIcon />
    </div>
    <div
      @click="goto()"
      class="py-1 flex-grow-1 item-name cursor-pointer">
      {{ item.name }}
    </div>
    <div class="pr-2">
      <div
        class="d-inline align-items-center">
        <!-- <b-popover
          target="bs-folder-options"
          triggers="click blur"
          placement="bottomright"
          boundary="window"
          custom-class="contact-popover">
          <contact-menu>
            <contact-menu-item @click="{}">
              <template slot="icon">
                <folder-icon></folder-icon>
              </template>
              <template slot="title">
                <span>Folder</span>
              </template>
            </contact-menu-item>

            <contact-menu-item @click="{}">
              <template slot="icon">
                <AddUserIcon />
              </template>
              <template slot="title">
                <span>List</span>
              </template>
            </contact-menu-item>
          </contact-menu>
        </b-popover> -->
        <AddUserIcon class="cursor-pointer" />
      </div>
      <b-badge class="t-badge t-badge__warning ml-2 text-white p-1">
        {{ item.count }}
      </b-badge>
    </div>
  </div>
</template>

<script>

import ListIcon from 'components/icons/list-icon'
import AddUserIcon from 'components/icons/add-user-icon'

export default {
  name: 'PowerDialerQueueListItem',
  props: {
    item: {
      type: Object
    }
  },
  components: {
    ListIcon,
    AddUserIcon
  },
  methods: {
    goto () {
      this.$router.push('my-queue')
    }
  }
}
</script>
