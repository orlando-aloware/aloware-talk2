<template>
  <tbody>
    <tr v-for="contact in contacts"
        :key="contact.id"
        class="contact-items">
      <td>
        <checkbox />
      </td>
      <td class="d-flex just align-items-center">
        <avatar class="mr-2">{{ contact.name | initials }}</avatar>
        {{ contact.name }}
      </td>
      <td>
        {{ contact.phone_number }}
      </td>
      <td>
        {{ contact.company }}
      </td>
      <td>
        <call-details-tag v-for="tag in contact.tags"
                          :key="tag"
                          :name="tag" />
      </td>
      <td>
        <inbox-nav-badge v-if="contact.unreads"
                         :value="contact.unreads"
                         color="danger" />
      </td>
    </tr>
  </tbody>
</template>

<script>
import CallDetailsTag from 'components/inbox/call-details/call-details-tag'
import Checkbox from 'components/checkbox/checkbox'
import Avatar from 'components/avatar/avatar'
import InboxNavBadge from 'components/inbox/inbox-nav/inbox-nav-badge'

export default {
  name: 'contact-items',
  components: { InboxNavBadge, Avatar, Checkbox, CallDetailsTag },
  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contact-items {
  border-bottom: 1px solid $grey-light3;
  td {
    height: 60px;
  }
}
</style>
