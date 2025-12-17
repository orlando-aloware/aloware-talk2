<template>
  <q-select
    ref="inboxSelect"
    class="q-basic-selector"
    option-value="id"
    option-label="name"
    emit-value
    map-options
    dense
    outlined
    color="primary"
    multiple
    use-chips
    use-input
    placeholder="Select Inboxes"
    data-testid="inbox-selector"
    :options="fInboxOptions"
    :value="value"
    @input="$emit('input', $event)"
    @filter="filterFn"
  >
    <template v-slot:selected-item="scope">
      <q-chip
        dense
        :tabindex="scope.tabindex"
        color="white"
        class="tag-selected-chip"
        text-color="secondary"
        data-testid="inbox-selector-chip"
      >
        <i class="fa fa-circle position-absolute"
           :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button"
            class="custom__remove d-flex align-items-center position-absolute r-0"
            @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon"
                          data-testid="inbox-selector-remove-tag-icon" />
        </div>
      </q-chip>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'InboxSelector',

  components: {
    RemoveTagIcon
  },

  props: {
    value: {
      type: Array,
      default: () => []
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState('TeamInbox', ['inboxes']),

    inboxOptions () {
      return this.inboxes.map(inbox => ({
        id: inbox.id,
        name: inbox.name
      }))
    }
  },

  data () {
    return {
      fInboxOptions: []
    }
  },

  methods: {
    showInboxPlaceholder () {
      const input = this.$refs.inboxSelect?.$el?.querySelector('.q-basic-selector .q-field__input')
      if (!input) {
        return
      }

      if (!this.value?.length) {
        input.placeholder = 'Select Inboxes'
        input.style.display = 'block'
        return
      }

      input.placeholder = ''
    },

    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.fInboxOptions = this.inboxOptions
        })
        return
      }

      update(() => {
        this.fInboxOptions = this.inboxOptions.filter(option => option.name.toLowerCase().includes(val.toLowerCase()))
      })
    }
  },

  mounted () {
    this.fInboxOptions = [ ...this.inboxOptions ]
    this.showInboxPlaceholder()
  },

  watch: {
    value () {
      this.showInboxPlaceholder()
    },
    inboxOptions () {
      this.fInboxOptions = [ ...this.inboxOptions ]
      this.showInboxPlaceholder()
    }
  }
}
</script>

<style lang="scss" scoped>
.q-basic-selector {
  min-width: 200px;
}

.tag-selected-chip {
  position: relative;
  padding-right: 30px;
}

.custom__remove {
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.remove-tag-icon {
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}
</style>
