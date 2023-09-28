<template>
  <div class="d-flex align-items-center">
    <div class="pr-2">
      <avatar :name="name"/>
    </div>
    <div class="flex-grow-1">
      <router-link :to="`${linkPath}${resource.id}`"
                   v-slot="{ href, route, navigate }">
        <a class="d-flex align-items-center item contact-name text-bold"
           :href="href"
           @click="navigate">
          <template v-if="name">
            <div class="ellipse">{{ name | ucwords }}</div>
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
    }
  },

  methods: {
    onNavigate (navigate) {
      navigate()
    }
  }
}
</script>
