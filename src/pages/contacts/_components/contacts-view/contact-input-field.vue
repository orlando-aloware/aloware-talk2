<template>
  <div>
    <q-input class="inline-input"
             ref="inline_input"
             debounce="500"
             :loading="is_busy"
             :placeholder="placeholder"
             :value="field"
             v-model="field">
      <template v-slot:append>
        <q-icon v-if="!is_busy"
                name="edit"
                class="cursor-pointer input-edit-icon" v-on:click="getFocus" />
      </template>
      <template v-slot:error>
        Please use maximum 3 characters.
      </template>
    </q-input>
  </div>
</template>

<script>
export default {
  name: 'contact-input-field',
  props: {
    placeholder: {
      type: String,
      default: '',
      required: false
    },
    value: {
      type: String
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
      this.is_busy = true
      this.$emit('updateField', { val,
        callback: () => {
          this.is_busy = false
        } })
    }
  }
}
</script>

<style scoped>
  .input-edit-icon {
    font-size: 60%;
  }
</style>
