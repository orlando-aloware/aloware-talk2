<template>
  <b-modal
    size="md"
    hide-header
    hide-footer
    centered
    data-testid="aloai-engagement-control-modal"
    v-model="isOpen"
    @hidden="onHidden"
    @shown="onShown"
  >
    <div class="p-2">
      <h1
        data-testid="aloai-engagement-control-modal-title"
        class="text-center mb-2"
      >
        Engagement Control
      </h1>
      <div class="text-center">
        Manage the engagement with the bots that you want to interact with this
        contact.
      </div>
      <div class="w-75 my-2 mx-auto">
        <search
          placeholder="Search bot"
          data-testid="aloai-engagement-control-modal-search"
          @search="onSearch"
        />
      </div>
      <b-form
        @submit.prevent="onSubmit"
        data-testid="aloai-engagement-control-modal-form"
        class="my-4"
      >
        <div class="p-1" v-if="isLoading">
          <template v-for="n in 5">
            <q-skeleton
              :key="`${n}-skeleton`"
              type="text"
              animation="fade"
              height="40px"
            />
          </template>
        </div>
        <ul
          class="list-group list-group-flush aloai-engagement-control-bots-list"
          v-else
        >
          <div v-if="!this.filteredBots.length" class="text-center py-2">
            No records to show.
          </div>
          <template v-else>
            <li
              v-for="(bot, key) in this.filteredBots"
              :key="`ec-bot-${key}`"
              class="list-group-item list-group-item-action p-2 d-flex items-center justify-between"
            >
              <label
                class="label mb-0 text-weight-bold flex-grow-1 cursor-pointer pr-4"
                :for="`engage-control-bot-${bot.id}`"
                >{{ bot.name }}</label
              >
              <b-form-checkbox
                switch
                v-model="bot_engagements[bot.id]"
                :id="`engage-control-bot-${bot.id}`"
                :value="true"
                :unchecked-value="false"
              />
            </li>
          </template>
        </ul>
      </b-form>
      <div class="d-flex items-center justify-center" style="gap: 15px">
        <b-button
          variant="outline"
          size="sm"
          class="custom-btn"
          data-testid="aloai-engagement-control-modal-close-button"
          @click="onHidden"
        >
          Cancel
        </b-button>
        <b-button
          variant="success"
          size="sm"
          class="custom-btn"
          :disabled="isBusy"
          data-testid="aloai-engagement-control-modal-enroll-contact-button"
          @click="onSubmit"
        >
          <q-spinner-bars v-if="isBusy" color="white" />
          Save changes
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters, mapState } from 'vuex'
import Search from 'src/components/search.vue'
import { isEmpty } from 'lodash'

export default {
  name: 'aloai-engagement-control-modal',

  components: { Search },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts'),
    filteredBots () {
      let bots = this.bots
      if (!isEmpty(this.searchText)) {
        bots = bots.filter((bot) =>
          bot.name.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      return bots.sort((a, b) =>
        a.name?.toUpperCase() > b.name?.toUpperCase() ? 1 : -1
      )
    }
  },

  data () {
    return {
      isBusy: false,
      isOpen: false,
      bots: [],
      bot_engagements: {},
      searchText: '',
      isLoading: true
    }
  },

  methods: {
    onSearch (searchText) {
      this.searchText = searchText
    },
    onSubmit (event) {
      event.preventDefault()
      this.isBusy = true

      const params = Object.keys(this.bot_engagements).map((k) => ({
        aloai_bot_id: k,
        is_engaged: this.bot_engagements[k]
      }))

      talk2Api.V2.aloAiBot
        .updateContactEngagements(this.contact.id, params)
        .then(() => {
          this.$generalNotification(
            'AloAi engagements for the contact have been updated.'
          )
          this.onHidden()
        })
        .catch((error) => {
          this.$generalNotification(
            'Error while updating engagements for the contact.',
            'error'
          )
          console.error('[onSubmit] error', error)
        })
        .finally(() => {
          this.isBusy = false
        })
    },
    onHidden () {
      this.isOpen = false
      setTimeout(() => {
        this.isBusy = true
        this.isLoading = true
        this.searchText = ''
      }, 300)
    },
    onShown () {
      this.load()
    },
    async load () {
      this.isLoading = true
      this.isBusy = true

      try {
        const [bots, contactDisengagedBots] = await Promise.all([
          this.fetchBots(),
          this.fetchContactDisengagedBots()
        ])

        this.bots = bots

        const disengagedBotIds = contactDisengagedBots?.reduce((acc, v) => {
          acc.push(v.aloai_bot_id)
          return acc
        }, [])

        for (const bot of this.bots) {
          this.bot_engagements[bot.id] = !disengagedBotIds.includes(bot.id)
        }

        this.isLoading = false
        this.isBusy = false
      } catch (error) {
        this.$generalNotification('Error while fetching AloAi Bots.', 'error')
        console.error('[loadBots] error', error)
        this.isLoading = false
        this.isBusy = false
      }
    },
    async fetchBots () {
      try {
        if (this.bots.length > 0) {
          return this.bots
        }
        const { data } = await talk2Api.V2.aloAiBot.getBots()
        return data?.data ?? []
      } catch (error) {
        console.error('[fetchBots] error', error)
        return []
      }
    },
    async fetchContactDisengagedBots () {
      try {
        const { data } = await talk2Api.V2.aloAiBot.getContactDisengagedBots(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactDisengagedBots] error', error)
        return []
      }
    }
  }
}
</script>

<style scoped>
.aloai-engagement-control-bots-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
