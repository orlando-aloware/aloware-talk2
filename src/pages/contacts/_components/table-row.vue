<template>
  <tr class="datatable-row">
    <template v-for="column in columns">
      <td
        :key="column.id"
        class="text-center align-middle datatable-row__checkbox"
        v-if="column.checkbox"
      >
        <input
          type="checkbox"
          class="checker"
          :value="contact.id"
          :checked="checked.includes(contact.id)"
          @click="onCheckerClicked"
        />
      </td>

      <td
        :key="column.id"
        class="datatable-row__name"
        v-if="column.name === 'name'"
      >
        <div class="d-flex align-items-center">
          <div class="pr-2">
            <avatar :name="contact.name" />
          </div>
          <div class="flex-grow-1">
            <router-link
              :to="`/contacts/show/${contact.id}`"
              v-slot="{ href, route, navigate }"
            >
              <a
                :href="href"
                @click="navigate"
                class="d-flex align-items-center item"
              >
                <template v-if="contact.name">
                  {{ contact.name | ucwords }}
                </template>
                <template v-if="!contact.name"> No Name </template>
              </a>
            </router-link>
          </div>
        </div>
      </td>

      <td
        :key="column.id"
        v-if="column.name === 'phone_number'"
        class="datatable-row__phone"
      >
        <span>
          {{ contact.phone_number | fixPhone }}
        </span>
      </td>

      <td :key="column.id" v-if="column.name === 'last_engagement_text'">
        <div>{{ contact.last_engagement_text }}</div>
        <div class="small text-muted">
          {{ moment(contact.last_engagement_at).format('LLL') }}
        </div>
      </td>

      <td class="tags-cell" :key="column.id" v-if="column.name === 'tags'">
        <template v-if="!contact.tags.length">
          <span class="text-muted">no tags available</span>
        </template>
        <template v-if="Array.isArray(contact.tags) && contact.tags.length">
          <b-popover
            :target="'popover-tags-' + contact.id"
            triggers="hover"
            placement="left"
            boundary="window"
          >
            <template #title>
              <div class="contact-tags-title">Tags</div>
            </template>
            <span
              :id="'popover-tags-' + contact.id"
              class="d-flex align-items-center contact-tags-item"
              v-for="tag in contact.tags"
              :key="tag.id"
            >
              <span class="text-primary mr-1">●</span>
              {{ tag.name }}
            </span>
          </b-popover>

          <span
            :id="'popover-tags-' + contact.id"
            class="d-flex align-items-center contact-tags-item"
          >
            <span class="text-primary mr-1">●</span>
            {{ contact.tags[0].name }}
          </span>
        </template>
      </td>

      <td
        class="text-center"
        :key="column.id"
        v-if="column.name === 'unread_count'"
      >
        <span class="badge badge-danger">
          {{ contact.unread_count }}
        </span>
      </td>

      <td
        class="text-center datatable-row__actions"
        :key="column.id"
        v-if="column.name === 'actions'"
      >
        <div>
          <button
            class="btn btn-sm btn-link datatable-row__actions__action--call"
          >
            <i class="fa fa-phone"></i>
          </button>
          <button
            class="btn btn-sm btn-link datatable-row__actions__action--chat"
          >
            <i class="fa fa-comment"></i>
          </button>
          <button
            @click="onRemove"
            class="btn btn-sm btn-link datatable-row__actions__action--trash"
          >
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </template>
  </tr>
</template>

<script>
import moment from 'moment'

import Avatar from 'src/components/avatar/avatar.vue'

import { mapActions } from 'vuex'

export default {
  components: {
    Avatar
  },
  props: {
    contact: {
      type: Object,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    checked: {
      type: Array
    },
    contactListId: {
      type: Number
    }
  },
  methods: {
    ...mapActions('contacts', ['removeContactOpen']),
    onCheckerClicked () {
      const checked = new Set([...this.checked])

      if (this.checked.includes(this.contact.id)) {
        checked.delete(this.contact.id)
      } else {
        checked.add(this.contact.id)
      }

      this.$emit('checked', [...checked])
    },
    onRemove () {
      this.removeContactOpen({
        ...this.contact,
        contactListId: this.contactListId
      })
    }
  },
  data () {
    return {
      moment
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.datatable-row {
  font-size: 12px;
  &__checkbox {
    max-width: 40px;
    input {
      margin-top: 5px;
    }
  }
  &__phone {
    min-width: 50px;
  }
  &__name {
    min-width: 150px;
  }
  &__actions {
    min-width: 40px;
    max-width: 40px;
    &__action {
      &--call:hover {
        color: $green;
      }
      &--chat:hover {
        color: $blue;
      }
      &--trash:hover {
        color: $red;
      }
    }
    button {
      color: $grey-mid;
    }
  }
}

.contact-tags-title {
  font-size: 12px;
}

.contact-tags-item {
  font-size: 12px;
}
</style>
