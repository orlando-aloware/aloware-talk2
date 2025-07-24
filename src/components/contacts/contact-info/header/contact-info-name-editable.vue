<template>
  <div class="alw-contact-name-wrapper">
    <q-btn
      v-if="!isReadOnly"
      class="alw-contact-name-btn"
      dense
      flat
      no-caps
      @click="showEditForm = true"
    >
      <q-tooltip
        v-if="showTooltip && !isMobile"
        anchor="top middle"
        content-class="fs-12"
        data-testid="contact-info-name-tooltip"
        self="center middle"
      >
        {{ contactName }}
      </q-tooltip>
      <div class="alw-contact-name-content" @mouseenter="checkTruncation" @touchstart="checkTruncation">
        <span ref="nameElement" class="alw-contact-name">{{ contactName }}</span>
        <i class="material-icons alw-contact-name-edit-icon">edit</i>
      </div>
    </q-btn>
    <span v-else ref="nameElementReadOnly" class="alw-contact-name" @mouseenter="checkTruncation"
          @touchstart="checkTruncation">
      <q-tooltip
        v-if="showTooltip && !isMobile"
        anchor="top middle"
        content-class="fs-12"
        data-testid="contact-info-name-tooltip"
        self="center middle"
      >
        {{ contactName }}
      </q-tooltip>
      {{ contactName }}
    </span>

    <q-menu
      v-model="showEditForm"
      :offset="[0, -50]"
      anchor="top middle"
      content-class="mx-height-300"
      data-testid="contact-info-edit-form-menu"
      no-focus
      no-parent-event
      self="top middle"
    >
      <div class="row no-wrap q-pa-md">
        <contact-name-form
          data-testid="contact-info-name-form"
          @close="onCloseEditForm"
        />
      </div>
    </q-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContactNameForm from 'src/components/forms/contact-name-form'

export default {
  name: 'contact-info-name-editable',
  components: {
    ContactNameForm
  },
  props: {
    contact: {
      type: Object,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showTooltip: false,
      showEditForm: false
    }
  },
  computed: {
    ...mapState(['isMobile']),
    contactName () {
      return this.contact?.name || 'No Name'
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.checkTruncation()
    })
  },
  methods: {
    checkTruncation () {
      const element = this.isReadOnly ? this.$refs.nameElementReadOnly : this.$refs.nameElement
      if (element) {
        const isHorizontallyTruncated = element.scrollWidth > element.clientWidth + 2
        const isVerticallyTruncated = element.scrollHeight > element.clientHeight + 2
        this.showTooltip = isHorizontallyTruncated || isVerticallyTruncated
      }
    },
    onCloseEditForm () {
      this.showEditForm = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.alw-contact-name-wrapper {
  flex: 1 1 0;
  min-width: 0;
}

.q-btn.alw-contact-name-btn {
  padding: 0 6px;
  color: inherit;
  border-radius: 12px;
  width: 100%;
  height: 40px;
  min-height: 40px;
  justify-content: flex-start;

  ::v-deep .q-btn__wrapper {
    padding-top: 0;
    padding-bottom: 0;
  }

  &:hover {
    .alw-contact-name {
      text-decoration: underline;
    }

    .alw-contact-name-edit-icon {
      color: darken($primary, 10%);
    }
  }
}

.alw-contact-name-content {
  display: flex;
  align-items: center;
  font-size: 16px;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.alw-contact-name {
  line-height: 1.2;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; // Maximum 2 lines
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-word;
  text-align: left;
}

.alw-contact-name-edit-icon {
  color: $primary;
  transition: color 0.3s ease;
  margin-left: 4px;
  font-size: 18px;
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 16px;
  }
}
</style>
