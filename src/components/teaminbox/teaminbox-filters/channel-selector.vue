<template>
  <q-select
    ref="channelsSelect"
    class="q-basic-selector"
    option-value="value"
    option-label="label"
    emit-value
    map-options
    dense
    outlined
    color="primary"
    multiple
    use-chips
    use-input
    placeholder="Select Channels"
    data-testid="channels-selector"
    :options="fChannelOptions"
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
        data-testid="channels-selector-chip"
      >
        <i class="fa fa-circle position-absolute"
          :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.label }}</span>
        <div role="button"
            class="custom__remove d-flex align-items-center position-absolute r-0"
            @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon"
                          data-testid="channels-selector-remove-tag-icon" />
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
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'ChannelSelector',

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

  data () {
    return {
      fChannelOptions: [],
      channelOptions: [
        { label: 'Calls', value: CommunicationTypes.CALL_TYPE },
        { label: 'Messages', value: CommunicationTypes.SMS_TYPE },
        { label: 'Mentions', value: 'mentions' }
      ]
    }
  },

  methods: {
    showChannelsPlaceholder () {
      const input = this.$refs.channelsSelect?.$el?.querySelector('.q-basic-selector .q-field__input')
      if (!input) {
        return
      }

      if (!this.value?.length) {
        input.placeholder = 'Select Channels'
        input.style.display = 'block'
        return
      }

      input.placeholder = ''
    },

    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.fChannelOptions = this.channelOptions
        })
        return
      }

      update(() => {
        this.fChannelOptions = this.channelOptions.filter(option => option.label.toLowerCase().includes(val.toLowerCase()))
      })
    }
  },

  mounted () {
    this.fChannelOptions = [ ...this.channelOptions ]
    this.showChannelsPlaceholder()
  },

  watch: {
    value () {
      this.showChannelsPlaceholder()
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
