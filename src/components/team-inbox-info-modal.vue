<template>
  <div class="info-modal-section d-flex align-items-center">
    <q-btn class="activator-outline__button height-35 mr-2"
           color="primary"
           outline
           no-caps
           @click="openModal"
           v-if="shouldShowDefaultActivator">
      {{ activatorText }}
    </q-btn>
    <slot name="activator"
          v-else
          @click="openModal" />
    <div class="info-modal"
         v-if="showModal">
      <div class="overlay"
           @click="closeModal"/>
      <div class="modal-content">
        <div class="modal-header">
          <h3 v-if="title">{{ title }}</h3>
          <button class="close-button"
                  @click="closeModal">✖</button>
        </div>
        <div class="modal-body">
          <div class="image-container" v-if="imageUrl">
            <img :src="imageUrl" :alt="title" />
          </div>
          <div class="modal-text" v-if="body">
            <p v-html="body" />
          </div>
        </div>
        <div class="modal-footer">
          <q-btn
            color="primary"
            no-caps
            class="full-width"
            @click="navigateToDestination">
            {{ ctaText }}
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueCookies from 'vue-cookies'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'team-inbox-info-modal',

  props: {
    title: {
      type: String,
      default: null
    },

    body: {
      type: String,
      default: null
    },

    imageUrl: {
      type: String,
      default: null
    },

    ctaText: {
      type: String,
      default: 'Open Team Inbox'
    },

    activatorText: {
      type: String,
      default: 'Open Info'
    },

    destinationRoute: {
      type: Object,
      default: () => ({ name: 'Team Inboxes' })
    },

    shouldShowDefaultActivator: {
      type: Boolean,
      default: false
    },

    shouldShowInFirstVisit: {
      type: Boolean,
      default: true
    },

    cookieName: {
      type: String,
      default: 'team-inbox-announcement'
    },

    maxShows: {
      type: Number,
      default: 3
    }
  },

  data () {
    return {
      showModal: false,
      visits: 0
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('TeamInbox', ['inboxAnnouncementViewed'])
  },

  created () {
    if (this.inboxAnnouncementViewed) {
      return
    }

    this.$cookies = VueCookies
    this.visits = parseInt(this.$cookies.get(this.cookieName) || 0)

    console.log('visits', this.visits)

    if (this.visits < this.maxShows && this.shouldShowInFirstVisit) {
      this.showModal = true
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setInboxAnnouncementViewed']),

    closeModal () {
      this.showModal = false
      this.$cookies.set(this.cookieName, this.visits + 1, '3650d')
      this.setInboxAnnouncementViewed(true)
    },

    openModal () {
      this.showModal = true
    },

    navigateToDestination () {
      this.closeModal()
      this.$router.push(this.destinationRoute)
    }
  }
}
</script>

<style scoped>
.info-modal-section {
  position: relative;
}

.info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.image-container {
  margin-bottom: 16px;
}

.image-container img {
  width: 100%;
  border-radius: 4px;
}

.modal-text {
  margin-bottom: 16px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
}
</style>
