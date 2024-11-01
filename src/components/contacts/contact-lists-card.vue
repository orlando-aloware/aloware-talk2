<template>
  <b-card class="border-0 contact-lists-card"
          data-testid="contact-lists-card">
    <div id="contact-lists-card-header" class="d-flex justify-content-between align-items-center">
      <h4>{{ title }}</h4>
      <b-link href="#"
              class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
              @click="onSearch">
        <slot name="button">
          <q-tooltip anchor="top middle"
                     self="center middle">
            Search current lists
          </q-tooltip>
          <search-icon class="search-icon" :color="iconColor" />
        </slot>
      </b-link>
    </div>
    <div id="contact-lists-card-body" class="my-3">
      <div class="d-flex align-items-start list-item"
           :key="list.id"
           v-for="list in paginatedLists">
        <list-icon class="mr-3 self-center"
                   :key="'list_icon_' + list.id" />
        <div class="list-name pr-1">
          <q-tooltip anchor="top middle"
                     self="center middle">
            {{ list.name }}
          </q-tooltip>
          {{ list.name }}
        </div>
        <b-link href="#"
                class="self-center trash-icon custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                @click="removeContactFromList(list.id)">
          <slot name="button">
            <span class='aloicons trash-icon' :style="'color:' + iconColor + '!important'">B</span>
          </slot>
        </b-link>
      </div>
      <div v-if="lists.length === 0">
        <div class="d-flex justify-content-center align-items-center mt-1" style="height: 100%;">
          No available lists.
        </div>
      </div>
    </div>
    <div id="contact-list-card-footer" class="d-flex justify-content-between">
      <div class="generic-multi-select">
        <div class="list-wrapper">
          <div class="w-100 mt-1">
            <b-link href="#"
                    class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                    @click="onUpdate">
              <slot name="button">
                <pencil-o-icon />
                <span class="ml-1">
              Modify Lists
            </span>
              </slot>
            </b-link>
          </div>
        </div>
      </div>
      <div class="contact-list-card-paginator">
        <b-pagination
          v-model="page"
          :total-rows="lists.length"
          :per-page="perPage"
          aria-controls="contact-lists-card-body"
        ></b-pagination>
      </div>
    </div>

  </b-card>
</template>

<script>

import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import ListIcon from 'components/icons/list-icon.vue'
import SearchIcon from 'components/icons/search-icon.vue'

import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'contact-lists-card',

  mixins: [aclMixin],
  components: {
    PencilOIcon,
    ListIcon,
    SearchIcon
  },

  props: {
    contact: {
      required: true
    }
  },

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    title () {
      return this.$vnode.key === 'contact-public-lists-card' ? 'Public Lists' : 'Private Lists'
    },

    lists () {
      const isPublicFolder = this.$vnode.key === 'contact-public-lists-card'

      const lists = this.contact.contact_lists.filter(list => list.show_in_public_folder === isPublicFolder)
      if (!this.isBillingAdminOrAdminOrSupervisor && this.isAgent) {
        // filter only lists that the agent has access to
        return lists.filter(list => list.contact_folder_created_by === this.profile.id)
      }

      return lists
    },

    paginatedLists () {
      const start = (this.page - 1) * this.perPage
      const end = start + this.perPage
      return this.lists.slice(start, end)
    }
  },

  data () {
    return {
      isLoading: false,
      isSaving: false,
      prevValue: '',
      iconColor: '#256eff',
      page: 1,
      perPage: 5
    }
  },

  mounted () {

  },

  methods: {
    onInput (value) {

    },

    onBlur () {

    },

    onUpdate () {

    },

    onSearch () {

    },

    removeContactFromList (listId) {

    }
  },
  watch: {
    'contact.id': function () {

    }
  }
}
</script>
<style scoped>
.list-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-icon {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s;
}

.list-item:hover .trash-icon {
  opacity: 1;
}
</style>
