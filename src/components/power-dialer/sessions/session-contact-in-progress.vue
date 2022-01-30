<template>
  <q-card class="t-cards pt-2">
    <q-list class="px-2 pb-2">
      <q-item class="active t-expansion-panel px-2">
        <div class="py-2">
          <q-avatar size="30px" color="grey">
            {{ avatarName(firstname, lastname) }}
          </q-avatar>
        </div>

        <q-item-section class="pl-2">
          <q-item-label>{{ firstname }} {{ lastname }}</q-item-label>
          <q-item-label caption lines="2">{{ phone_number | fixPhone('NATIONAL', true) }}</q-item-label>
          <q-item-label caption lines="2">{{ company_name }}</q-item-label>
        </q-item-section>

        <q-item-section
          class="t-item-icon"
          side top>
          <q-avatar color="red" size="md">
            <PhoneIcon color="white" />
          </q-avatar>
        </q-item-section>

      </q-item>
    </q-list>
  </q-card>
</template>

<script>

import PhoneIcon from 'components/icons/call-drop-icon'

export default {
  name: 'ContactInProgress',
  components: {
    PhoneIcon
  },
  props: {
    inProgressContact: {
      type: Object
    }
  },
  computed: {
    firstname () {
      return this.inProgressContact?.first_name
    },
    lastname () {
      return this.inProgressContact?.last_name
    },
    phone_number () {
      return this.inProgressContact?.phone_number
    },
    company_name () {
      return this.inProgressContact?.company_name
    }
  },
  methods: {
    avatarName (fname, lname) {
      return `${fname?.[0]}${lname?.[0]}`
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
