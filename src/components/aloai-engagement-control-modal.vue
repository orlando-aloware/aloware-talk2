<template>
  <b-modal size="md"
           hide-header
           hide-footer
           centered
           data-testid="aloai-engagement-control-modal"
           v-model="isOpen"
           @hidden="onHidden"
           @shown="onShown">
    <div class="p-2">
      <h1 data-testid="aloai-engagement-control-modal-title"
          class="text-center mb-2">
        AloAi Agent Engagement
      </h1>
      <div class="text-center">
        Manage the agents that you want your contact to interact with. If an agent is disabled, it will no longer respond to this contact.
      </div>
      <div class="w-75 my-2 mx-auto">
        <search placeholder="Search agent"
                data-testid="aloai-engagement-control-modal-search"
                @search="onSearch"/>
      </div>
      <b-form data-testid="aloai-engagement-control-modal-form"
              class="mb-4"
              @submit.prevent="onSubmit">
        <div class="p-1"
             v-if="isLoading">
          <template v-for="n in 5">
            <q-skeleton type="text"
                        animation="fade"
                        height="40px"
                        :key="`${n}-skeleton`"/>
          </template>
        </div>
        <ul class="list-group list-group-flush aloai-engagement-control-bots-list"
            v-else>
          <div class="text-center py-2"
               v-if="!this.filteredBots.length">
            No records to show.
          </div>
          <template v-else>
            <li class="list-group-item list-group-item-action p-2 d-flex items-center justify-between"
                :key="`ec-bot-${key}`"
                v-for="(bot, key) in this.filteredBots">
              <label class="label mb-0 text-weight-bold flex-grow-1 cursor-pointer pr-4"
                     :for="`engage-control-bot-${bot.id}`">
                <div class="row">
                  <div class="col-3 p-0 text-center d-flex items-center justify-between">
                    <!-- Bot Use Case Label -->
                    <q-badge class="w-100" :color="directionColor(bot.direction)">
                      <span class="w-100">{{ formatDirection(bot.direction) }}</span>
                    </q-badge>
                  </div>
                  <div class="col-9">
                    <span>{{ bot.name }}</span>
                  </div>
                </div>
              </label>
              <b-form-checkbox switch
                              :id="`engage-control-bot-${bot.id}`"
                              :value="true"
                              :unchecked-value="false"
                              v-model="bot_engagements[bot.id]"/>
            </li>
          </template>
        </ul>
      </b-form>
      <div class="d-flex items-center justify-center" style="gap: 15px">
        <button class="btn btn-sm btn-outline-dark mr-2"
                data-testid="aloai-engagement-control-modal-close-button"
                @click="onHidden">
          Cancel
        </button>
        <button class="btn btn-sm bg-primary text-white mr-2"
                data-testid="aloai-engagement-control-modal-enroll-contact-button"
                :disabled="isBusy"
                @click="onSubmit">
          Save changes
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters } from 'vuex'
import Search from 'src/components/search.vue'
import { isEmpty } from 'lodash'
import { aloaiMixin } from 'src/plugins/mixins'
import * as AloAi from 'src/constants/aloai'

export default {
  name: 'aloai-engagement-control-modal',

  components: { Search },

  mixins: [aloaiMixin],

  computed: {
    ...mapGetters('contacts', ['contact']),
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
      isLoading: true,
      selectedBotId: null,
      AloAi
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
        this.selectedBotId = null
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
        this.$generalNotification('Error while fetching AloAi Agents.', 'error')
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
        const { data } = await talk2Api.V2.aloAiBot.getBots({
          enabled: true
        })
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
