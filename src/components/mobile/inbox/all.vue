<template>
  <div class="h-100 overflow-y-auto"
       ref="scrollTargetRef">
    <q-infinite-scroll @load="loadMore"
                       :debounce="50"
                       :scroll-target="$refs.scrollTargetRef">
      <template v-if="contacts.length > 0">
        <q-pull-to-refresh color="success"
                           icon="fas fa-sync-alt has-text-small"
                           :scroll-target="$refs.scrollTargetRef"
                           @refresh="refreshContacts">
          <div v-for="contact in contacts"
               :key="contact.id">
            <inbox-item :contact="contact" />
          </div>
        </q-pull-to-refresh>
      </template>
      <template v-slot:loading
                v-if="contacts.length !== 0">
        <div class="row justify-center q-my-md">
          <q-spinner-bars color="success"
                          size="sm"/>
        </div>
      </template>
    </q-infinite-scroll>
    <template v-if="contacts.length === 0 && !loading">
      <q-pull-to-refresh color="success"
                         icon="fas fa-sync-alt text-sm"
                         :scroll-target="$refs.scrollTargetRef"
                         @refresh="refreshContacts">
        <div class="h-100 d-flex justify-center align-items-center">
          <p class="text-center d-flex text-black mt-4">No new messages</p>
        </div>
      </q-pull-to-refresh>
    </template>
    <template v-if="contacts.length === 0 && loading">
      <div class="h-100 d-flex flex-column justify-center align-items-center">
        <q-spinner-bars color="success"
                        size="40px"/>
        <div class="text-black mt-2">
          <span>Loading new messages</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import InboxItem from '../../inbox/inbox-list/inbox-item'
export default {
  name: 'mobile-inbox-all',
  components: { InboxItem },
  data () {
    return {
      loading: false,
      contacts: [
        {
          name: 'Aloware Contact',
          communication: {
            type: 2,
            body: 'Hey! I’ll like to talk to customer rep. I have some issue with lorem ipsum auris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
            created_at: '2021-03-12 23:01:00'
          }
        },
        {
          name: 'Walter Bowman',
          communication: {
            type: 1,
            disposition_status: 'missed',
            created_at: '2021-03-12 18:00:00'
          }
        },
        {
          name: 'Aloware Contact',
          communication: {
            type: 2,
            body: 'Hi, Pellentesque in ipsum id orci porta\ndapibus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
            created_at: '2021-03-12 17:00:00'
          }
        },
        {
          name: 'Dominic Welch',
          communication: {
            type: 2,
            body: 'Hey! I’ll like to talk to customer rep. I have some issue with lorem ipsum auris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
            created_at: '2021-03-12 16:00:00'
          }
        },
        {
          name: 'Sales Group',
          communication: {
            type: 2,
            body: 'Pellentesque in ipsum id orci porta\ndapibus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
            created_at: '2021-03-12 15:00:00'
          }
        },
        {
          name: 'Aloware Contact 2',
          communication: {
            type: 2,
            body: 'Hey! I’ll like to talk to customer rep. I have some issue with lorem ipsum auris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
            created_at: '2021-03-12 14:00:00'
          }
        }
      ]
    }
  },
  methods: {
    refreshContacts () {
      // TODO
    },
    loadMore () {
      // TODO
    }
  }
}
</script>

<style scoped>

</style>
