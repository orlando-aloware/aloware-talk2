<template>
  <div class="new-car-container">
    <b-form @submit.prevent="search">
      <h5 class="mb-1 section-header fs-24 text-bold _600 text-center">Send a Car</h5>

      <q-separator />

      <div class="scrollable pt-2">
        <b-form-row class="mt-2">
          <b-col sm="12" md="12">
            <b-form-group class="mb-1">
              <search ref="search"
                      placeholder="Search for model, make, vin, stock #"
                      :search="searchCar.q"
                      :disabled="loading"
                      @search="search">
              </search>
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-2 mx-0 w-100">
          <b-col sm="12" md="12">
            <b-form-group label="Price range"
                          class="mb-1">
              <div class="pl-2 pr-2">
                <q-range v-model="priceRange"
                         :min="0"
                         :max="100000"
                         :step="1000"
                         :left-label-value="`$${$options.filters.numFormat(priceRange.min)}`"
                         :right-label-value="`$${$options.filters.numFormat(priceRange.max)}`"
                         label
                         @change="updatePriceRange(contactId)">
                </q-range>
              </div>
            </b-form-group>
          </b-col>
        </b-form-row>
      </div>
    </b-form>

    <q-separator />

    <div ref="containerCars"
         class="container-cars position-relative mt-3 h-100"
         :infinite-scroll-distance="1"
         v-infinite-scroll="load">
      <b-overlay class="h-100 w-100 position-absolute"
                 rounded="sm"
                 :show="true"
                 v-show="loading && cars.length === 0">
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px" />
        </template>
      </b-overlay>
      <div v-if="cars.length > 0">
        <div class="row pb-3 mb-2"
             v-for="car in cars"
             :key="car.id">
          <div class="col-12">
            <q-card class="box-card">
              <q-card-section>
                <div class="d-flex justify-content-between">
                  <div class="d-inline-flex">
                    <label class="text-primary mr-2 mt-2 cursor-pointer"
                           :class="{ disabled: (loadingBtn || $route.params.id === 'unassigned') }">Hide price?</label>
                    <b-form-checkbox
                      id="my-contacts"
                      class="mt-2 cursor-pointer"
                      name="check-button"
                      size="sm"
                      switch
                      v-model="car.hide_price"
                    >
                    </b-form-checkbox>
                  </div>
                  <div>
                    <b-button href="#"
                              variant="outline-primary"
                              size="sm"
                              class="mr-1"
                              :disabled="loadingBtn"
                              @click="processSendCar(contactId, car, false)">
                      Send Link
                    </b-button>
                  </div>
                </div>
              </q-card-section>
              <q-card-section>
                <img :src="car.galleries[0].url"
                     v-if="car.galleries && car.galleries.length > 0 && car.galleries[0].url"
                     class="image w-100"/>
                <div class="p-2">
                  <h5><span class="_600 d-flex">Vin #: {{ car.vin }}</span></h5>
                  <b>Description:</b>
                  <p>{{ car.description | truncate(100) }}</p>
                  <b>Price:</b>
                  <p>{{ car.price | toCurrency }}</p>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="text-center"
           v-if="noNext && !loading && cars.length > 0">
        <strong class="text-success">
          <i class="fa fa-check-circle"></i> All data is loaded
        </strong>
      </div>

      <div v-if="pagination.total === 0 && !loading">
        <p class="text-center py-5 text-danger">
          No search result
          <span v-if="searchedTerm.length > 0">for "<strong>{{ searchedTerm }}</strong>"</span>
        </p>
      </div>

      <div class="infinite-scroll-loading w-100 d-flex justify-center"
           v-if="cars.length > 0 && loading">
        <q-spinner-bars color="primary"
                        size="30px" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  aclMixin,
  formValidationMixin
} from 'src/plugins/mixins'
import Search from 'components/search'
import { mapState } from 'vuex'
import { concat, debounce, get, uniqBy } from 'lodash'

const sendCarDefault = () => {
  return {
    campaign_id: null,
    body: '',
    image_url: ''
  }
}

const searchCarDefault = () => {
  return {
    q: '',
    page: 0,
    page_size: 20,
    price_min: 0,
    price_max: 500000
  }
}

