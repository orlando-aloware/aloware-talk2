<template>
  <div>
    <el-form ref="searchCar"
             class="p-3 border-bottom"
             label-position="top"
             :rules="rulesSearchCar"
             :model="searchCar"
             @submit.prevent.native="processSearchCar(contactId, true)">
      <el-form-item prop="q"
                    class="pb-0">
        <el-input placeholder="Search for model, make, vin, stock #"
                  prefix-icon="el-icon-search"
                  v-model="searchCar.q">
          <el-button slot="append"
                     type="submit"
                     @click="processSearchCar(contactId, true)">
            <i class="fa fa-search"></i>
          </el-button>
        </el-input>
      </el-form-item>

      <el-form-item label="Price range:"
                    class="pb-0 mb-0">
        <div class="pl-2 pr-2">
          <el-slider v-model="priceRange"
                     :min="0"
                     :max="100000"
                     :step="1000"
                     :format-tooltip="formatTooltip"
                     range
                     @change="updatePriceRange(contact_id)">
          </el-slider>
        </div>
      </el-form-item>
    </el-form>

    <div class="container-cars"
         v-infinite-scroll="load">
      <div class="row pb-3 mb-2"
           v-if="cars.length > 0"
           v-for="car in cars"
           :key="car.id">
        <div class="col-12">
          <el-card class="box-card">
            <div slot="header">
              <div class="row">
                <div class="col align-self-center">
                  <el-switch v-model="car.hide_price" active-text="Hide price?" class="align-self-center">
                  </el-switch>
                </div>
                <div class="col">
                  <el-button type="primary"
                             class="w-full"
                             @click="processSendCar(contactId, car, false)">
                    <b>Send Link</b>
                  </el-button>
                </div>
              </div>
            </div>
            <img :src="car.galleries[0].url"
                 v-if="car.galleries && car.galleries.length > 0 && car.galleries[0].url"
                 class="image img-responsive"/>
            <div class="p-2">
              <h5><span class="_600 d-flex">Vin #: {{ car.vin }}</span></h5>
              <b>Description:</b>
              <p>{{ car.description | truncate(100) }}</p>
              <b>Price:</b>
              <p>{{ car.price | toCurrency }}</p>
            </div>
          </el-card>
        </div>
      </div>
      <div v-if="loading"
           class="height-80"
           style="background-color: transparent"
           v-loading="true">
      </div>

      <div class="text-center"
           v-if="no_next && !loading && cars.length > 0">
        <strong class="text-success">
          <i class="fa fa-check-circle"></i> All data is loaded
        </strong>
      </div>

      <div v-if="pagination.total == 0 && !loading">
        <p class="text-center py-5 text-danger">
          No search result
          <span v-if="searchedTerm.length > 0">for "<strong>{{ searchedTerm }}</strong>"</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  aclMixin,
  formValidationMixin
} from 'src/plugins/mixins'
import {mapState} from 'vuex'
import _ from 'lodash'

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

  props: ['contactId', 'selectedCampaignId'],

  data() {
    return {
      loading: false,
      loadingBtn: false,
      loadingSend: false,
      showAdd: false,
      searchCar: searchCarDefault(),
      sendCar: sendCarDefault(),
      priceRange: [0, 100000],
      cars: [],
      rulesSearchCar: {},
      bulkMessageMode: false,
      pagination: {
        current_page: 1,
        total_pages: 100, // temp value
        total: 0
      },
      searchedTerm: ''
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    no_next: function () {
      return this.pagination.current_page >= this.pagination.total_pages
    }
  },

  mounted () {
    this.sendCar.campaign_id = this.selectedCampaignId
  },

  methods: {
    formatTooltip (val) {
      return this.$options.filters.toCurrency(val)
    },

    debouncedSearchCar: _.debounce(function (contactId) {
      this.processSearchCar(contactId, true)
    }, 500),

    changeCampaignId (val) {
      this.sendCar.campaign_id = val
      this.preValidateForm('searchCar')
    },

    processSearchCar (contactId, reset = false) {
      if (reset) {
        this.searchCar.page = 1
        this.pagination.total_pages = 100
        this.cars = []
      }

      if (!this.no_next) {
        this.loadingBtn = true
        this.loading = true

        this.searchCar.contact_id = contactId

        let url = `/integrations/simpsocial/cars`
        this.$axios.get(url, {
          params: this.searchCar
        }).then(res => {
          this.cars = _.concat(this.cars, res.data.data)
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
        this.processSearchCar(this.contact_id)
      }
    },

    startInventory (campaignId) {
      this.sendCar.campaign_id = campaignId
      this.showAdd = true

      // this.processSearchCar(this.contact_id)
    },

    updatePriceRange (contactId) {
      if (!this.priceRange || this.priceRange.length !== 2) {
        return
      }

      this.searchCar.price_min = this.priceRange[0]
      this.searchCar.price_max = this.priceRange[1]
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
          this.showAdd = false
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

    resetSendCar () {
      this.sendCar = sendCarDefault()
      this.searchCar = searchCarDefault()
      let formElement = _.get(this.$refs, 'searchCar', null)

      if (formElement) {
        formElement.clearValidate()
      }

      this.sendCar.campaign_id = this.selectedCampaignId
      this.cars = []
    },

    beforeCloseModal (done) {
      if (this.sendCar.body || this.sendCar.image_url) {
        this.$confirm('Are you sure you want to leave?', 'Warning', {
          confirmButtonText: 'Yes, Leave',
          cancelButtonText: 'No, Stay',
          customClass: 'width-500 fixed',
          type: 'warning'
        }).then(res => {
          this.resetSendCar()
          done()
        }).catch(() => {

        })
      } else {
        this.resetSendCar()
        done()
      }
    }
  },

  watch: {
    showAdd () {
      if (this.showAdd) {
        this.$emit('show')
      } else {
        this.$emit('hide')
      }
    }
  }
}
</script>
