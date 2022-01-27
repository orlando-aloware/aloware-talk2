<template>
  <div class="d-flex align-items-center">
    <div class="pr-2">
      <Avatar :name="name"/>
    </div>
    <div class="flex-grow-1">
      <router-link
        :to="`${linkPath}${computedResource.id}?previousPage=PowerDialer`"
        v-slot="{ href, route, navigate }">
        <a :href="href"
          @click="navigate"
          class="d-flex align-items-center item contact-name">
          <template v-if="name">
            <div class="ellipse">{{ name | ucwords }}</div>
          </template>
          <template v-if="!name">No Name</template>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>

import Avatar from 'components/avatar'

export default {
  name: 'NameWrapper',
  props: {
    resource: {
      type: Object,
      default: () => {}
    },
    linkPath: {
      type: String,
      default: '/'
    }
  },
  components: {
    Avatar
  },
  computed: {
    computedResource () {
      return this.resource || {}
    },
    name () {
      let { computedResource } = this
      if (computedResource.first_name && computedResource.last_name) {
        return `${computedResource.first_name} ${computedResource.last_name}`
      }
      return ''
    }
  }
}
</script>