export default {
  mixins: [
    aclMixin,
    formValidationMixin
  ],

  props: {
    contactId: {
      required: true
    },

    selectedCampaignId: {
      required: true
    }
  },

  components: {
    Search
  },

  data () {
    return {
      loading: false,
      loadingBtn: false,
      loadingSend: false,
      showAdd: false,
      searchCar: searchCarDefault(),
      sendCar: sendCarDefault(),
      priceRange: {
        min: 0,
        max: 100000
      },
      cars: [],
      bulkMessageMode: false,
      pagination: {
        current_page: 1,
        total_pages: 100, // temp value
        total: 0
      },
      searchedTerm: '',
      confirmDialogParams: {
        okTitle: 'Ok',
        cancelTitle: 'Cancel',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'primary',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: true
      }
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    noNext: function () {
      return this.pagination.current_page >= this.pagination.total_pages
    }
  },

  mounted () {
    this.sendCar.campaign_id = this.selectedCampaignId
    this.startInventory(this.selectedCampaignId)
  },

  methods: {
    debouncedSearchCar: debounce(function (contactId) {
      this.processSearchCar(contactId, true)
    }, 500),

    changeCampaignId (val) {
      this.sendCar.campaign_id = val
      this.preValidateForm('searchCar')
    },

    search (text = null) {
      if (text && typeof text === 'string') {
        this.searchCar.q = text
      } else {
        this.searchCar.q = this.$refs.search.searchValue
      }

      this.processSearchCar(this.contactId, true)
    },

    processSearchCar (contactId, reset = false) {
      if (reset) {
        this.resetSearch()
      }

      if (!this.noNext) {
        this.loadingBtn = true
        this.loading = true

        setTimeout(() => {
          this.scrollDown()
        }, 50)

        this.searchCar.contact_id = contactId

        let url = `/integrations/simpsocial/cars`
        this.$axios.get(url, {
          params: this.searchCar
        }).then(res => {
          this.cars = concat(this.cars, res.data.data)
          this.cars = uniqBy(this.cars, 'id')
          this.loading = false
          this.pagination = res.data.pagination
          this.searchCar.page = res.data.pagination.current_page
          this.searchedTerm = this.searchCar.q
        }).catch(err => {
          this.$handleErrors(err.response)
        }).then(_ => {
          this.loadingBtn = false
        })
      }
    },

    load () {
      if (!this.loading) {
        this.searchCar.page += 1
        this.processSearchCar(this.contactId)
      }
    },

    startInventory (campaignId) {
      this.sendCar.campaign_id = campaignId
      this.showAdd = true
    },

    updatePriceRange (contactId) {
      if (!this.priceRange) {
        return
      }

      this.searchCar.price_min = this.priceRange.min
      this.searchCar.price_max = this.priceRange.max
      this.processSearchCar(contactId, true)
    },

    processSendCar (contactId, car, hasCreditApplication = false) {
      // Send to contact when not bulked_message_mode
      if (!this.bulkMessageMode) {
        this.loadingBtn = true
        let url = `/api/v1/contact/${contactId}/send-car`
        if (car.galleries && car.galleries.length > 0 && car.galleries[0].url) {
          this.sendCar.image_url = car.galleries[0].url
        }

        this.sendCar.body = this.$options.filters.truncate(car.description, 100)
        this.sendCar.agent_link = car.agent_link
        this.sendCar.has_credit_link = hasCreditApplication
        this.sendCar.hide_price = car.hide_price

        this.$axios.post(url, this.sendCar).then(res => {
          this.$emit('success', res.data)
          this.resetSendCar()
        }).catch(err => {
          this.$handleErrors(err.response)
        }).then(_ => {
          this.loadingBtn = false
        })
      } else {
        this.$emit('send-car', car)
        this.showAdd = false
        this.loadingBtn = false
      }
    },

    resetSearch () {
      this.searchCar.page = 1
      this.pagination.total_pages = 100
      this.cars = []
    },

    resetSendCar () {
      this.sendCar = sendCarDefault()
      this.searchCar = searchCarDefault()
      let formElement = get(this.$refs, 'searchCar', null)

      if (formElement) {
        formElement.clearValidate()
      }

      this.sendCar.campaign_id = this.selectedCampaignId
      this.cars = []
    },

    beforeCloseModal () {
      if (this.sendCar.body || this.sendCar.image_url) {
        this.$bvModal.msgBoxConfirm('Are you sure you want to leave?', {
          ...this.confirmDialogParams,
          title: 'Confirmation',
          okTitle: 'Yes, Leave',
          cancelTitle: 'No, Stay',
          modalClass: 'newCarMsgBox'
        })
          .then(value => {
            if (value) {
              this.resetSendCar()
              this.$emit('newCarMenuClose')
              return
            }
            this.$emit('preventNewCarMenuClose')
          })

        setTimeout(() => {
          document.querySelector('.newCarMsgBox')
            .parentNode.classList.add('z-index-9999')
        }, 50)
      } else {
        this.resetSendCar()
        this.$emit('newCarMenuClose')
      }
    },

    scrollDown () {
      const container = this.$refs.containerCars
      container.scrollTop = container.scrollHeight
    }
  },

  watch: {
    selectedCampaignId () {
      this.sendCar.campaign_id = this.selectedCampaignId
    }
  }
}
</script>
