<template>
    <div class="upgrade-now no-select"
         v-if="!isSimpSocial">
        <h3 class="title-text mt-2">{{ titleText }}</h3>
        <div class="flex-row mb-4 mt-2">
          <div class="col-12 col-md-10 offset-md-1">
            <img class="mt-3 mb-3"
                 :src="imageLink"/>
          </div>
        </div>
        <p class="info-text">{{ text }}</p>
        <div class="flex-row mb-4 mt-3">
            <el-button v-if="kbLink"
                       size="large"
                       type="text"
                       class="cursor-pointer el-button learn-more-text mr-2"
                       @click="openKnowledgeBaseLink">
                Learn More
            </el-button>
            <b-button pill
                      variant="primary"
                      class="cursor-pointer el-button ml-2"
                      :disabled="disabled"
                      @click="checkClick">
              {{ buttonText }}
            </b-button>
        </div>
    </div>
</template>

<script>
import { simpsocialMixin, userMixin } from 'src/plugins/mixins'

export default {
  name: 'upgrade-now',

  mixins: [
    simpsocialMixin,
    userMixin
  ],

  props: {
    text: {
      type: String,
      default: 'This is not included in your current plan. To use it, please contact us to upgrade today!',
      required: false
    },
    buttonText: {
      type: String,
      default: 'Request a Plan Upgrade',
      required: false
    },
    kbLink: {
      type: String,
      required: false
    },
    defaultClick: {
      type: Boolean,
      default: true,
      required: false
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false
    },
    titleText: {
      type: String,
      required: true
    },
    imageLink: {
      type: String,
      required: true
    }
  },

  computed: {

  },

  methods: {
    openKnowledgeBaseLink () {
      window.open(this.kbLink, '_blank')
    },

    checkClick () {
      let defaultLink = (this.isModGen) ? 'https://moderategeni.us/aloware-info' : 'https://aloware.com/get-demo/'

      if (this.defaultClick) {
        window.open(defaultLink, '_blank')
      } else {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
    .upgrade-now {
      background: url('/assets/images/fomo/Gradient.png') no-repeat center center;
      background-size: contain;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .upgrade-now img {
      width: 100%;
      max-width: 616px;
    }

    .title-text {
      color: #000 !important;
      font-family: Inter;
      font-size: 22px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }

    .info-text {
      margin: 15px auto;
      max-width: 540px;
    }

    .el-button {
      font-family: Inter;
      font-style: normal;
      font-weight: 600;
    }

    .learn-more-text {
      color: #054CDB;
      font-weight: 700;
    }
</style>
