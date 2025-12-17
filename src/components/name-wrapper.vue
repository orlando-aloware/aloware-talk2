<template>
  <div class="d-flex align-items-center">
    <div class="pr-2">
      <avatar :name="name"/>
    </div>
    <div class="flex-grow-1">
      <router-link :to="`${linkPath}${resource.id}`"
                   v-slot="{ href, route, navigate }">
        <a class="d-flex align-items-center item contact-name text-bold text-decoration-none"
           :href="href"
           @click="navigate">
          <template v-if="name">
            <div class="ellipse">{{ name | ucwords }}</div>
            <b-badge variant="danger"
                     class="badge-phone-info ml-2"
                     data-testid="contacts-view-contact-dnc-badge"
                     v-if="dncBadge && resource.is_dnc">
              DNC
            </b-badge>
            <b-badge variant="danger"
                     class="badge-phone-info ml-2"
                     data-testid="contacts-view-contact-opted-out-badge"
                     v-else-if="optOutBadge && isContactOptedOut">
              Opt-Out
            </b-badge>
          </template>
          <template v-else>No Name</template>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>

import Avatar from 'components/avatar'

export default {
  name: 'name-wrapper',

  props: {
    resource: {
      type: Object,
      required: false,
      default: () => ({})
    },
    linkPath: {
      type: String,
      required: false,
      default: '/'
    },
    dncBadge: {
      type: Boolean,
      default: false
    },
    optOutBadge: {
      type: Boolean,
      default: false
    }
  },

  components: {
    Avatar
  },

  computed: {
    name () {
      if (this.resource.first_name && this.resource.last_name) {
        return `${this.resource.first_name} ${this.resource.last_name}`.trim()
      }

      if (!this.resource.first_name && this.resource.last_name) {
        return `${this.resource.last_name}`.trim()
      }

      if (this.resource.first_name && !this.resource.last_name) {
        return `${this.resource.first_name}`.trim()
      }

      return ''
    },

    isContactOptedOut () {
      if (!this.resource?.phone_numbers?.length) {
        return false
      }
      return this.resource.phone_numbers.every((phoneNumber) => phoneNumber.is_opted_out)
    }
  },

  methods: {
    onNavigate (navigate) {
      navigate()
    }
  }
}
</script>
