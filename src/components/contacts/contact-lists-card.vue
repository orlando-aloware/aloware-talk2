<template>
  <b-card class="border-0 contact-lists-card"
          data-testid="contact-lists-card">
    <div class="contact-lists-card-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="contact-lists-card-body">
      <div v-for="list in lists" :key="list.id" class="d-flex align-items-start">
        <list-icon :key="'list_icon_' + list.id"/>
        <div class="pl-6">{{ list.name }}</div>
      </div>
    </div>
    <div class="notes mt-1"
         style="min-height: 15px;"
         data-testid="contact-update-lists"
         @click="onUpdate">
    </div>
    <div class="contacts-list-card-footer">

      <div class="generic-multi-select">
        <div class="list-wrapper">
          <div class="w-100 mt-1">
            <b-link href="#"
                    class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                    @click="onUpdate">
              <slot name="button">
                <pencil-o-icon />
                <span class="ml-1">
              Modify Lists
            </span>
              </slot>
            </b-link>
          </div>
        </div>
      </div>
    </div>

  </b-card>
</template>

<script>

import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import ListIcon from 'components/icons/list-icon.vue'

export default {
  name: 'contact-lists-card',

  components: {
    PencilOIcon,
    ListIcon
  },

  props: {
    contact: {
      required: true
    },

    lists: {
      required: true
    },

    title: {
      true: true
    }
  },

  computed: {},

  data () {
    return {
      isLoading: false,
      isSaving: false,
      prevValue: ''
    }
  },

  mounted () {

  },

  methods: {
    onInput (value) {

    },

    onBlur () {

    },

    onUpdate () {

    }
  },
  watch: {
    'contact.id': function () {

    }
  }
}
</script>
