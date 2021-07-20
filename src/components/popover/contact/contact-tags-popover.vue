<template>
  <b-popover ref="popover"
             placement="right"
             custom-class="contact-tag-popover"
             :target="target"
             :triggers="triggers"
             :show.sync="show"
             @show="onShow"
             @shown="onShown"
             @hidden="onHidden">
    <b-form @submit="onSubmit">
      <h6>Tags</h6>
      <q-select
        compact
        outlined
        use-chips
        use-input
        multiple
        input-debounce="0"
        behavior="menu"
        map-options
        emit-value
        option-value="id"
        option-label="name"
        style="width: 100%;"
        v-model="tags"
        :options="options"
        @filter="filterTagFn"
        @add="onAdd"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <div class="d-flex justify-content-between">
        <b-button type="button" size="sm" variant="light" v-on:click="onClose">Cancel</b-button>
        <b-button type="submit" size="sm" variant="primary">Save</b-button>
      </div>
    </b-form>
  </b-popover>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from '../../../plugins/api/api'

export default {
  name: 'add-tag-popover',
  props: {
    target: String,
    triggers: {
      type: String,
      default: 'focus'
    },
    custom_class: {
      type: String,
      default: 'contact-edit-popovers'
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      show: false,
      is_busy: false,
      phone: {
        title: null,
        number: null
      },
      stringOptions: [],
      options: [],
      tags: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact', 'setContactTags']),
    onClose () {
      this.show = false
    },
    onShow () {
      this.getTags().finally(() => {
        this.tags = this.contact.tags.map(tag => tag.id)
      })

      // reset form here
    },
    onShown () {
      // Called just after the popover has been shown
      // Transfer focus to the first input
      this.focusRef(this.$refs.title)
    },
    onHidden () {
      // Called just after the popover has finished hiding
      // Bring focus back to the button
      // this.focusRef(this.$refs.button)
    },
    onAdd (details) {
      console.log(details)
    },
    onRemove () {

    },
    onSubmit (e) {
      this.is_busy = true
      talk2Api.V1.contact.storeTags(this.contact.id, { tags: this.tags })
        .then(response => {
          this.setContactTags(response.data)
          this.is_busy = false
          this.onClose()
        }).catch(err => {
          this.$root.handleErrors(err.response)
          this.is_busy = false
        })

      e.preventDefault()
    },
    focusRef (ref) {
      // Some references may be a component, functional component, or plain element
      // This handles that check before focusing, assuming a `focus()` method exists
      // We do this in a double `$nextTick()` to ensure components have
      // updated & popover positioned first
      this.$nextTick(() => {
        this.$nextTick(() => {
          // (ref.$el || ref).focus()
        })
      })
    },
    filterTagFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.stringOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.stringOptions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getTags () {
      return talk2Api.V1.tags.get().then(response => {
        this.stringOptions = response.data
        this.options = this.stringOptions
      })
    }
  }
}
</script>

<style lang="scss" scoped>
 .contact-tag-popover {
   width: 300px;
   left: -340px !important;
 }
</style>
