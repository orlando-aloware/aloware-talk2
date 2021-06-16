<template>
  <div class="contact-list-sidebar-wrapper">
    <q-list>
      <q-item v-for="contact in contacts" :key="contact.id" class="q-my-sm p-2" clickable v-ripple>
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ contact.letter }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ contact.name }}</q-item-label>
          <q-item-label caption lines="1">{{ contact.phone }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge rounded color="red" label="1" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  data () {
    return {
      contacts: [
        {
          id: 1,
          name: 'Susan Daniel',
          phone: '(514) 423 3566',
          letter: 'SD'
        }, {
          id: 2,
          name: 'Mallorie Alessandrini',
          phone: '(514) 423 3566',
          letter: 'MA'
        }, {
          id: 3,
          name: 'Elisabetta Wicklen',
          phone: '(514) 423 3566',
          letter: 'EW'
        }, {
          id: 4,
          name: 'Seka Fawdrey',
          phone: '(514) 423 3566',
          letter: 'SF'
        },
        {
          id: 5,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 6,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 7,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 8,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 9,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 10,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        },
        {
          id: 11,
          name: 'Brunhilde Panswick',
          phone: '(514) 423 3566',
          avatar: 'BP'
        }, {
          id: 12,
          name: 'Winfield Stapforth',
          phone: '(514) 423 3566',
          avatar: 'WS'
        }
      ]

    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-list-sidebar-wrapper {
    max-height: 85vh;
    min-height: 85vh;
    border-right: 1px solid #dee2e6;
    overflow: auto;
  }
</style>
