<template>
  <div class="teaminbox-empty-state">
    <div class="empty-state-header">
      <h3 class="title-text">Build Your Team's Command Center!</h3>
    </div>
    <img class="empty-state-image"
         :src="teamInboxImage"
         alt="How to request a line and ring group from admin" />
    <div class="cta-button-container">
      <b-button class="learn-more-button"
                pill
                variant="primary"
                @click="openLearnMore">
        {{ ctaButtonText }}
      </b-button>
    </div>
    <div class="empty-state-footer">
      <p class="info-text">
        Your new Team Inbox is ready to bring everyone together. This <strong>Team Inbox</strong> is designed to give
        you, your teammates, and your managers a single place to collaborate with full visibility.
      </p>
      <p class="info-text">
        When your administrator configures it, this empty space transforms into a powerful, multi-layered view. It works
        by bringing together:
      </p>
      <slot name="list-content">
        <ul class="info-list">
          <li><strong>Connected Inboxes:</strong> See and collaborate on the real-time calls and messages being handled
            by every active member of this team.
          </li>
          <li><strong>Watching Inboxes:</strong> Give managers and supervisors a bird's-eye view of all communications
            for coaching, quality, and to ensure no customer is left behind.
          </li>
          <li><strong>Personal Inboxes:</strong> Unify the communications from everyone's direct lines into one shared,
            organized space so you can stop guessing and start working together.
          </li>
        </ul>
      </slot>
      <p class="info-text">
        Ready to see the full picture? <strong>Contact your administrator</strong> and ask them to set up this Team
        Inbox to connect your entire team today!
      </p>
    </div>
  </div>
</template>

<script>
import teamInboxImage from 'src/assets/teaminbox-request-line-instruction.jpg'

export default {
  name: 'TeamInboxEmptyState',

  props: {
    ctaButtonText: {
      type: String,
      default: 'Learn More'
    },
    ctaButtonLink: {
      type: String,
      default: 'https://support.aloware.com/en/articles/10980011-how-to-set-up-and-use-aloware-team-inbox'
    }
  },

  data () {
    return {
      teamInboxImage
    }
  },

  methods: {
    openLearnMore () {
      window.open(this.ctaButtonLink, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.teaminbox-empty-state {
  background: url('/assets/images/fomo/Gradient.png') no-repeat center center;
  background-size: cover;
  background-position: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;

  @media(max-width: 784px) {
    overflow-y: auto;
  }

  @media(min-width: 785px) {
    overflow: hidden;
  }

  .empty-state-header {
    flex: 0 0 auto;
    margin-bottom: 10px;

    .title-text {
      color: #000;
      font-family: Inter;
      font-size: 20px;
      font-weight: 700;
      margin: 0;

      @media(max-width: 784px) {
        font-size: 18px;
        line-height: 1.2;
      }
    }
  }

  .empty-state-image {
    flex: 1;
    min-height: 0;
    max-width: 90%;
    width: auto;
    height: auto;
    object-fit: contain;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    align-self: center;

    @media(min-width: 1400px) {
      max-width: 600px;
    }

    @media(max-width: 784px) {
      flex: 0 0 auto;
      max-height: 40vh;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .cta-button-container {
    flex: 0 0 auto;
    margin: 20px 0;

    @media(max-width: 784px) {
      margin: 15px 0;
    }

    .learn-more-button {
      font-family: Inter;
      font-style: normal;
      font-weight: 600;
      padding: 8px 24px;
      background-color: #054CDB;
      border-color: #054CDB;
      color: white;

      &:hover {
        background-color: #0440B8;
        border-color: #0440B8;
      }
    }
  }

  .empty-state-footer {
    flex: 0 0 auto;
    padding: 5px 20px 0;
    text-align: left;

    @media(max-width: 784px) {
      padding: 10px 15px 15px;
    }

    .info-text {
      margin: 8px 0;
      font-size: 13px;
      line-height: 1.4;
      color: #333;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }

      strong {
        font-weight: 600;
      }
    }

    .info-list {
      margin: 10px 0;
      padding-left: 20px;

      li {
        margin: 5px 0;
        font-size: 13px;
        line-height: 1.4;
        color: #333;
      }
    }
  }
}
</style>
