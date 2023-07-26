<template>
  <div>
    <vue-multiselect track-by="id"
                     label="name"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select list"
                     :searchable="true"
                     :show-no-results="false"
                     :close-on-select="true"
                     :options="lists"
                     :show-labels="false"
                     :allow-empty="false"
                     :loading="loading"
                     v-model="list"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'contacts-list-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: Number,
      required: false,
      default: null
    }
  },

  computed: {
    ...mapGetters({
      lists: 'contactsLists'
    })
  },

  data: () => ({
    list: null,
    loading: false
  }),

  async mounted () {
    if (!this.lists.length) {
      this.loading = true

      await this.fetchContactsLists()

      this.loading = false
    }

    if (this.value) {
      this.list = this.lists.find(list => list.id === this.value)
    }
  },

  methods: {
    ...mapActions([
      'fetchContactsLists'
    ]),

    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>

<style src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
