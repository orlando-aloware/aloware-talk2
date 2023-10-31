<template>
  <div class="d-flex align-items-center">
    <button class="activator-button"
            type="icon"
            plain
            @click="openModal">
      <div class="activator-icon">
        <video-camera-icon />
      </div>
    </button>

    <div class="video-modal"
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
          <iframe frameborder="0"
                  allowfullscreen
                  :src="videoUrl"/>
        </div>
        <div class="modal-notes"
              v-if="notes">
          <p v-html="notes" />
          <div class="modal-link"
               v-if="learnMoreLink">
            <a target="_blank"
               rel="noopener noreferrer"
               :href="learnMoreLink">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueCookies from 'vue-cookies'
import VideoCameraIcon from './icons/video-camera-icon.vue'

export default {
  name: 'video-modal',

  components: {
    VideoCameraIcon
  },

  props: {
    title: {
      type: String,
      default: null
    },

    notes: {
      type: String,
      default: null
    },

    cookieName: {
      type: String,
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    learnMoreLink: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      showModal: false
    }
  },

  created () {
    this.$cookies = VueCookies

    if (!this.$cookies.get(this.cookieName)) {
      this.showModal = true
    }
  },

  methods: {
    closeModal () {
      this.showModal = false
      this.$cookies.set(this.cookieName, 'viewed') // Set cookie to expire in 1 day
    },
    openModal () {
      this.showModal = true
    }
  }
}
</script>

<style lang="scss" scoped>

.activator {
  &-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 34px;
    border-radius: 4px;
    border: none;
    background-color: rgba(37, 255, 72, 0.12) !important;
    cursor: pointer;

    &:hover {
      background-color: rgba(37, 255, 73, 0.15) !important;
    }
  }

  &-icon {
    flex-shrink: 0;
    color: #00A04F;
    width: 24px;
    height: 24px;
  }
}
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000;
  padding: 40px
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.modal-content {
  position: relative;
  width: 80%;
  max-width: 800px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 10px 15px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px; /* Smaller font size */
  font-weight: 300; /* Lighter font weight */
  line-height: 1;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.close-button:hover {
  color: #555; /* Slightly darker on hover for feedback */
}

.modal-body {
  padding: 0;
}

.modal-body iframe {
  width: 100%;
  height: 50vh;
  border: none;
}

.modal-notes {
  padding: 15px;
  font-size: 1em;
  color: #666;
  font-weight: normal;
  text-align: center;
}

.modal-link {
  text-align: center;
  color: var(--Primary-Blue, #256EFF);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
