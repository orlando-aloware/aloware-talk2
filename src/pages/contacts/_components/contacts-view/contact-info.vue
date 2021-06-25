<template>
  <b-card class="mt-2 mb-2 border-0">
    <b-media>
      <template #aside>
        <avatar class="mr-2 contact-avatar"
                width="40"
                height="40"
                :name="contact.name" />
      </template>

      <div class="d-flex justify-content-between relative-position">
        <div>
          <h6 class="mt-0 contact-name" v-b-tooltip="contact.name">{{ contact.name }}</h6>
          <p class="contact-phone">
            {{ contact.phone_number | fixPhone }} <i class="material-icons">content_copy</i>
          </p>
        </div>
        <b-button class="btn-edit-contact-info btn-bg-transparent btn-b-0"
                  size="sm"
                  variant="light"
                  id="btn-edit-contact-info">
          <i class="material-icons">edit</i>
        </b-button>
        <b-popover custom-class="edit-form-popover"
                   target="btn-edit-contact-info"
                   triggers="focus"
                   :show.sync="showEditForm">
            <contact-name-form @close="onCloseEditForm"></contact-name-form>
        </b-popover>
      </div>
    </b-media>
    <div class="d-inline-flex flex-wrap contact-action-button">
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">call</i></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><span class="material-icons">calendar_today</span></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">timer</i></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">add_ic_call</i></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">add_ic_call</i></b-button>
    </div>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactNameForm from 'pages/contacts/_components/forms/contact-name-form'
import Avatar from 'src/components/avatar/avatar.vue'

export default {
  name: 'contact-info',
  components: { Avatar, ContactNameForm },
  computed: {
    ...mapGetters('contacts', ['contact', 'isContactNameEditOpen'])
  },
  data () {
    return {
      showEditForm: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactNameEditOpen']),
    onCloseEditForm () {
      this.showEditForm = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-name{
    font-size: 0.85em;
    display: inline-block;
    width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .contact-avatar {
    background-color: #95989E !important;
  }

  .card:hover {
    .btn-edit-contact-info {
      opacity: 1;
    }
  }

  .contact-phone {
    font-size: 0.80rem;
    margin-top: -5px;
    right: 0;
  }

  .btn-edit-contact-info {
    position: absolute;
    right: 0;
    top: 5px;
    opacity: 0;
  }

  .contact-action-button {
    button {
      margin-right: 10px;
    }

    .custom-action-button {
      background: #F4F4F6;
      color: #62666E;
      border: none;
    }
  }

  .edit-form-popover{
    left: -251px !important;
    width: 300px;
  }
</style>
