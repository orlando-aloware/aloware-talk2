<template>
  <div class="contact-info-edit-wrapper">
    <q-btn
      v-if="!isReadOnly"
      color="primary"
      data-testid="contact-info-edit-button"
      dense
      flat
      round
      size="md"
      @click="showEditForm = true"
    >
      <q-tooltip
        v-if="!isMobile"
        anchor="top middle"
        content-class="fs-12"
        self="center middle"
      >
        Edit Contact
      </q-tooltip>
      <contact-info-edit-icon :size="18" />
    </q-btn>

    <q-menu
      v-model="showEditForm"
      :offset="[10, 0]"
      anchor="top left"
      content-class="mx-height-300"
      data-testid="contact-info-edit-form-menu"
      no-focus
      no-parent-event
      self="top right"
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
import ContactInfoEditIcon from './contact-info-edit-icon.vue'
import ContactNameForm from 'src/components/forms/contact-name-form'

export default {
  name: 'contact-info-edit-contact',
  components: {
    ContactInfoEditIcon,
    ContactNameForm
  },
  props: {
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showEditForm: false
    }
  },
  computed: {
    ...mapState(['isMobile'])
  },
  methods: {
    onCloseEditForm () {
      this.showEditForm = false
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-info-edit-wrapper {
  flex-shrink: 0;
}
</style>
