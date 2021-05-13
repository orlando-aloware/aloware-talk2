<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex flex-grow-1 flex-column">
      <router-link
        v-for="item in defaultList"
        :to="item.link"
        :key="item.id"
        v-slot="{ href, route, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          @click="navigate"
          class="d-flex align-items-center item"
          :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
        >
          <div class="px-2 icon">
            <folder-dynamic-icon></folder-dynamic-icon>
          </div>
          <div class="pr-3 flex-grow-1">{{ item.name }}</div>
        </a>
      </router-link>

      <router-link
        v-for="item in pinned"
        :to="`/contacts/list/${item.id}`"
        :key="item.id"
        v-slot="{ href, route, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          @click="navigate"
          class="d-flex align-items-center item"
          :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
        >
          <div class="px-2 icon">
            <folder-static-icon
              v-if="item.type === 'static'"
            ></folder-static-icon>
            <folder-dynamic-icon
              v-if="item.type === 'dynamic'"
            ></folder-dynamic-icon>
          </div>
          <div class="pr-3 flex-grow-1">{{ item.name }}</div>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'

export default {
  methods: {},
  components: {
    folderStaticIcon,
    folderDynamicIcon
  },
  computed: {
    ...mapState('contacts', ['pinned'])
  },
  data () {
    return {
      defaultList: [
        {
          id: 1,
          name: 'All Contacts',
          link: '/contacts'
        },
        {
          id: 2,
          name: 'My Contacts',
          link: '/contacts/mycontacts'
        },
        {
          id: 3,
          name: 'Unassigned Contacts',
          link: '/contacts/unassigned'
        },
        {
          id: 4,
          name: 'Unanswered Contacts',
          link: '/contacts/unanswered'
        },
        {
          id: 5,
          name: 'New Leads',
          link: '/contacts/newleads'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.pinned {
  display: flex;
  flex-direction: column;
  overflow: auto;
  &__header {
    min-height: 40px;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}
.icon {
  margin-top: -5px;
}
.item {
  color: $dark;
  cursor: pointer;
  line-height: 25px;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  transition: background-color 100ms ease-in-out;
  white-space: nowrap;
}
.item:hover {
  background: $light-green2;
  color: $dark;
  text-decoration: none;
}
.item.router-link-exact-active {
  background: $light-green2;
}
</style>
