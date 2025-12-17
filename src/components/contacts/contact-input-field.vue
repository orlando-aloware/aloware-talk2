<template>
  <div>
    <q-input class="inline-input"
             ref="inline_input"
             debounce="500"
             :loading="is_busy"
             :placeholder="placeholder"
             :value="field"
             :disable="disabled"
             data-testid="contact-input-field"
             v-model="field">
      <template v-slot:append class="q-field-icon__append">
        <pencil-o-icon v-if="!is_busy && !disabled"
                       color="#256EFF"
                       class="cursor-pointer text-size-rg"
                       data-testid="contact-input-field-pencil-icon"
                       @click="getFocus">
        </pencil-o-icon>
      </template>
      <template v-slot:error>
        Please use maximum 3 characters.
      </template>
    </q-input>
  </div>
</template>

<script>
import PencilOIcon from 'components/icons/pencil-o-icon'

export default {
  name: 'contact-input-field',

  components: { PencilOIcon },

  props: {
    placeholder: {
      type: String,
      default: '',
      required: false
    },
    value: {
      type: [
        String,
        Number
      ]
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    field: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },

  data () {
    return {
      is_busy: false
    }
  },

  methods: {
    getFocus () {
      this.$refs.inline_input.focus()
    }
  },

  watch: {
    field: function (val) {
      this.$emit('updateField', val)
    }
  }
}
</script>
